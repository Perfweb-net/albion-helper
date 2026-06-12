<?php

namespace App\Entity;

use App\Repository\RouteZoneRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RouteZoneRepository::class)]
#[ORM\Table(name: 'route_zone')]
class RouteZone
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'zones')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private GameRoute $route;

    #[ORM\Column(length: 150)]
    private string $zoneName = '';

    #[ORM\Column(type: 'integer')]
    private int $timerMinutes = 30;

    #[ORM\Column(type: 'integer')]
    private int $position = 0;

    public function getId(): ?int { return $this->id; }

    public function getRoute(): GameRoute { return $this->route; }
    public function setRoute(GameRoute $route): self { $this->route = $route; return $this; }

    public function getZoneName(): string { return $this->zoneName; }
    public function setZoneName(string $zoneName): self { $this->zoneName = $zoneName; return $this; }

    public function getTimerMinutes(): int { return $this->timerMinutes; }
    public function setTimerMinutes(int $timerMinutes): self
    {
        $this->timerMinutes = max(1, min(1440, $timerMinutes));
        return $this;
    }

    public function getPosition(): int { return $this->position; }
    public function setPosition(int $position): self { $this->position = $position; return $this; }
}
