<?php

namespace App\Entity;

use App\Repository\CraftingRecipeIngredientRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CraftingRecipeIngredientRepository::class)]
#[ORM\Table(name: 'crafting_recipe_ingredient')]
class CraftingRecipeIngredient
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: CraftingRecipe::class, inversedBy: 'ingredients')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private CraftingRecipe $recipe;

    #[ORM\Column(length: 255)]
    private string $uniqueName;

    #[ORM\Column(type: 'smallint')]
    private int $amount;

    public function getId(): ?int { return $this->id; }

    public function getRecipe(): CraftingRecipe { return $this->recipe; }
    public function setRecipe(CraftingRecipe $r): self { $this->recipe = $r; return $this; }

    public function getUniqueName(): string { return $this->uniqueName; }
    public function setUniqueName(string $v): self { $this->uniqueName = $v; return $this; }

    public function getAmount(): int { return $this->amount; }
    public function setAmount(int $v): self { $this->amount = $v; return $this; }
}
