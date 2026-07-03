<?php

namespace App\Entity;

use App\Repository\GameRouteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GameRouteRepository::class)]
#[ORM\Table(name: 'game_route')]
class GameRoute
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $name = '';

    #[ORM\Column(length: 64, unique: true)]
    private string $shareToken = '';

    #[ORM\Column(length: 20)]
    private string $server = 'europe';

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private User $user;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $expiresAt;

    #[ORM\OneToMany(mappedBy: 'route', targetEntity: RouteZone::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['position' => 'ASC'])]
    private Collection $zones;

    public function __construct()
    {
        $this->zones = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->expiresAt = new \DateTimeImmutable('+24 hours');
        $this->shareToken = bin2hex(random_bytes(16));
    }

    public function getId(): ?int { return $this->id; }

    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }

    public function getShareToken(): string { return $this->shareToken; }

    public function getServer(): string { return $this->server; }
    public function setServer(string $server): self { $this->server = $server; return $this; }

    public function getUser(): User { return $this->user; }
    public function setUser(User $user): self { $this->user = $user; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getExpiresAt(): \DateTimeImmutable { return $this->expiresAt; }

    public function isExpired(): bool { return $this->expiresAt < new \DateTimeImmutable(); }

    public function getZones(): Collection { return $this->zones; }

    public function addZone(RouteZone $zone): self
    {
        if (!$this->zones->contains($zone)) {
            $this->zones->add($zone);
            $zone->setRoute($this);
        }
        return $this;
    }

    public function removeZone(RouteZone $zone): self
    {
        $this->zones->removeElement($zone);
        return $this;
    }
}
