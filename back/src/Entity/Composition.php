<?php

namespace App\Entity;

use App\Repository\CompositionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CompositionRepository::class)]
class Composition
{
    // Visibility values
    public const VISIBILITY_PRIVATE  = 'private';
    public const VISIBILITY_URL_ONLY = 'url_only';
    public const VISIBILITY_PUBLIC   = 'public';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name = '';

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $owner;

    #[ORM\Column(type: 'json')]
    private array $players = [];

    #[ORM\Column(length: 64, unique: true)]
    private string $shareToken;

    /** private | url_only | public */
    #[ORM\Column(length: 16)]
    private string $visibility = self::VISIBILITY_PRIVATE;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->shareToken = bin2hex(random_bytes(32));
        $this->createdAt  = new \DateTimeImmutable();
        $this->updatedAt  = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }

    public function getOwner(): User { return $this->owner; }
    public function setOwner(User $owner): self { $this->owner = $owner; return $this; }

    public function getPlayers(): array { return $this->players; }
    public function setPlayers(array $players): self { $this->players = $players; return $this; }

    public function getShareToken(): string { return $this->shareToken; }

    public function getVisibility(): string { return $this->visibility; }
    public function setVisibility(string $v): self
    {
        if (!in_array($v, [self::VISIBILITY_PRIVATE, self::VISIBILITY_URL_ONLY, self::VISIBILITY_PUBLIC], true)) {
            $v = self::VISIBILITY_PRIVATE;
        }
        $this->visibility = $v;
        return $this;
    }

    public function isShareable(): bool
    {
        return $this->visibility === self::VISIBILITY_URL_ONLY
            || $this->visibility === self::VISIBILITY_PUBLIC;
    }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(\DateTimeImmutable $v): self { $this->updatedAt = $v; return $this; }
}
