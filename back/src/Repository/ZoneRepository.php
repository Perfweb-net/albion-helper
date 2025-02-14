<?php

namespace App\Repository;

use App\Entity\Zone;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Zone>
 */
class ZoneRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Zone::class);
    }

    /**
     * Recherche une zone par son nom
     */
    public function findByName(string $name): ?Zone
    {
        return $this->createQueryBuilder('z')
            ->andWhere('z.name = :name')
            ->setParameter('name', $name)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function searchName(string $input): array
    {
        return $this->createQueryBuilder('z')
            ->where('LOWER(z.name) LIKE LOWER(:input)')
            ->setParameter('input', '%' . mb_strtolower($input) . '%') // Conversion en minuscule
            ->orderBy('z.name', 'ASC') // Optionnel : tri alphabétique
            ->getQuery()
            ->getResult();
    }
}