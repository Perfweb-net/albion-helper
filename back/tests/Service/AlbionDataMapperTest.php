<?php

namespace App\Tests\Service;

use App\Service\AlbionDataMapper;
use PHPUnit\Framework\TestCase;

class AlbionDataMapperTest extends TestCase
{
    public function testEquipmentKeepsFilledSlotsOnly(): void
    {
        $raw = [
            'MainHand' => ['Type' => 'T7_2H_CLAYMORE', 'Quality' => 3, 'Count' => 1],
            'OffHand' => null,
            'Food' => ['Type' => 'T6_MEAL_OMELETTE', 'Quality' => 1, 'Count' => 5],
        ];

        $out = AlbionDataMapper::equipment($raw);

        $this->assertArrayHasKey('MainHand', $out);
        $this->assertArrayNotHasKey('OffHand', $out);
        $this->assertSame('T7_2H_CLAYMORE', $out['MainHand']['type']);
        $this->assertSame(3, $out['MainHand']['quality']);
        $this->assertSame(5, $out['Food']['count']);
    }

    public function testPlayerStripsHeavyFieldsAndKeepsContribution(): void
    {
        $raw = [
            'Id' => 'abc',
            'Name' => 'Tueur',
            'GuildName' => 'MaGuilde',
            'AverageItemPower' => 1234.7,
            'Equipment' => ['Head' => ['Type' => 'T8_HEAD_PLATE_SET1', 'Quality' => 2]],
            'DamageDone' => 4210.9,
            'SupportHealingDone' => 0,
            'LifetimeStatistics' => ['huge' => 'payload'],
            'Inventory' => [1, 2, 3],
        ];

        $simple = AlbionDataMapper::player($raw, true);

        $this->assertSame('Tueur', $simple['name']);
        $this->assertEquals(1235, $simple['itemPower']); // round() -> float
        $this->assertEquals(4211, $simple['damageDone']);
        $this->assertArrayNotHasKey('LifetimeStatistics', $simple);
        $this->assertArrayNotHasKey('Inventory', $simple);
        $this->assertArrayHasKey('Head', $simple['equipment']);
    }

    public function testPlayerReturnsNullForMissingData(): void
    {
        $this->assertNull(AlbionDataMapper::player(null));
    }

    public function testEventExposesGroupAndParticipants(): void
    {
        $raw = [
            'EventId' => 42,
            'TimeStamp' => '2026-06-14T01:00:00',
            'TotalVictimKillFame' => 309876,
            'BattleId' => 999,
            'groupMemberCount' => 5,
            'numberOfParticipants' => 5,
            'Killer' => ['Id' => 'k', 'Name' => 'Killer', 'Equipment' => []],
            'Victim' => ['Id' => 'v', 'Name' => 'Victim', 'Equipment' => []],
            'Participants' => [
                ['Id' => 'k', 'Name' => 'Killer', 'DamageDone' => 100, 'Equipment' => []],
                ['Id' => 'x', 'Name' => 'Mate', 'DamageDone' => 50, 'Equipment' => []],
            ],
        ];

        $event = AlbionDataMapper::event($raw);

        $this->assertSame(42, $event['eventId']);
        $this->assertSame(309876, $event['fame']);
        $this->assertSame(5, $event['groupSize']);
        $this->assertCount(2, $event['participants']);
        $this->assertEquals(100, $event['participants'][0]['damageDone']);
        $this->assertSame('Killer', $event['killer']['name']);
    }
}
