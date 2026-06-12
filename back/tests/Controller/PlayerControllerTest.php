<?php

namespace App\Tests\Controller;

use App\Service\PlayerService;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class PlayerControllerTest extends WebTestCase
{
    private function getAuthToken(object $client): string
    {
        $username = 'playertest_' . uniqid();
        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
        );
        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
        );
        return json_decode($client->getResponse()->getContent(), true)['token'];
    }

    public function testSearchPlayerRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/player/search?pseudo=test');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testSearchPlayerWithAuth(): void
    {
        $client = static::createClient();
        $client->disableReboot();

        $token = $this->getAuthToken($client);

        $playerServiceMock = $this->createMock(PlayerService::class);
        $playerServiceMock->method('search')->willReturn([
            'players' => [['Id' => 'p1', 'Name' => 'TestPlayer']],
        ]);
        static::getContainer()->set(PlayerService::class, $playerServiceMock);

        $client->request('GET', '/api/player/search?pseudo=TestPlayer', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);

        $this->assertResponseStatusCodeSame(200);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('players', $content);
        $this->assertEquals('TestPlayer', $content['players'][0]['Name']);
    }

    public function testGetPlayerDataWithAuth(): void
    {
        $client = static::createClient();
        $client->disableReboot();

        $token = $this->getAuthToken($client);

        $playerServiceMock = $this->createMock(PlayerService::class);
        $playerServiceMock->method('getPlayerData')->willReturn([
            'Id' => 'p1', 'Name' => 'TestPlayer', 'KillFame' => 5000,
        ]);
        static::getContainer()->set(PlayerService::class, $playerServiceMock);

        $client->request('GET', '/api/player/p1', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);

        $this->assertResponseStatusCodeSame(200);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('OK', $content['statut']);
        $this->assertEquals('TestPlayer', $content['player']['Name']);
    }
}
