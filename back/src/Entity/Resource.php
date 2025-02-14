<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Resource
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 255)]
    private string $name;

    #[ORM\Column(type: "integer")]
    private int $tier;

    #[ORM\Column(type: "integer")]
    private int $count;

    #[ORM\ManyToOne(targetEntity: Zone::class, cascade: ['persist'], inversedBy: 'resources')]
    #[ORM\JoinColumn(nullable: false)]
    private Zone $zone;

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

    public function getCount(): int
    {
        return $this->count;
    }

    public function setCount(int $count): void
    {
        $this->count = $count;
    }

    public function getZone(): Zone
    {
        return $this->zone;
    }

    public function setZone(Zone $zone): void
    {
        $this->zone = $zone;
    }
}
