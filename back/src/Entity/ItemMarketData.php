<?php

namespace App\Entity;

use App\Repository\ItemMarketDataRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ItemMarketDataRepository::class)]
#[ORM\Table(name: 'item_market_data')]
#[ORM\UniqueConstraint(name: 'uniq_market_item_quality_server', columns: ['unique_name', 'quality', 'server'])]
class ItemMarketData
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $uniqueName = '';

    #[ORM\Column(type: 'smallint')]
    private int $quality = 1;

    #[ORM\Column(length: 20)]
    private string $server = 'europe';

    #[ORM\Column(type: 'json')]
    private array $prices = [];

    #[ORM\Column(type: 'json')]
    private array $history = [];

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getUniqueName(): string { return $this->uniqueName; }
    public function setUniqueName(string $v): self { $this->uniqueName = $v; return $this; }
    public function getQuality(): int { return $this->quality; }
    public function setQuality(int $v): self { $this->quality = $v; return $this; }
    public function getServer(): string { return $this->server; }
    public function setServer(string $v): self { $this->server = $v; return $this; }
    public function getPrices(): array { return $this->prices; }
    public function setPrices(array $v): self { $this->prices = $v; return $this; }
    public function getHistory(): array { return $this->history; }
    public function setHistory(array $v): self { $this->history = $v; return $this; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(\DateTimeImmutable $v): self { $this->updatedAt = $v; return $this; }

    public function canRefresh(): bool
    {
        return $this->updatedAt < new \DateTimeImmutable('-1 hour');
    }

    public function minutesUntilRefresh(): int
    {
        $diff = (new \DateTimeImmutable())->getTimestamp() - $this->updatedAt->getTimestamp();
        return max(0, 60 - (int) floor($diff / 60));
    }
}
