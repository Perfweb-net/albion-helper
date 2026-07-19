<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Rétro-compatibilité des comptes créés sans e-mail : l'adresse ajoutée après
 * l'inscription attend dans pending_email sa confirmation, puis est promue
 * dans email — le compte n'est jamais bloqué pendant l'attente.
 */
final class Version20260719200000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute pending_email sur "user" (ajout d\'e-mail sur compte existant)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" ADD pending_email VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" DROP pending_email');
    }
}
