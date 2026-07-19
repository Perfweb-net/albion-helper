<?php

namespace App\Tests\Controller;

use App\Tests\RegistersUsersTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthControllerTest extends WebTestCase
{
    use RegistersUsersTrait;

    public function testRegisterSuccess(): void
    {
        $client = static::createClient();
        $username = 'testuser_' . uniqid();

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123', 'email' => $username . '@example.com'])
        );

        $this->assertResponseStatusCodeSame(201);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('User created, verification email sent', $content['status']);
        // Le mail de confirmation part immédiatement
        $this->assertEmailCount(1);
    }

    public function testRegisterDuplicateUser(): void
    {
        $client = static::createClient();
        $username = 'duplicate_' . uniqid();

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123', 'email' => $username . '@example.com'])
        );
        $this->assertResponseStatusCodeSame(201);

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123', 'email' => $username . '.bis@example.com'])
        );
        $this->assertResponseStatusCodeSame(400);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('User already exists', $content['error']);
    }

    public function testRegisterMissingCredentials(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => 'onlyuser'])
        );

        $this->assertResponseStatusCodeSame(400);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Missing credentials', $content['error']);

        // L'e-mail est désormais obligatoire (activation du compte)
        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => 'noemail_' . uniqid(), 'password' => 'password123'])
        );
        $this->assertResponseStatusCodeSame(400);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Missing email', $content['error']);
    }

    public function testLoginSuccess(): void
    {
        $client = static::createClient();
        $username = 'logintest_' . uniqid();

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123', 'email' => $username . '@example.com'])
        );
        $this->assertResponseStatusCodeSame(201);
        preg_match('/token=([a-f0-9]{64})/', $this->getMailerMessage()->getTextBody(), $m);

        // Compte non activé : la connexion est refusée par le UserChecker
        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
        );
        $this->assertResponseStatusCodeSame(401);

        // Activation par le lien du mail, puis connexion
        $client->request('POST', '/api/email/verify', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['token' => $m[1]])
        );
        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
        );

        $this->assertResponseStatusCodeSame(200);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('token', $content);
    }

    public function testLoginInvalidCredentials(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => 'nonexistent', 'password' => 'wrongpass'])
        );

        $this->assertResponseStatusCodeSame(401);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $content);
        $this->assertEquals(401, $content['code']);
    }

    public function testLoginMissingCredentials(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => 'someuser'])
        );

        $this->assertResponseStatusCodeSame(400);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('detail', $content);
        $this->assertStringContainsString('password', $content['detail']);
    }

    /** Crée un compte, se connecte, et retourne le client (cookies stockés par le test client). */
    private function registerAndLogin($client): string
    {
        $username = 'cookieuser_' . uniqid();
        $this->registerVerifiedUser($client, $username);
        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
        );

        return $username;
    }

    public function testLoginSetsHttpOnlyAuthCookies(): void
    {
        $client = static::createClient();
        $this->registerAndLogin($client);

        $this->assertResponseStatusCodeSame(200);
        $cookies = [];
        foreach ($client->getResponse()->headers->getCookies() as $cookie) {
            $cookies[$cookie->getName()] = $cookie;
        }

        foreach (['jwt_token', 'refresh_token'] as $name) {
            $this->assertArrayHasKey($name, $cookies, "Le cookie $name doit être posé au login");
            $this->assertTrue($cookies[$name]->isHttpOnly(), "$name doit être httpOnly (illisible par JavaScript)");
            $this->assertTrue($cookies[$name]->isSecure(), "$name doit être limité à HTTPS");
        }
    }

    public function testMeReturnsSessionIdentityViaCookie(): void
    {
        $client = static::createClient();
        $username = $this->registerAndLogin($client);

        // Aucun header Authorization : seule l'authentification par cookie est en jeu
        $client->request('GET', '/api/me');

        $this->assertResponseStatusCodeSame(200);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals($username, $content['username']);
        $this->assertContains('ROLE_USER', $content['roles']);
    }

    public function testMeRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/me');

        $this->assertResponseStatusCodeSame(401);
    }

    public function testLogoutClearsSession(): void
    {
        $client = static::createClient();
        $this->registerAndLogin($client);

        $client->request('POST', '/api/logout');
        $this->assertResponseStatusCodeSame(200);

        // Les cookies expirés renvoyés par /api/logout doivent invalider la session
        $client->request('GET', '/api/me');
        $this->assertResponseStatusCodeSame(401);
    }
}
