<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Confirmation de l'adresse e-mail à l'inscription : jeton de vérification (hash)
 * et horodatage de confirmation. La récupération de compte (reset de mot de passe)
 * n'est active que pour une adresse confirmée.
 */
final class Version20260719190000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute email_verification_token_hash et email_verified_at sur "user"';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" ADD email_verification_token_hash VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD email_verified_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('COMMENT ON COLUMN "user".email_verified_at IS \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" DROP email_verification_token_hash');
        $this->addSql('ALTER TABLE "user" DROP email_verified_at');
    }
}
