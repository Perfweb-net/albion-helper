<?php

namespace App\Repository;

use App\Entity\CraftingRecipe;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CraftingRecipeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CraftingRecipe::class);
    }

    public function findByCategory(string $category): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.ingredients', 'i')
            ->addSelect('i')
            ->where('r.category = :cat')
            ->setParameter('cat', $category)
            ->orderBy('r.tier', 'ASC')
            ->addOrderBy('r.uniqueName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findAllWithIngredients(): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.ingredients', 'i')
            ->addSelect('i')
            ->orderBy('r.category', 'ASC')
            ->addOrderBy('r.tier', 'ASC')
            ->addOrderBy('r.uniqueName', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
