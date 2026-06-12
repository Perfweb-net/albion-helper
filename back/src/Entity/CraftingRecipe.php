<?php

namespace App\Entity;

use App\Repository\CraftingRecipeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CraftingRecipeRepository::class)]
#[ORM\Table(name: 'crafting_recipe')]
class CraftingRecipe
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $uniqueName;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $name = null;

    #[ORM\Column(length: 64)]
    private string $category; // weapons|armor|food|refinement|other

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $subcategory = null;

    #[ORM\Column(type: 'smallint')]
    private int $tier;

    #[ORM\Column(type: 'smallint', options: ['default' => 1])]
    private int $outputAmount = 1;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $focusCostBase = 0;

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $bonusCity = null; // city with 15% crafting bonus for this recipe

    #[ORM\OneToMany(targetEntity: CraftingRecipeIngredient::class, mappedBy: 'recipe', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $ingredients;

    public function __construct()
    {
        $this->ingredients = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getUniqueName(): string { return $this->uniqueName; }
    public function setUniqueName(string $v): self { $this->uniqueName = $v; return $this; }

    public function getName(): ?string { return $this->name; }
    public function setName(?string $v): self { $this->name = $v; return $this; }

    public function getCategory(): string { return $this->category; }
    public function setCategory(string $v): self { $this->category = $v; return $this; }

    public function getSubcategory(): ?string { return $this->subcategory; }
    public function setSubcategory(?string $v): self { $this->subcategory = $v; return $this; }

    public function getTier(): int { return $this->tier; }
    public function setTier(int $v): self { $this->tier = $v; return $this; }

    public function getOutputAmount(): int { return $this->outputAmount; }
    public function setOutputAmount(int $v): self { $this->outputAmount = $v; return $this; }

    public function getFocusCostBase(): int { return $this->focusCostBase; }
    public function setFocusCostBase(int $v): self { $this->focusCostBase = $v; return $this; }

    public function getBonusCity(): ?string { return $this->bonusCity; }
    public function setBonusCity(?string $v): self { $this->bonusCity = $v; return $this; }

    public function getIngredients(): Collection { return $this->ingredients; }

    public function addIngredient(CraftingRecipeIngredient $i): self
    {
        if (!$this->ingredients->contains($i)) {
            $this->ingredients->add($i);
            $i->setRecipe($this);
        }
        return $this;
    }
}
