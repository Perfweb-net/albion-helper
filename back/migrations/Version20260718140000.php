<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Active l'extension PostgreSQL "unaccent" : la recherche d'objets ignorait les
 * accents des noms traduits (ex. "epee" ne trouvait pas "Épée"), ce qui faisait
 * disparaître des résultats pourtant valides dans le sélecteur de composition.
 */
final class Version20260718140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Active l\'extension unaccent (recherche d\'objets insensible aux accents)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE EXTENSION IF NOT EXISTS unaccent');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP EXTENSION IF EXISTS unaccent');
    }
}
