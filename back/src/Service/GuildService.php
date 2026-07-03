<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class GuildService
{
    public function __construct(
        private readonly HttpClientInterface $client
    ) {
    }

    public function getFullGuildData(string $id, ?string $server = null): array
    {
        $base = ServerRegion::gameinfo($server) . 'guilds/';
        $responses = [
            'info' => $this->client->request('GET', $base . $id),
            'members' => $this->client->request('GET', $base . $id . '/members'),
            'data' => $this->client->request('GET', $base . $id . '/data'),
            'top' => $this->client->request('GET', $base . $id . '/top'),
        ];

        return [
            'guild' => $responses['info']->toArray(),
            'members' => $responses['members']->toArray(),
            'data' => $responses['data']->toArray(),
            'top' => $responses['top']->toArray(),
        ];
    }
}
