<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260602000006 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql("ALTER TABLE composition ADD COLUMN IF NOT EXISTS visibility VARCHAR(16) NOT NULL DEFAULT 'private'");
        $this->addSql("UPDATE composition SET visibility = CASE WHEN is_public = TRUE THEN 'public' ELSE 'private' END");
        $this->addSql('ALTER TABLE composition DROP COLUMN IF EXISTS is_public');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE composition ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE');
        $this->addSql("UPDATE composition SET is_public = (visibility = 'public')");
        $this->addSql('ALTER TABLE composition DROP COLUMN IF EXISTS visibility');
    }
}
