<?php

namespace App\Tests\Service;

use App\Service\GuildService;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class GuildServiceTest extends TestCase
{
    public function testGetFullGuildData(): void
    {
        $client = $this->createMock(HttpClientInterface::class);

        $guildResponse = $this->createMock(ResponseInterface::class);
        $guildResponse->method('toArray')->willReturn(['Id' => 'guild123', 'Name' => 'TestGuild']);

        $membersResponse = $this->createMock(ResponseInterface::class);
        $membersResponse->method('toArray')->willReturn([['Id' => 'p1', 'Name' => 'Player1']]);

        $dataResponse = $this->createMock(ResponseInterface::class);
        $dataResponse->method('toArray')->willReturn(['killFame' => 1000]);

        $topResponse = $this->createMock(ResponseInterface::class);
        $topResponse->method('toArray')->willReturn(['topPlayers' => []]);

        $client->method('request')->willReturnOnConsecutiveCalls(
            $guildResponse,
            $membersResponse,
            $dataResponse,
            $topResponse
        );

        $service = new GuildService($client);
        $result = $service->getFullGuildData('guild123');

        $this->assertArrayHasKey('guild', $result);
        $this->assertArrayHasKey('members', $result);
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('top', $result);
        $this->assertEquals('TestGuild', $result['guild']['Name']);
        $this->assertCount(1, $result['members']);
    }
}
