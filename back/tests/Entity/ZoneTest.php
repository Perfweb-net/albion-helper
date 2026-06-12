<?php

namespace App\Tests\Entity;

use App\Entity\Zone;
use PHPUnit\Framework\TestCase;

class ZoneTest extends TestCase
{
    public function testZoneEntity(): void
    {
        $zone = new Zone();
        $zone->setName('Test Zone');
        $zone->setTier(4);
        $zone->setType('Blue');
        $zone->setColor('#0000FF');

        $this->assertEquals('Test Zone', $zone->getName());
        $this->assertEquals(4, $zone->getTier());
        $this->assertEquals('Blue', $zone->getType());
        $this->assertEquals('#0000FF', $zone->getColor());
    }
}
