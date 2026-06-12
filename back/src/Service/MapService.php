<?php

namespace App\Service;

use App\Repository\ZoneRepository;
use App\Entity\Zone;

class MapService
{
    public function __construct(
        private readonly ZoneRepository $zoneRepository
    ) {
    }

    /**
     * Search for maps and return a structured array for the API.
     * 
     * @param string|null $search
     * @return array
     */
    public function autocompleteZones(string $q): array
    {
        if (strlen($q) < 2) {
            return [];
        }
        $zones = $this->zoneRepository->searchName($q);
        return array_map(fn(Zone $z) => $z->getName(), array_slice($zones, 0, 20));
    }

    public function searchMaps(?string $search): array
    {
        $maps = $this->zoneRepository->searchName($search);

        return array_map(function (Zone $map) {
            return [
                'name' => $map->getName(),
                'tier' => $map->getTier(),
                'type' => $map->getType(),
                'color' => $map->getColor(),
                'zoneInfo' => [
                    'markers' => array_map(fn($marker) => [
                        'name' => $marker->getName(),
                        'posX' => $marker->getPosX(),
                        'posY' => $marker->getPosY()
                    ], $map->getMarkers()->toArray()),

                    'resources' => array_map(fn($resource) => [
                        'name' => $resource->getName(),
                        'tier' => $resource->getTier(),
                        'count' => $resource->getCount()
                    ], $map->getResources()->toArray()),

                    'mobs' => array_map(fn($mob) => [
                        'name' => $mob->getName(),
                        'tier' => $mob->getTier(),
                        'count' => $mob->getCount()
                    ], $map->getMobs()->toArray())
                ]
            ];
        }, $maps);
    }
}
