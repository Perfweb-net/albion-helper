<?php
// src/Controller/AuthController.php
namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\ZoneRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ZoneController extends AbstractController
{

    public function __construct()
    {
    }

    #[Route('/api/map/search', methods: ['GET'])]
    public function searchMap(Request $request, ZoneRepository $zoneRepository): JsonResponse
    {
        $search = $request->query->get('map');

        $maps = $zoneRepository->searchName($search);

        $maps = array_map(function ($map) {
            return [
                'name' => $map->getName(),
                'tier' => $map->getTier(),
                'type' => $map->getType(),
                'color' => $map->getColor(),
                'zoneInfo' => [
                    'markers' => array_map(function ($marker) {
                        return [
                            'name' => $marker->getName(),
                            'posX' => $marker->getPosX(),
                            'posY' => $marker->getPosY()
                        ];
                    }, $map->getMarkers()->toArray()), // Transformer la collection en tableau

                    'resources' => array_map(function ($resource) {
                        return [
                            'name' => $resource->getName(),
                            'tier' => $resource->getTier(),
                            'count' => $resource->getCount()
                        ];
                    }, $map->getResources()->toArray()), // Transformer la collection en tableau

                    'mobs' => array_map(function ($mob) {
                        return [
                            'name' => $mob->getName(),
                            'tier' => $mob->getTier(),
                            'count' => $mob->getCount()
                        ];
                    }, $map->getMobs()->toArray()) // Transformer la collection en tableau
                ]
            ];
        }, $maps);

        return new JsonResponse(['statut' => 'OK', 'maps' => $maps]);
    }
}
