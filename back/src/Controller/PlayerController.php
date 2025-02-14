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

class PlayerController extends AbstractController
{
    private HttpClientInterface $client;

    public function __construct(HttpClientInterface $client)
    {
        $this->client = $client;
    }

    // Méthode de recherche de joueur
    #[Route('/api/player/search', methods: ['GET'])]
    public function searchPlayer(Request $request): JsonResponse
    {
        $pseudo = $request->query->get('pseudo');
        $url = 'https://gameinfo-ams.albiononline.com/api/gameinfo/search?q=' . urlencode($pseudo);
        $response = $this->client->request('GET', $url);
        return new JsonResponse($response->toArray());
    }

    #[Route('/api/player/{id}', methods: ['GET'])]
    public function getPlayerData($id): JsonResponse
    {
        $url = 'https://gameinfo-ams.albiononline.com/api/gameinfo/players/' . $id;
        $response = $this->client->request('GET', $url);
        return new JsonResponse(['statut' => 'OK', 'player' => $response->toArray()]);
    }
}
