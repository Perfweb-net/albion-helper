<?php

namespace App\Controller;

use App\Entity\SearchLog;
use App\Service\GuildService;
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
    public function getGuildData(string $id): JsonResponse
    {
        $this->em->persist(new SearchLog('guild', $id));
        $this->em->flush();
        $data = $this->guildService->getFullGuildData($id);
        return new JsonResponse(array_merge(['statut' => 'OK'], $data));
    }
}
