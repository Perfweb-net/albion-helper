<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class PasswordResetControllerTest extends WebTestCase
{
    private function registerUser($client, string $username, string $email, string $password = 'password123'): void
    {
        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => $password, 'email' => $email])
        );
        $this->assertResponseStatusCodeSame(201);
    }

    /** Inscription avec e-mail puis confirmation de l'adresse via le jeton du mail. */
    private function registerAndVerifyUser($client, string $username, string $email): void
    {
        $this->registerUser($client, $username, $email);

        // Un mail de confirmation part à l'inscription
        $this->assertEmailCount(1);
        preg_match('/token=([a-f0-9]{64})/', $this->getMailerMessage()->getTextBody(), $m);
        $this->assertNotEmpty($m, 'Le mail de confirmation doit contenir un jeton');

        $client->request('POST', '/api/email/verify', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['token' => $m[1]])
        );
        $this->assertResponseStatusCodeSame(200);
    }

    public function testForgotWithUnknownEmailReturnsGenericResponseWithoutEmail(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/password/forgot', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'unknown_' . uniqid() . '@example.com'])
        );

        // Réponse identique à celle d'un compte existant (anti-énumération)…
        $this->assertResponseStatusCodeSame(200);
        // …mais aucun mail ne part
        $this->assertEmailCount(0);
    }

    public function testForgotWithInvalidEmailReturns400(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/password/forgot', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'not-an-email'])
        );

        $this->assertResponseStatusCodeSame(400);
    }

    public function testForgotOnUnverifiedEmailSendsNothing(): void
    {
        $client = static::createClient();
        $username = 'unverified_' . uniqid();
        $email = $username . '@example.com';
        $this->registerUser($client, $username, $email);
        // Adresse jamais confirmée : réponse générique, aucun mail de reset
        $client->request('POST', '/api/password/forgot', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email])
        );
        $this->assertResponseStatusCodeSame(200);
        $this->assertEmailCount(0);
    }

    public function testVerifyWithInvalidTokenReturns400(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/email/verify', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['token' => str_repeat('b', 64)])
        );

        $this->assertResponseStatusCodeSame(400);
    }

    public function testFullResetFlow(): void
    {
        $client = static::createClient();
        $username = 'resetflow_' . uniqid();
        $email = $username . '@example.com';
        $this->registerAndVerifyUser($client, $username, $email);

        // 1. Demande de reset : un mail contenant le lien est envoyé
        $client->request('POST', '/api/password/forgot', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email])
        );
        $this->assertResponseStatusCodeSame(200);
        $this->assertEmailCount(1);

        $mail = $this->getMailerMessage();
        $this->assertEmailTextBodyContains($mail, '/reset-password?token=');
        preg_match('/token=([a-f0-9]{64})/', $mail->getTextBody(), $matches);
        $this->assertNotEmpty($matches, 'Le mail doit contenir un jeton de reset');
        $token = $matches[1];

        // 2. Réinitialisation avec le jeton reçu
        $client->request('POST', '/api/password/reset', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['token' => $token, 'password' => 'newpassword456'])
        );
        $this->assertResponseStatusCodeSame(200);

        // 3. Connexion possible avec le nouveau mot de passe
        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'newpassword456'])
        );
        $this->assertResponseStatusCodeSame(200);

        // 4. Le jeton est à usage unique : une seconde utilisation échoue
        $client->request('POST', '/api/password/reset', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['token' => $token, 'password' => 'anotherpass789'])
        );
        $this->assertResponseStatusCodeSame(400);
    }

    public function testResetWithInvalidTokenReturns400(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/password/reset', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['token' => str_repeat('a', 64), 'password' => 'newpassword456'])
        );

        $this->assertResponseStatusCodeSame(400);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Invalid or expired token', $content['error']);
    }

    public function testResetWithTooShortPasswordReturns400(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/password/reset', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['token' => str_repeat('a', 64), 'password' => 'short'])
        );

        $this->assertResponseStatusCodeSame(400);
    }

    public function testRegisterWithInvalidEmailReturns400(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => 'bademail_' . uniqid(), 'password' => 'password123', 'email' => 'nope'])
        );

        $this->assertResponseStatusCodeSame(400);
    }
}
