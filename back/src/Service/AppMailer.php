<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

/**
 * Centralise l'envoi des e-mails applicatifs (reset de mot de passe, alertes
 * de supervision). Le transport est configuré via MAILER_DSN (Brevo en prod).
 * Les templates HTML reprennent la charte du front (front/src/styles/variables.scss,
 * thème sombre) en CSS inline : les clients mail ignorent les feuilles de style.
 */
class AppMailer
{
    private const SENDER_NAME = 'Albion Helper';

    // Palette du thème sombre du site
    private const COLOR_BACKGROUND = '#0a0805';
    private const COLOR_PAPER = '#1c1508';
    private const COLOR_GOLD = '#c9a84c';
    private const COLOR_GOLD_DARK = '#8b6914';
    private const COLOR_RED = '#9b3b3b';
    private const COLOR_TEXT = '#e8dcc8';
    private const COLOR_TEXT_MUTED = '#b8a88a';

    public function __construct(
        private readonly MailerInterface $mailer,
        #[Autowire('%env(MAILER_FROM)%')] private readonly string $from,
        #[Autowire('%env(ALERT_EMAIL)%')] private readonly string $alertEmail,
        #[Autowire('%env(FRONTEND_URL)%')] private readonly string $frontendUrl,
    ) {
    }

    public function sendPasswordReset(User $user, string $plainToken): void
    {
        $resetUrl = rtrim($this->frontendUrl, '/') . '/reset-password?token=' . $plainToken;
        $username = htmlspecialchars($user->getUsername(), ENT_QUOTES);

        $content =
            '<p style="margin:0 0 16px;">Bonjour <strong style="color:' . self::COLOR_GOLD . ';">' . $username . '</strong>,</p>' .
            '<p style="margin:0 0 24px;">Une réinitialisation de mot de passe a été demandée pour votre compte Albion Helper. ' .
            'Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.</p>' .
            '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;"><tr><td style="border-radius:12px;background:linear-gradient(135deg,' . self::COLOR_GOLD . ',' . self::COLOR_GOLD_DARK . ');background-color:' . self::COLOR_GOLD . ';">' .
            '<a href="' . $resetUrl . '" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:700;color:#1a1005;text-decoration:none;border-radius:12px;">Choisir un nouveau mot de passe</a>' .
            '</td></tr></table>' .
            '<p style="margin:0 0 8px;font-size:13px;color:' . self::COLOR_TEXT_MUTED . ';">Ce lien est valable <strong>1&nbsp;heure</strong>. ' .
            'S\'il ne fonctionne pas, copiez cette adresse dans votre navigateur&nbsp;:</p>' .
            '<p style="margin:0 0 24px;font-size:12px;word-break:break-all;"><a href="' . $resetUrl . '" style="color:' . self::COLOR_GOLD . ';">' . $resetUrl . '</a></p>' .
            '<p style="margin:0;font-size:13px;color:' . self::COLOR_TEXT_MUTED . ';">Si vous n\'êtes pas à l\'origine de cette demande, ignorez simplement cet e-mail&nbsp;: votre mot de passe actuel reste inchangé.</p>';

        $email = (new Email())
            ->from(new Address($this->from, self::SENDER_NAME))
            ->to($user->getEmail())
            ->subject('Albion Helper — Réinitialisation de votre mot de passe')
            ->text(
                "Bonjour {$user->getUsername()},\n\n" .
                "Une réinitialisation de mot de passe a été demandée pour votre compte Albion Helper.\n" .
                "Pour choisir un nouveau mot de passe, ouvrez ce lien (valable 1 heure) :\n\n" .
                "{$resetUrl}\n\n" .
                "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail : " .
                "votre mot de passe actuel reste inchangé.\n"
            )
            ->html($this->wrapTemplate('Réinitialisation du mot de passe', self::COLOR_GOLD, $content));

        $this->mailer->send($email);
    }

    /**
     * @param array<string, array{status: string, message: string}> $failingServices
     */
    public function sendHealthAlert(array $failingServices): void
    {
        $textLines = [];
        $htmlRows = '';
        foreach ($failingServices as $name => $service) {
            $textLines[] = sprintf('- %s : %s', $name, $service['message']);
            $htmlRows .=
                '<tr>' .
                '<td style="padding:10px 14px;border-bottom:1px solid #2e2410;font-weight:700;color:' . self::COLOR_TEXT . ';white-space:nowrap;">' . htmlspecialchars($name, ENT_QUOTES) . '</td>' .
                '<td style="padding:10px 14px;border-bottom:1px solid #2e2410;color:#d98f8f;">' . htmlspecialchars($service['message'], ENT_QUOTES) . '</td>' .
                '</tr>';
        }

        $content =
            '<p style="margin:0 0 16px;">Le health check <strong style="color:' . self::COLOR_GOLD . ';">/api/health</strong> a détecté un problème le ' .
            '<strong>' . date('d/m/Y à H:i:s') . '</strong>&nbsp;:</p>' .
            '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;border:1px solid ' . self::COLOR_RED . ';border-radius:12px;border-collapse:separate;overflow:hidden;">' .
            '<tr><td colspan="2" style="padding:10px 14px;background-color:' . self::COLOR_RED . ';color:#f4ede0;font-weight:700;">Service(s) en erreur</td></tr>' .
            $htmlRows .
            '</table>' .
            '<p style="margin:0;font-size:13px;color:' . self::COLOR_TEXT_MUTED . ';">Vérifier l\'état des services — runbook d\'alerte, dossier §3.4.</p>';

        $email = (new Email())
            ->from(new Address($this->from, self::SENDER_NAME))
            ->to($this->alertEmail)
            ->subject('[Albion Helper] ALERTE health check — service(s) en erreur')
            ->text(
                "Le health check (/api/health) a détecté un problème le " . date('d/m/Y à H:i:s') . " :\n\n" .
                implode("\n", $textLines) . "\n\n" .
                "Vérifier l'état des services (runbook d'alerte, dossier §3.4).\n"
            )
            ->html($this->wrapTemplate('Alerte supervision', self::COLOR_RED, $content));

        $this->mailer->send($email);
    }

    /**
     * Gabarit commun : en-tête sombre au titre doré (comme le header du site),
     * carte "paper" arrondie pour le contenu, pied de page discret.
     */
    private function wrapTemplate(string $subtitle, string $accentColor, string $contentHtml): string
    {
        return
            '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"></head>' .
            '<body style="margin:0;padding:0;background-color:' . self::COLOR_BACKGROUND . ';">' .
            '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:' . self::COLOR_BACKGROUND . ';padding:32px 16px;">' .
            '<tr><td align="center">' .
            '<table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%;">' .

            // En-tête : titre doré + filet accent
            '<tr><td style="padding:0 8px 20px;text-align:center;">' .
            '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:28px;font-weight:700;color:' . self::COLOR_GOLD . ';letter-spacing:1px;">&#9876;&nbsp;Albion Helper</div>' .
            '<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:' . $accentColor . ';text-transform:uppercase;letter-spacing:3px;margin-top:6px;">' . $subtitle . '</div>' .
            '</td></tr>' .

            // Carte de contenu
            '<tr><td style="background-color:' . self::COLOR_PAPER . ';border:1px solid #2e2410;border-top:3px solid ' . $accentColor . ';border-radius:16px;padding:32px;' .
            'font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:' . self::COLOR_TEXT . ';">' .
            $contentHtml .
            '</td></tr>' .

            // Pied de page
            '<tr><td style="padding:20px 8px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:' . self::COLOR_TEXT_MUTED . ';">' .
            'Albion Helper — compagnon pour Albion Online<br>E-mail automatique, merci de ne pas y répondre.' .
            '</td></tr>' .

            '</table></td></tr></table></body></html>';
    }
}
