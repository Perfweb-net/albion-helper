<?php

namespace App\Controller;

use App\Entity\SearchLog;
use App\Service\PlayerService;
use App\Service\ServerRegion;
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
        $server = ServerRegion::fromRequest($request);
        $pseudo = $request->query->get('pseudo');
        if ($pseudo) {
            $this->em->persist(new SearchLog('player', $pseudo, $server));
            $this->em->flush();
        }
        return new JsonResponse($this->playerService->search($pseudo, $server));
    }

    #[Route('/api/player/{id}/kills', methods: ['GET'])]
    public function getKills(string $id, Request $request): JsonResponse
    {
        $limit = (int) $request->query->get('limit', 20);
        $offset = (int) $request->query->get('offset', 0);
        return new JsonResponse($this->playerService->getKills($id, $limit, $offset, ServerRegion::fromRequest($request)));
    }

    #[Route('/api/player/{id}/deaths', methods: ['GET'])]
    public function getDeaths(string $id, Request $request): JsonResponse
    {
        $limit = (int) $request->query->get('limit', 20);
        $offset = (int) $request->query->get('offset', 0);
        return new JsonResponse($this->playerService->getDeaths($id, $limit, $offset, ServerRegion::fromRequest($request)));
    }

    #[Route('/api/player/{id}/session', methods: ['GET'])]
    public function getSession(string $id, Request $request): JsonResponse
    {
        $limit = (int) $request->query->get('limit', 50);
        return new JsonResponse($this->playerService->getSessionReport($id, $limit, ServerRegion::fromRequest($request)));
    }

    #[Route('/api/player/{id}', methods: ['GET'])]
    public function getPlayerData(string $id, Request $request): JsonResponse
    {
        return new JsonResponse([
            'statut' => 'OK',
            'player' => $this->playerService->getPlayerData($id, ServerRegion::fromRequest($request)),
        ]);
    }
}
