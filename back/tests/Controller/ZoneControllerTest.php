<?php

namespace App\Tests\Controller;

use App\Service\MapService;
use App\Tests\RegistersUsersTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ZoneControllerTest extends WebTestCase
{
    use RegistersUsersTrait;

    private function getAuthToken(object $client): string
    {
        $username = 'zonetest_' . uniqid();
        $this->registerVerifiedUser($client, $username);
        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => 'password123'])
        );
        return json_decode($client->getResponse()->getContent(), true)['token'];
    }

    public function testSearchMapRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/map/search?map=Mar');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testSearchMapWithAuth(): void
    {
        $client = static::createClient();
        $client->disableReboot();

        $token = $this->getAuthToken($client);

        $mapServiceMock = $this->createMock(MapService::class);
        $mapServiceMock->method('searchMaps')->with('Mar')->willReturn([
            ['name' => 'Martlock', 'tier' => 5, 'type' => 'Blue', 'color' => '#0000FF', 'zoneInfo' => []],
        ]);
        static::getContainer()->set(MapService::class, $mapServiceMock);

        $client->request('GET', '/api/map/search?map=Mar', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);

        $this->assertResponseStatusCodeSame(200);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('OK', $content['statut']);
        $this->assertCount(1, $content['maps']);
        $this->assertEquals('Martlock', $content['maps'][0]['name']);
    }

    public function testSearchMapEmptyResult(): void
    {
        $client = static::createClient();
        $client->disableReboot();

        $token = $this->getAuthToken($client);

        $mapServiceMock = $this->createMock(MapService::class);
        $mapServiceMock->method('searchMaps')->willReturn([]);
        static::getContainer()->set(MapService::class, $mapServiceMock);

        $client->request('GET', '/api/map/search?map=ZoneInexistante', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);

        $this->assertResponseStatusCodeSame(200);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertCount(0, $content['maps']);
    }
}
