<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260602000003 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add crafting_recipe, crafting_recipe_ingredient tables and preferences column to user';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS preferences JSON DEFAULT NULL');

        $this->addSql('CREATE TABLE IF NOT EXISTS crafting_recipe (
            id SERIAL NOT NULL,
            unique_name VARCHAR(255) NOT NULL,
            category VARCHAR(64) NOT NULL,
            subcategory VARCHAR(64) DEFAULT NULL,
            tier SMALLINT NOT NULL,
            output_amount SMALLINT NOT NULL DEFAULT 1,
            focus_cost_base INT NOT NULL DEFAULT 0,
            bonus_city VARCHAR(64) DEFAULT NULL,
            PRIMARY KEY(id)
        )');

        $this->addSql('CREATE TABLE IF NOT EXISTS crafting_recipe_ingredient (
            id SERIAL NOT NULL,
            recipe_id INT NOT NULL,
            unique_name VARCHAR(255) NOT NULL,
            amount SMALLINT NOT NULL,
            PRIMARY KEY(id),
            CONSTRAINT fk_ingredient_recipe FOREIGN KEY (recipe_id) REFERENCES crafting_recipe(id) ON DELETE CASCADE
        )');

        $this->addSql('CREATE INDEX idx_crafting_recipe_category ON crafting_recipe (category)');
        $this->addSql('CREATE INDEX idx_crafting_recipe_tier ON crafting_recipe (tier)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS crafting_recipe_ingredient');
        $this->addSql('DROP TABLE IF EXISTS crafting_recipe');
        $this->addSql('ALTER TABLE "user" DROP COLUMN IF EXISTS preferences');
    }
}
