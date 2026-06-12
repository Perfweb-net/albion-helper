<?php

namespace App\Controller;

use App\Repository\GameRouteRepository;
use App\Repository\ItemRepository;
use App\Repository\SearchLogRepository;
use App\Repository\UserRepository;
use App\Service\ItemSyncService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;

class AdminController extends AbstractController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly GameRouteRepository $routeRepository,
        private readonly SearchLogRepository $searchLogRepository,
        private readonly EntityManagerInterface $em,
        private readonly ItemSyncService $itemSyncService,
        private readonly ItemRepository $itemRepository
    ) {}

    #[Route('/api/admin/stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $now = new \DateTimeImmutable();
        $today = new \DateTimeImmutable('today');

        $totalUsers = $this->userRepository->count([]);
        $newToday = $this->userRepository->countCreatedSince($today);
        $activeRoutes = $this->routeRepository->countActive();
        $totalRoutes = $this->routeRepository->count([]);
        $playerSearches = $this->searchLogRepository->countByType('player');
        $guildSearches = $this->searchLogRepository->countByType('guild');

        return new JsonResponse([
            'totalUsers' => $totalUsers,
            'newToday' => $newToday,
            'activeRoutes' => $activeRoutes,
            'totalRoutes' => $totalRoutes,
            'playerSearches' => $playerSearches,
            'guildSearches' => $guildSearches,
        ]);
    }

    #[Route('/api/admin/users', methods: ['GET'])]
    public function users(): JsonResponse
    {
        $users = $this->userRepository->findAll();

        return new JsonResponse(array_map(fn($u) => [
            'id' => $u->getId(),
            'username' => $u->getUsername(),
            'roles' => $u->getRoles(),
        ], $users));
    }

    #[Route('/api/admin/users/{id}/role', methods: ['PUT'])]
    public function updateRole(int $id, Request $request): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $makeAdmin = (bool) ($data['admin'] ?? false);

        $roles = $makeAdmin ? ['ROLE_USER', 'ROLE_ADMIN'] : ['ROLE_USER'];
        $user->setRoles($roles);
        $this->em->flush();

        return new JsonResponse(['id' => $user->getId(), 'roles' => $user->getRoles()]);
    }

    #[Route('/api/admin/users/{id}', methods: ['DELETE'])]
    public function deleteUser(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        if ($user->getId() === $this->getUser()->getId()) {
            return new JsonResponse(['error' => 'Cannot delete yourself'], 400);
        }

        $this->em->remove($user);
        $this->em->flush();

        return new JsonResponse(['status' => 'deleted']);
    }

    #[Route('/api/admin/sync-items', methods: ['POST'])]
    public function syncItems(): JsonResponse
    {
        set_time_limit(300);
        $result = $this->itemSyncService->syncItems();
        return new JsonResponse($result);
    }

    #[Route('/api/admin/items/count', methods: ['GET'])]
    public function itemsCount(): JsonResponse
    {
        return new JsonResponse(['items' => $this->itemRepository->countAll()]);
    }
}
