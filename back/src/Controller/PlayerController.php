<?php

namespace App\Controller;

use App\Entity\SearchLog;
use App\Service\PlayerService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class PlayerController extends AbstractController
{
    public function __construct(
        private readonly PlayerService $playerService,
        private readonly EntityManagerInterface $em
    ) {
    }

    #[Route('/api/player/search', methods: ['GET'])]
    public function searchPlayer(Request $request): JsonResponse
    {
        $pseudo = $request->query->get('pseudo');
        if ($pseudo) {
            $this->em->persist(new SearchLog('player', $pseudo));
            $this->em->flush();
        }
        return new JsonResponse($this->playerService->search($pseudo));
    }

    #[Route('/api/player/{id}', methods: ['GET'])]
    public function getPlayerData(string $id): JsonResponse
    {
        return new JsonResponse([
            'statut' => 'OK',
            'player' => $this->playerService->getPlayerData($id),
        ]);
    }
}
