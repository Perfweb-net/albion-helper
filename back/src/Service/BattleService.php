<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Batailles ZvZ : l'API gameinfo regroupe déjà les events en « battles »
 * selon un timeout (≈ 10 min sans kill = nouvelle bataille). On expose ce
 * regroupement, filtré par guilde ou alliance, et on calcule un classement.
 */
class BattleService
{
    public function __construct(
        private readonly HttpClientInterface $client
    ) {
    }

    /** Recherche guildes + alliances par nom. */
    public function search(string $query, ?string $server = null): array
    {
        $data = $this->client
            ->request('GET', ServerRegion::gameinfo($server) . 'search?q=' . urlencode($query))
            ->toArray();

        return [
            'guilds' => array_map(static fn($g) => [
                'id' => $g['Id'] ?? null,
                'name' => $g['Name'] ?? '?',
                'allianceTag' => $g['AllianceName'] ?? null,
            ], $data['guilds'] ?? []),
            'alliances' => array_map(static fn($a) => [
                'id' => $a['Id'] ?? null,
                'name' => $a['Name'] ?? ($a['AllianceTag'] ?? '?'),
                'tag' => $a['AllianceTag'] ?? null,
            ], $data['alliances'] ?? []),
        ];
    }

    /**
     * Liste des batailles, filtrée par guilde ou alliance.
     *
     * @param string      $range      day | week | month
     * @param string|null $guildId    filtre guilde
     * @param string|null $allianceId filtre alliance
     */
    public function listBattles(
        string $range = 'week',
        ?string $guildId = null,
        ?string $allianceId = null,
        int $limit = 20,
        int $offset = 0,
        ?string $server = null
    ): array {
        $range = in_array($range, ['day', 'week', 'month'], true) ? $range : 'week';
        $query = [
            'range' => $range,
            'limit' => max(1, min(50, $limit)),
            'offset' => max(0, $offset),
            'sort' => 'recent',
        ];
        if ($guildId) {
            $query['guildId'] = $guildId;
        }
        if ($allianceId) {
            $query['allianceId'] = $allianceId;
        }

        $battles = $this->client
            ->request('GET', ServerRegion::gameinfo($server) . 'battles?' . http_build_query($query))
            ->toArray();

        return array_map([$this, 'summarizeBattle'], $battles);
    }

    /**
     * Détail d'une bataille : events + classements joueurs et factions.
     */
    public function getBattleDetail(int $battleId, ?string $server = null): array
    {
        $rawEvents = $this->fetchBattleEvents($battleId, $server);

        $players = [];
        $factions = [];

        $register = static function (array &$bucket, ?string $key, string $name, ?string $extra = null) {
            $key = $key ?: $name;
            if (!isset($bucket[$key])) {
                $bucket[$key] = [
                    'id' => $key,
                    'name' => $name,
                    'extra' => $extra,
                    'kills' => 0,
                    'deaths' => 0,
                    'fame' => 0.0,
                    'damageDone' => 0.0,
                    'healingDone' => 0.0,
                ];
            }
            return $key;
        };

        foreach ($rawEvents as $e) {
            $fame = $e['TotalVictimKillFame'] ?? 0;
            $killer = $e['Killer'] ?? [];
            $victim = $e['Victim'] ?? [];

            // Joueur — kill crédité au tueur
            $kKey = $register($players, $killer['Id'] ?? null, $killer['Name'] ?? '?', $killer['GuildName'] ?? null);
            $players[$kKey]['kills']++;
            $players[$kKey]['fame'] += $fame;

            // Joueur — mort créditée à la victime
            $vKey = $register($players, $victim['Id'] ?? null, $victim['Name'] ?? '?', $victim['GuildName'] ?? null);
            $players[$vKey]['deaths']++;

            // Contribution des participants (dégâts / soins)
            foreach ($e['Participants'] ?? [] as $p) {
                $pKey = $register($players, $p['Id'] ?? null, $p['Name'] ?? '?', $p['GuildName'] ?? null);
                $players[$pKey]['damageDone'] += $p['DamageDone'] ?? 0;
                $players[$pKey]['healingDone'] += $p['SupportHealingDone'] ?? 0;
            }

            // Factions (guildes) — kills / morts / fame
            $kGuild = $register($factions, $killer['GuildId'] ?? null, $killer['GuildName'] ?? 'Sans guilde', $killer['AllianceName'] ?? null);
            $factions[$kGuild]['kills']++;
            $factions[$kGuild]['fame'] += $fame;
            $vGuild = $register($factions, $victim['GuildId'] ?? null, $victim['GuildName'] ?? 'Sans guilde', $victim['AllianceName'] ?? null);
            $factions[$vGuild]['deaths']++;
        }

        $round = static function (array $list): array {
            foreach ($list as &$row) {
                $row['fame'] = round($row['fame']);
                $row['damageDone'] = round($row['damageDone']);
                $row['healingDone'] = round($row['healingDone']);
            }
            return array_values($list);
        };

        $players = $round($players);
        $factions = $round($factions);

        usort($players, static fn($a, $b) => $b['kills'] <=> $a['kills'] ?: $b['fame'] <=> $a['fame']);
        usort($factions, static fn($a, $b) => $b['kills'] <=> $a['kills'] ?: $b['fame'] <=> $a['fame']);

        return [
            'battleId' => $battleId,
            'killCount' => count($rawEvents),
            'totalFame' => array_sum(array_map(static fn($e) => $e['TotalVictimKillFame'] ?? 0, $rawEvents)),
            'mvp' => [
                'topKiller' => $players[0] ?? null,
                'topFame' => self::topBy($players, 'fame'),
                'topDamage' => self::topBy($players, 'damageDone'),
                'topHealer' => self::topBy($players, 'healingDone'),
            ],
            'players' => $players,
            'factions' => $factions,
            'events' => AlbionDataMapper::events(array_slice($rawEvents, 0, 50)),
        ];
    }

    /**
     * Récupère tous les events d'une bataille. L'API plafonne limit à 51 :
     * on pagine jusqu'à 6 pages (≈ 300 kills, suffisant pour un ZvZ).
     */
    private function fetchBattleEvents(int $battleId, ?string $server = null): array
    {
        $base = ServerRegion::gameinfo($server);
        $all = [];
        $page = 51;
        for ($offset = 0; $offset < 6 * $page; $offset += $page) {
            $batch = $this->client
                ->request('GET', sprintf('%sevents/battle/%d?limit=%d&offset=%d', $base, $battleId, $page, $offset))
                ->toArray();
            $all = array_merge($all, $batch);
            if (count($batch) < $page) {
                break;
            }
        }
        return $all;
    }

    /** Résumé d'une bataille pour l'affichage en liste. */
    private function summarizeBattle(array $b): array
    {
        $guilds = array_map(static fn($g) => [
            'name' => $g['name'] ?? '?',
            'kills' => $g['kills'] ?? 0,
            'deaths' => $g['deaths'] ?? 0,
            'players' => $g['players'] ?? 0,
        ], $b['guilds'] ?? []);
        usort($guilds, static fn($a, $z) => $z['kills'] <=> $a['kills']);

        return [
            'id' => $b['id'] ?? null,
            'startTime' => $b['startTime'] ?? null,
            'endTime' => $b['endTime'] ?? null,
            'totalKills' => $b['totalKills'] ?? 0,
            'totalFame' => $b['totalFame'] ?? 0,
            'playerCount' => is_array($b['players'] ?? null) ? count($b['players']) : ($b['players'] ?? 0),
            'clusterName' => $b['clusterName'] ?? null,
            'guilds' => array_slice($guilds, 0, 6),
            'allianceCount' => is_array($b['alliances'] ?? null) ? count($b['alliances']) : 0,
        ];
    }

    /** @return array|null l'entrée avec la plus grande valeur pour $field (si > 0) */
    private static function topBy(array $players, string $field): ?array
    {
        $best = null;
        foreach ($players as $p) {
            if (($p[$field] ?? 0) > 0 && ($best === null || $p[$field] > $best[$field])) {
                $best = $p;
            }
        }
        return $best;
    }
}
