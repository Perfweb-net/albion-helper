<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260602000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add GameRoute, RouteZone, SearchLog tables and createdAt to User';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE IF NOT EXISTS "user" (
            id SERIAL NOT NULL,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            roles JSON NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX IF NOT EXISTS UNIQ_USER_USERNAME ON "user" (username)');

        $this->addSql('CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL NOT NULL,
            refresh_token VARCHAR(128) NOT NULL,
            username VARCHAR(255) NOT NULL,
            valid TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX IF NOT EXISTS UNIQ_REFRESH_TOKEN ON refresh_tokens (refresh_token)');

        $this->addSql('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('COMMENT ON COLUMN "user".created_at IS \'(DC2Type:datetime_immutable)\'');

        $this->addSql('CREATE TABLE game_route (
            id SERIAL NOT NULL,
            user_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            share_token VARCHAR(64) NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_GAME_ROUTE_SHARE_TOKEN ON game_route (share_token)');
        $this->addSql('COMMENT ON COLUMN game_route.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN game_route.expires_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE game_route ADD CONSTRAINT FK_GAME_ROUTE_USER FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql('CREATE TABLE route_zone (
            id SERIAL NOT NULL,
            route_id INT NOT NULL,
            zone_name VARCHAR(150) NOT NULL,
            timer_minutes INT NOT NULL,
            position INT NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('ALTER TABLE route_zone ADD CONSTRAINT FK_ROUTE_ZONE_ROUTE FOREIGN KEY (route_id) REFERENCES game_route (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql('CREATE TABLE search_log (
            id SERIAL NOT NULL,
            type VARCHAR(20) NOT NULL,
            query VARCHAR(255) NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('COMMENT ON COLUMN search_log.created_at IS \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE route_zone DROP CONSTRAINT FK_ROUTE_ZONE_ROUTE');
        $this->addSql('ALTER TABLE game_route DROP CONSTRAINT FK_GAME_ROUTE_USER');
        $this->addSql('DROP TABLE route_zone');
        $this->addSql('DROP TABLE game_route');
        $this->addSql('DROP TABLE search_log');
        $this->addSql('ALTER TABLE "user" DROP COLUMN IF EXISTS created_at');
        $this->addSql('DROP TABLE IF EXISTS refresh_tokens');
        $this->addSql('DROP TABLE IF EXISTS "user"');
    }
}
