<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260602000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add item_market_data table for market price cache';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE item_market_data (
            id SERIAL NOT NULL,
            unique_name VARCHAR(255) NOT NULL,
            quality SMALLINT NOT NULL DEFAULT 1,
            prices JSON NOT NULL,
            history JSON NOT NULL,
            updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX uniq_market_item_quality ON item_market_data (unique_name, quality)');
        $this->addSql('COMMENT ON COLUMN item_market_data.updated_at IS \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE item_market_data');
    }
}
