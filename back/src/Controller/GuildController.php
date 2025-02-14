<?php
// src/Controller/AuthController.php
namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class GuildController extends AbstractController
{
    private HttpClientInterface $client;

    public function __construct(HttpClientInterface $client)
    {
        $this->client = $client;
    }

    #[Route('/api/guild/{id}', methods: ['GET'])]
    public function getGuildData($id): JsonResponse
    {
        $url = 'https://gameinfo-ams.albiononline.com/api/gameinfo/guilds/' . $id;
        $guildInfo = $this->client->request('GET', $url);

        $url = 'https://gameinfo-ams.albiononline.com/api/gameinfo/guilds/' . $id . '/members';
        $guildMembers = $this->client->request('GET', $url);

        $url = 'https://gameinfo-ams.albiononline.com/api/gameinfo/guilds/' . $id . '/data';
        $guildData = $this->client->request('GET', $url);

        $url = 'https://gameinfo-ams.albiononline.com/api/gameinfo/guilds/' . $id . '/top';
        $guildTop = $this->client->request('GET', $url);

        return new JsonResponse(['statut' => 'OK', 'guild' => $guildInfo->toArray(), 'members' => $guildMembers->toArray(), 'data' => $guildData->toArray(), 'top' => $guildTop->toArray()]);
    }
}
