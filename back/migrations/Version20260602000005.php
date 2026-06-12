<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260602000005 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE IF NOT EXISTS composition (
            id SERIAL PRIMARY KEY,
            owner_id INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL DEFAULT \'\',
            players JSON NOT NULL DEFAULT \'[]\',
            share_token VARCHAR(64) NOT NULL,
            is_public BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            CONSTRAINT uq_composition_share_token UNIQUE (share_token)
        )');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS composition');
    }
}
