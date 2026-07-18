<?php

namespace App\Command;

use App\Service\ReferenceDataSeeder;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Charge les données de référence du jeu (zones/mobs/ressources/markers, recettes
 * de craft) si elles n'existent pas déjà en base. N'écrit jamais sur des lignes
 * existantes, ne purge rien — safe à exécuter à chaque déploiement (deploy.sh).
 */
#[AsCommand(
    name: 'app:seed-reference-data',
    description: "Charge les zones/mobs/recettes de craft manquantes en base (idempotent, sans purge)",
)]
class SeedReferenceDataCommand extends Command
{
    public function __construct(private readonly ReferenceDataSeeder $seeder)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $zonesCreated = $this->seeder->seedZones();
        $io->writeln(sprintf('Zones : %d créée(s)', $zonesCreated));

        $recipesCreated = $this->seeder->seedCraftingRecipes();
        $io->writeln(sprintf('Recettes de craft : %d créée(s)', $recipesCreated));

        $io->success('Données de référence à jour.');

        return Command::SUCCESS;
    }
}
