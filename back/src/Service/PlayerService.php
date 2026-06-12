<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class PlayerService
{
    private const BASE_URL = 'https://gameinfo-ams.albiononline.com/api/gameinfo/';

    public function __construct(
        private readonly HttpClientInterface $client
    ) {
    }

    public function search(string $pseudo): array
    {
        $response = $this->client->request('GET', self::BASE_URL . 'search?q=' . urlencode($pseudo));
        return $response->toArray();
    }

    public function getPlayerData(string $id): array
    {
        $response = $this->client->request('GET', self::BASE_URL . 'players/' . $id);
        return $response->toArray();
    }
}
