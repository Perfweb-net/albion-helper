<?php
namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Table(name: '"user"')]
#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, \Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 255, unique: true)]
    private ?string $username = null;

    #[ORM\Column(type: "string", length: 255, unique: true, nullable: true)]
    private ?string $email = null;

    // Seul le hash SHA-256 du jeton de reset est stocké : un dump de la base
    // ne permet pas de réinitialiser les mots de passe des utilisateurs.
    #[ORM\Column(type: "string", length: 64, nullable: true)]
    private ?string $resetTokenHash = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $resetTokenExpiresAt = null;

    #[ORM\Column(type: "string", length: 255)]
    private ?string $password = null;

    #[ORM\Column(type: "json")]
    private array $roles = [];

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $preferences = null;

    // Getter and setter methods for each property

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): self
    {
        $this->username = $username;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getResetTokenHash(): ?string
    {
        return $this->resetTokenHash;
    }

    public function setResetTokenHash(?string $resetTokenHash): self
    {
        $this->resetTokenHash = $resetTokenHash;

        return $this;
    }

    public function getResetTokenExpiresAt(): ?\DateTimeImmutable
    {
        return $this->resetTokenExpiresAt;
    }

    public function setResetTokenExpiresAt(?\DateTimeImmutable $resetTokenExpiresAt): self
    {
        $this->resetTokenExpiresAt = $resetTokenExpiresAt;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getRoles(): array
    {
        return $this->roles;
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    // Méthode nécessaire pour implémenter UserInterface
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): self { $this->createdAt = $createdAt; return $this; }

    public function getPreferences(): ?array { return $this->preferences; }
    public function setPreferences(?array $v): self { $this->preferences = $v; return $this; }

    public function eraseCredentials(): void
    {
        // Cette méthode est vide car nous n'utilisons pas de données sensibles à supprimer
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->getUsername();
    }
}
