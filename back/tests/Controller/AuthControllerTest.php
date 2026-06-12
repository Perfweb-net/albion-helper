<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthControllerTest extends WebTestCase
{
    public function testRegisterSuccess(): void
    {
        $client = static::createClient();
        $username = 'testuser_' . uniqid();

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
        );

        $this->assertResponseStatusCodeSame(201);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('User created', $content['status']);
    }

    public function testRegisterDuplicateUser(): void
    {
        $client = static::createClient();
        $username = 'duplicate_' . uniqid();

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
        );
        $this->assertResponseStatusCodeSame(201);

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
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
    }

    public function testLoginSuccess(): void
    {
        $client = static::createClient();
        $username = 'logintest_' . uniqid();

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
        );
        $this->assertResponseStatusCodeSame(201);

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
}
