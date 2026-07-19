<?php

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;

/**
 * Depuis la v3.2.0 un compte doit être activé (lien e-mail) avant de pouvoir
 * se connecter : ce trait factorise inscription + activation pour les tests.
 */
trait RegistersUsersTrait
{
    private function registerVerifiedUser(KernelBrowser $client, string $username, string $password = 'password123'): void
    {
        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => $password, 'email' => $username . '@example.com'])
        );

        // Activation du compte via le jeton du mail de confirmation
        preg_match('/token=([a-f0-9]{64})/', $this->getMailerMessage()->getTextBody(), $m);
        $client->request('POST', '/api/email/verify', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['token' => $m[1]])
        );
    }
}
