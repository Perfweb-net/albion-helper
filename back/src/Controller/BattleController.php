<?php

namespace App\Controller;

use App\Entity\SearchLog;
use App\Service\BattleService;
use App\Service\ServerRegion;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class BattleController extends AbstractController
{
    public function __construct(
        private readonly BattleService $battleService,
        private readonly EntityManagerInterface $em
    ) {
    }

    #[Route('/api/battles/search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $server = ServerRegion::fromRequest($request);
        $query = trim((string) $request->query->get('q', ''));
        if (mb_strlen($query) < 2) {
            return new JsonResponse(['guilds' => [], 'alliances' => []]);
        }
        $this->em->persist(new SearchLog('battle', $query, $server));
        $this->em->flush();
        return new JsonResponse($this->battleService->search($query, $server));
    }

    #[Route('/api/battles', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $guildId = $request->query->get('guildId');
        $allianceId = $request->query->get('allianceId');
        if (!$guildId && !$allianceId) {
            return new JsonResponse(['error' => 'guildId ou allianceId requis'], 400);
        }
        $battles = $this->battleService->listBattles(
            (string) $request->query->get('range', 'week'),
            $guildId,
            $allianceId,
            (int) $request->query->get('limit', 20),
            (int) $request->query->get('offset', 0),
            ServerRegion::fromRequest($request),
        );
        return new JsonResponse($battles);
    }

    #[Route('/api/battles/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function detail(int $id, Request $request): JsonResponse
    {
        return new JsonResponse($this->battleService->getBattleDetail($id, ServerRegion::fromRequest($request)));
    }
}
