<?php

namespace App\Repository;

use App\Entity\CraftingRecipeIngredient;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CraftingRecipeIngredientRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CraftingRecipeIngredient::class);
    }
}
