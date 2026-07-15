<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * BUG-016 : la suppression d'un compte échouait (violation FK) si l'utilisateur
 * possédait des routes — la contrainte game_route.user_id passe en ON DELETE CASCADE,
 * comme composition.owner_id (droit à l'effacement, cf. dossier Bloc 2 §7.2).
 */
final class Version20260715095815 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'game_route.user_id : ON DELETE CASCADE (suppression de compte complète)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE game_route DROP CONSTRAINT fk_game_route_user');
        $this->addSql('ALTER TABLE game_route ADD CONSTRAINT fk_game_route_user FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE game_route DROP CONSTRAINT fk_game_route_user');
        $this->addSql('ALTER TABLE game_route ADD CONSTRAINT fk_game_route_user FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}
