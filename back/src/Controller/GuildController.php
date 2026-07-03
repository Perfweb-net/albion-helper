<?php

namespace App\Controller;

use App\Entity\SearchLog;
use App\Service\GuildService;
use App\Service\ServerRegion;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class GuildController extends AbstractController
{
    public function __construct(
        private readonly GuildService $guildService,
        private readonly EntityManagerInterface $em
    ) {
    }

    #[Route('/api/guilds/{id}', methods: ['GET'])]
    public function getGuildData(string $id, Request $request): JsonResponse
    {
        $server = ServerRegion::fromRequest($request);
        $this->em->persist(new SearchLog('guild', $id, $server));
        $this->em->flush();
        $data = $this->guildService->getFullGuildData($id, $server);
        return new JsonResponse(array_merge(['statut' => 'OK'], $data));
    }
}
