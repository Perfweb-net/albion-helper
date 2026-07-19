<?php

namespace App\Command;

use App\Entity\User;
use App\Service\AppMailer;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Envoie un exemplaire de chaque mail applicatif (reset de mot de passe,
 * alerte health check) pour vérifier la configuration SMTP réelle.
 * L'alerte part vers ALERT_EMAIL, le reset vers l'adresse passée en argument.
 */
#[AsCommand(name: 'app:mail-test', description: 'Envoie les mails applicatifs de test (reset + alerte health check)')]
class TestMailCommand extends Command
{
    public function __construct(private readonly AppMailer $mailer)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('recipient', InputArgument::REQUIRED, 'Adresse qui recevra le mail de reset');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $recipient = $input->getArgument('recipient');

        // Utilisateur factice, jamais persisté : seul l'envoi SMTP est testé
        $user = (new User())
            ->setUsername('test-mail')
            ->setEmail($recipient);

        $io->section('1/3 — Mail de confirmation d\'inscription');
        $this->mailer->sendEmailVerification($user, bin2hex(random_bytes(32)));
        $io->success("Envoyé à {$recipient}");

        $io->section('2/3 — Mail de réinitialisation de mot de passe');
        $this->mailer->sendPasswordReset($user, bin2hex(random_bytes(32)));
        $io->success("Envoyé à {$recipient} (le lien pointe vers un jeton factice, il ne fonctionnera pas)");

        $io->section('3/3 — Alerte health check (vers ALERT_EMAIL)');
        $this->mailer->sendHealthAlert([
            'database' => ['status' => 'ERROR', 'message' => 'Database connection failed'],
            'albion_api' => ['status' => 'ERROR', 'message' => 'Albion API unreachable'],
        ]);
        $io->success('Alerte envoyée (services en erreur simulés : database + albion_api)');

        return Command::SUCCESS;
    }
}
