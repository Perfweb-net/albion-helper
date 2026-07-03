<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class PlayerService
{
    public function __construct(
        private readonly HttpClientInterface $client
    ) {
    }

    public function search(string $pseudo, ?string $server = null): array
    {
        $response = $this->client->request('GET', ServerRegion::gameinfo($server) . 'search?q=' . urlencode($pseudo));
        return $response->toArray();
    }

    public function getPlayerData(string $id, ?string $server = null): array
    {
        $response = $this->client->request('GET', ServerRegion::gameinfo($server) . 'players/' . $id);
        return $response->toArray();
    }

    /** Historique des kills (events simplifiés). */
    public function getKills(string $id, int $limit = 20, int $offset = 0, ?string $server = null): array
    {
        return AlbionDataMapper::events($this->fetchEvents($id, 'kills', $limit, $offset, $server));
    }

    /** Historique des morts (events simplifiés). */
    public function getDeaths(string $id, int $limit = 20, int $offset = 0, ?string $server = null): array
    {
        return AlbionDataMapper::events($this->fetchEvents($id, 'deaths', $limit, $offset, $server));
    }

    /**
     * Rapport de session : agrège kills et morts d'un joueur (et de son groupe)
     * pour produire des totaux et un classement des coéquipiers.
     *
     * @param int $limit nombre de kills/morts à analyser (max 50)
     */
    public function getSessionReport(string $id, int $limit = 50, ?string $server = null): array
    {
        $limit = max(1, min(50, $limit));
        $kills = $this->fetchEvents($id, 'kills', $limit, 0, $server);
        $deaths = $this->fetchEvents($id, 'deaths', $limit, 0, $server);

        $killFame = array_sum(array_map(static fn($e) => $e['TotalVictimKillFame'] ?? 0, $kills));
        $deathFame = array_sum(array_map(static fn($e) => $e['TotalVictimKillFame'] ?? 0, $deaths));

        // Classement des coéquipiers : tout joueur ayant participé à un de nos kills.
        $roster = [];
        foreach ($kills as $event) {
            foreach ($event['Participants'] ?? [] as $p) {
                $pid = $p['Id'] ?? null;
                if (!$pid) {
                    continue;
                }
                if (!isset($roster[$pid])) {
                    $roster[$pid] = [
                        'id' => $pid,
                        'name' => $p['Name'] ?? '?',
                        'guildName' => $p['GuildName'] ?? null,
                        'kills' => 0,
                        'damageDone' => 0.0,
                        'healingDone' => 0.0,
                    ];
                }
                $roster[$pid]['kills']++;
                $roster[$pid]['damageDone'] += $p['DamageDone'] ?? 0;
                $roster[$pid]['healingDone'] += $p['SupportHealingDone'] ?? 0;
            }
        }
        foreach ($roster as &$r) {
            $r['damageDone'] = round($r['damageDone']);
            $r['healingDone'] = round($r['healingDone']);
        }
        unset($r);

        usort($roster, static fn($a, $b) => $b['kills'] <=> $a['kills'] ?: $b['damageDone'] <=> $a['damageDone']);

        // Meilleur kill (fame la plus élevée).
        $bestKill = null;
        foreach ($kills as $event) {
            if ($bestKill === null || ($event['TotalVictimKillFame'] ?? 0) > ($bestKill['TotalVictimKillFame'] ?? 0)) {
                $bestKill = $event;
            }
        }

        $timestamps = array_map(
            static fn($e) => $e['TimeStamp'] ?? null,
            array_merge($kills, $deaths)
        );
        $timestamps = array_filter($timestamps);
        sort($timestamps);

        return [
            'player' => [
                'id' => $id,
                'name' => $kills[0]['Killer']['Name'] ?? $deaths[0]['Victim']['Name'] ?? null,
            ],
            'totals' => [
                'kills' => count($kills),
                'deaths' => count($deaths),
                'killFame' => $killFame,
                'deathFame' => $deathFame,
                'netFame' => $killFame - $deathFame,
                'kd' => count($deaths) > 0 ? round(count($kills) / count($deaths), 2) : count($kills),
            ],
            'window' => [
                'from' => $timestamps[0] ?? null,
                'to' => end($timestamps) ?: null,
                'analyzed' => $limit,
            ],
            'roster' => array_values($roster),
            'bestKill' => $bestKill ? AlbionDataMapper::event($bestKill) : null,
        ];
    }

    /** Appel brut à l'API gameinfo (kills | deaths). */
    private function fetchEvents(string $id, string $type, int $limit, int $offset, ?string $server = null): array
    {
        $limit = max(1, min(50, $limit));
        $url = sprintf('%splayers/%s/%s?limit=%d&offset=%d', ServerRegion::gameinfo($server), $id, $type, $limit, max(0, $offset));
        return $this->client->request('GET', $url)->toArray();
    }
}
