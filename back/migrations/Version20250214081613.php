<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250214081613 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE marker (id SERIAL NOT NULL, zone_id INT NOT NULL, name VARCHAR(255) NOT NULL, pos_x DOUBLE PRECISION NOT NULL, pos_y DOUBLE PRECISION NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_82CF20FE9F2C3FAB ON marker (zone_id)');
        $this->addSql('CREATE TABLE mob (id SERIAL NOT NULL, zone_id INT NOT NULL, name VARCHAR(255) NOT NULL, tier INT NOT NULL, count INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_FE97F67D9F2C3FAB ON mob (zone_id)');
        $this->addSql('CREATE TABLE resource (id SERIAL NOT NULL, zone_id INT NOT NULL, name VARCHAR(255) NOT NULL, tier INT NOT NULL, count INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_BC91F4169F2C3FAB ON resource (zone_id)');
        $this->addSql('CREATE TABLE zone (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, tier INT NOT NULL, type VARCHAR(255) NOT NULL, color VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('ALTER TABLE marker ADD CONSTRAINT FK_82CF20FE9F2C3FAB FOREIGN KEY (zone_id) REFERENCES zone (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE mob ADD CONSTRAINT FK_FE97F67D9F2C3FAB FOREIGN KEY (zone_id) REFERENCES zone (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE resource ADD CONSTRAINT FK_BC91F4169F2C3FAB FOREIGN KEY (zone_id) REFERENCES zone (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE marker DROP CONSTRAINT FK_82CF20FE9F2C3FAB');
        $this->addSql('ALTER TABLE mob DROP CONSTRAINT FK_FE97F67D9F2C3FAB');
        $this->addSql('ALTER TABLE resource DROP CONSTRAINT FK_BC91F4169F2C3FAB');
        $this->addSql('DROP TABLE marker');
        $this->addSql('DROP TABLE mob');
        $this->addSql('DROP TABLE resource');
        $this->addSql('DROP TABLE zone');
    }
}
