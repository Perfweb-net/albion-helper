<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity]
class Zone
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 255)]
    private string $name;

    #[ORM\Column(type: "integer")]
    private int $tier;

    #[ORM\Column(type: "string", length: 255)]
    private string $type;

    #[ORM\Column(type: "string", length: 255)]
    private string $color;

    #[ORM\OneToMany(targetEntity: Resource::class, mappedBy: "zone", cascade: ["persist", "remove"])]
    private Collection $resources;

    #[ORM\OneToMany(targetEntity: Mob::class, mappedBy: "zone", cascade: ["persist", "remove"])]
    private Collection $mobs;

    #[ORM\OneToMany(targetEntity: Marker::class, mappedBy: 'zone', cascade: ['persist', 'remove'])]
    private Collection $markers;

    public function getMarkers(): Collection
    {
        return $this->markers;
    }

    public function setMarkers(Collection $markers): void
    {
        $this->markers = $markers;
    }

    public function __construct()
    {
        $this->resources = new ArrayCollection();
        $this->mobs = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getTier(): int
    {
        return $this->tier;
    }

    public function setTier(int $tier): void
    {
        $this->tier = $tier;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): void
    {
        $this->type = $type;
    }

    public function getColor(): string
    {
        return $this->color;
    }

    public function setColor(string $color): void
    {
        $this->color = $color;
    }

    public function getResources(): Collection
    {
        return $this->resources;
    }

    public function setResources(Collection $resources): void
    {
        $this->resources = $resources;
    }

    public function getMobs(): Collection
    {
        return $this->mobs;
    }

    public function setMobs(Collection $mobs): void
    {
        $this->mobs = $mobs;
    }
}
