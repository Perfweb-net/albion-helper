<?php

namespace App\Tests\Service;

use App\Service\PlayerService;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class PlayerServiceTest extends TestCase
{
    public function testSearch(): void
    {
        $client = $this->createMock(HttpClientInterface::class);
        $response = $this->createMock(ResponseInterface::class);

        $response->method('toArray')->willReturn(['players' => [['Id' => '123', 'Name' => 'TestPlayer']]]);
        $client->method('request')->willReturn($response);

        $service = new PlayerService($client);
        $result = $service->search('TestPlayer');

        $this->assertArrayHasKey('players', $result);
        $this->assertEquals('TestPlayer', $result['players'][0]['Name']);
    }
}
