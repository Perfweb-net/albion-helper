<?php

namespace App\Repository;

use App\Entity\ItemMarketData;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ItemMarketDataRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ItemMarketData::class);
    }

    public function findByItemAndQuality(string $uniqueName, int $quality): ?ItemMarketData
    {
        return $this->findOneBy(['uniqueName' => $uniqueName, 'quality' => $quality]);
    }
}
