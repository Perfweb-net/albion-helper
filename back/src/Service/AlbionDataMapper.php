<?php

namespace App\Service;

/**
 * Allège les objets renvoyés par l'API gameinfo d'Albion.
 *
 * Les events bruts pèsent plusieurs Ko chacun (LifetimeStatistics, Inventory…).
 * On ne conserve que ce qui est utilisé par le front : identité, guilde/alliance,
 * équipement et — pour les participants — dégâts et soins.
 */
final class AlbionDataMapper
{
    private const EQUIPMENT_SLOTS = [
        'MainHand', 'OffHand', 'Head', 'Armor', 'Shoes', 'Bag', 'Cape', 'Mount', 'Potion', 'Food',
    ];

    /** Réduit un bloc d'équipement à { slot: {type, quality, count} } (slots vides ignorés). */
    public static function equipment(?array $equipment): array
    {
        $out = [];
        foreach (self::EQUIPMENT_SLOTS as $slot) {
            $item = $equipment[$slot] ?? null;
            if (is_array($item) && !empty($item['Type'])) {
                $out[$slot] = [
                    'type' => $item['Type'],
                    'quality' => $item['Quality'] ?? 0,
                    'count' => $item['Count'] ?? 1,
                ];
            }
        }
        return $out;
    }

    /** Identité simplifiée d'un joueur (killer / victime / participant). */
    public static function player(?array $p, bool $withContribution = false): ?array
    {
        if (!is_array($p)) {
            return null;
        }
        $out = [
            'id' => $p['Id'] ?? null,
            'name' => $p['Name'] ?? '?',
            'guildName' => $p['GuildName'] ?? null,
            'guildId' => $p['GuildId'] ?? null,
            'allianceName' => $p['AllianceName'] ?? null,
            'allianceTag' => $p['AllianceTag'] ?? null,
            'itemPower' => isset($p['AverageItemPower']) ? round($p['AverageItemPower']) : null,
            'equipment' => self::equipment($p['Equipment'] ?? null),
        ];
        if ($withContribution) {
            $out['damageDone'] = round($p['DamageDone'] ?? 0);
            $out['healingDone'] = round($p['SupportHealingDone'] ?? 0);
        }
        return $out;
    }

    /** Event de kill simplifié, avec la liste des participants. */
    public static function event(array $e): array
    {
        $participants = array_map(
            static fn($p) => self::player($p, true),
            $e['Participants'] ?? []
        );

        return [
            'eventId' => $e['EventId'] ?? null,
            'timestamp' => $e['TimeStamp'] ?? null,
            'fame' => $e['TotalVictimKillFame'] ?? 0,
            'battleId' => $e['BattleId'] ?? null,
            'groupSize' => $e['groupMemberCount'] ?? count($e['GroupMembers'] ?? []),
            'participantCount' => $e['numberOfParticipants'] ?? count($participants),
            'location' => $e['KillArea'] ?? $e['Location'] ?? null,
            'killer' => self::player($e['Killer'] ?? null),
            'victim' => self::player($e['Victim'] ?? null),
            'participants' => $participants,
        ];
    }

    /** @param array $events liste brute d'events */
    public static function events(array $events): array
    {
        return array_map(static fn($e) => self::event($e), $events);
    }
}
