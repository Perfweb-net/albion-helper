<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Prise en compte du serveur de jeu (americas/europe/asia) sur les données
 * spécifiques à un serveur : prix de marché, routes, journal de recherche.
 * Les compositions et les cartes restent globales (non modifiées).
 */
final class Version20260614120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout de la colonne server (item_market_data, game_route, search_log)';
    }

    public function up(Schema $schema): void
    {
        // Prix de marché : l'unicité passe de (item, qualité) à (item, qualité, serveur)
        $this->addSql("ALTER TABLE item_market_data ADD COLUMN server VARCHAR(20) NOT NULL DEFAULT 'europe'");
        $this->addSql('DROP INDEX IF EXISTS uniq_market_item_quality');
        $this->addSql('CREATE UNIQUE INDEX uniq_market_item_quality_server ON item_market_data (unique_name, quality, server)');

        // Routes de farming : rattachées à un serveur
        $this->addSql("ALTER TABLE game_route ADD COLUMN server VARCHAR(20) NOT NULL DEFAULT 'europe'");

        // Journal de recherche : serveur de la recherche (nullable pour l'historique)
        $this->addSql('ALTER TABLE search_log ADD COLUMN server VARCHAR(20) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IF EXISTS uniq_market_item_quality_server');
        $this->addSql('CREATE UNIQUE INDEX uniq_market_item_quality ON item_market_data (unique_name, quality)');
        $this->addSql('ALTER TABLE item_market_data DROP COLUMN server');
        $this->addSql('ALTER TABLE game_route DROP COLUMN server');
        $this->addSql('ALTER TABLE search_log DROP COLUMN server');
    }
}
