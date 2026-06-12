<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class GuildService
{
    private const BASE_URL = 'https://gameinfo-ams.albiononline.com/api/gameinfo/guilds/';

    public function __construct(
        private readonly HttpClientInterface $client
    ) {
    }

    public function getFullGuildData(string $id): array
    {
        $responses = [
            'info' => $this->client->request('GET', self::BASE_URL . $id),
            'members' => $this->client->request('GET', self::BASE_URL . $id . '/members'),
            'data' => $this->client->request('GET', self::BASE_URL . $id . '/data'),
            'top' => $this->client->request('GET', self::BASE_URL . $id . '/top'),
        ];

        return [
            'guild' => $responses['info']->toArray(),
            'members' => $responses['members']->toArray(),
            'data' => $responses['data']->toArray(),
            'top' => $responses['top']->toArray(),
        ];
    }
}
