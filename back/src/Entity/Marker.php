<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Marker
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name;

    #[ORM\Column(type: "float")]
    private float $posX;

    #[ORM\Column(type: "float")]
    private float $posY;

    #[ORM\ManyToOne(targetEntity: Zone::class, cascade: ['persist'], inversedBy: "markers")]
    #[ORM\JoinColumn(nullable: false)]
    private ?Zone $zone = null;

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): void { $this->name = $name; }

    public function getPosX(): float { return $this->posX; }
    public function setPosX(float $posX): void { $this->posX = $posX; }

    public function getPosY(): float { return $this->posY; }
    public function setPosY(float $posY): void { $this->posY = $posY; }

    public function getZone(): ?Zone { return $this->zone; }
    public function setZone(?Zone $zone): void { $this->zone = $zone; }
}
