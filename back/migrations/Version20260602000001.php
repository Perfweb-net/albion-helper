<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260602000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add item table for local item storage';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE item (
            id SERIAL NOT NULL,
            unique_name VARCHAR(255) NOT NULL,
            localized_names JSON NOT NULL,
            tier SMALLINT DEFAULT NULL,
            synced_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_ITEM_UNIQUE_NAME ON item (unique_name)');
        $this->addSql('COMMENT ON COLUMN item.synced_at IS \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE item');
    }
}
