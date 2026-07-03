<?php

namespace App\Entity;

use App\Repository\SearchLogRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SearchLogRepository::class)]
#[ORM\Table(name: 'search_log')]
class SearchLog
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20)]
    private string $type = '';

    #[ORM\Column(length: 255)]
    private string $query = '';

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $server = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct(string $type, string $query, ?string $server = null)
    {
        $this->type = $type;
        $this->query = $query;
        $this->server = $server;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getType(): string { return $this->type; }
    public function getQuery(): string { return $this->query; }
    public function getServer(): ?string { return $this->server; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
