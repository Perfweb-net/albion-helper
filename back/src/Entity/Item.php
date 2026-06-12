<?php

namespace App\Entity;

use App\Repository\ItemRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ItemRepository::class)]
#[ORM\Table(name: 'item')]
class Item
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    private string $uniqueName = '';

    #[ORM\Column(type: 'json')]
    private array $localizedNames = [];

    #[ORM\Column(type: 'smallint', nullable: true)]
    private ?int $tier = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $syncedAt = null;

    public function getId(): ?int { return $this->id; }
    public function getUniqueName(): string { return $this->uniqueName; }
    public function setUniqueName(string $uniqueName): self { $this->uniqueName = $uniqueName; return $this; }
    public function getLocalizedNames(): array { return $this->localizedNames; }
    public function setLocalizedNames(array $localizedNames): self { $this->localizedNames = $localizedNames; return $this; }
    public function getTier(): ?int { return $this->tier; }
    public function setTier(?int $tier): self { $this->tier = $tier; return $this; }
    public function getSyncedAt(): ?\DateTimeImmutable { return $this->syncedAt; }
    public function setSyncedAt(?\DateTimeImmutable $syncedAt): self { $this->syncedAt = $syncedAt; return $this; }
}
