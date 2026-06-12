<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260602000004 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add name column to crafting_recipe';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE crafting_recipe ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE crafting_recipe DROP COLUMN IF EXISTS name');
    }
}
