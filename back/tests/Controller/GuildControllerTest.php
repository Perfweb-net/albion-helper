<?php

namespace App\Tests\Controller;

use App\Service\GuildService;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class GuildControllerTest extends WebTestCase
{
    private function getAuthToken(object $client): string
    {
        $username = 'guildtest_' . uniqid();
        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
        );
        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
        );
        return json_decode($client->getResponse()->getContent(), true)['token'];
    }

    public function testGetGuildDataRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/guilds/someGuildId');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testGetGuildDataWithAuth(): void
    {
        $client = static::createClient();
        $client->disableReboot();

        $token = $this->getAuthToken($client);

        $guildServiceMock = $this->createMock(GuildService::class);
        $guildServiceMock->method('getFullGuildData')->willReturn([
            'guild'   => ['Id' => 'g1', 'Name' => 'MockGuild'],
            'members' => [],
            'data'    => [],
            'top'     => [],
        ]);
        static::getContainer()->set(GuildService::class, $guildServiceMock);

        $client->request('GET', '/api/guilds/g1', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);

        $this->assertResponseStatusCodeSame(200);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('OK', $content['statut']);
        $this->assertEquals('MockGuild', $content['guild']['Name']);
    }
}
