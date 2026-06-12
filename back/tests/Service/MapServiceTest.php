<?php

namespace App\Tests\Service;

use App\Entity\Zone;
use App\Repository\ZoneRepository;
use App\Service\MapService;
use PHPUnit\Framework\TestCase;
use Doctrine\Common\Collections\ArrayCollection;

class MapServiceTest extends TestCase
{
    public function testSearchMaps(): void
    {
        $zoneRepository = $this->createMock(ZoneRepository::class);
        
        $zone = new Zone();
        $zone->setName('Martlock');
        $zone->setTier(4);
        $zone->setType('Blue');
        $zone->setColor('#0000FF');
        $zone->setMarkers(new ArrayCollection());
        $zone->setResources(new ArrayCollection());
        $zone->setMobs(new ArrayCollection());

        $zoneRepository->expects($this->once())
            ->method('searchName')
            ->with('Martlock')
            ->willReturn([$zone]);

        $mapService = new MapService($zoneRepository);
        $result = $mapService->searchMaps('Martlock');

        $this->assertCount(1, $result);
        $this->assertEquals('Martlock', $result[0]['name']);
        $this->assertEquals('Blue', $result[0]['type']);
    }
}
