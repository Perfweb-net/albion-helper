<?php

namespace App\Controller;

use App\Entity\GameRoute;
use App\Entity\RouteZone;
use App\Repository\GameRouteRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;

class RouteController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly GameRouteRepository $routeRepository
    ) {}

    #[Route('/api/routes', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        $routes = $this->routeRepository->findBy(['user' => $user]);

        return new JsonResponse(array_map(fn($r) => $this->serialize($r), $routes));
    }

    #[Route('/api/routes', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name'])) {
            return new JsonResponse(['error' => 'Route name is required'], 400);
        }

        $zones = $data['zones'] ?? [];
        if (count($zones) > 8) {
            return new JsonResponse(['error' => 'Maximum 8 zones per route'], 400);
        }

        $route = new GameRoute();
        $route->setName(substr($data['name'], 0, 100));
        $route->setUser($this->getUser());

        foreach ($zones as $i => $zoneData) {
            $zone = new RouteZone();
            $zone->setZoneName(substr($zoneData['zoneName'] ?? '', 0, 150));
            $zone->setTimerMinutes((int) ($zoneData['timerMinutes'] ?? 30));
            $zone->setPosition($i);
            $route->addZone($zone);
        }

        $this->em->persist($route);
        $this->em->flush();

        return new JsonResponse($this->serialize($route), 201);
    }

    #[Route('/api/routes/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $route = $this->routeRepository->find($id);

        if (!$route || $route->getUser()->getId() !== $this->getUser()->getId()) {
            return new JsonResponse(['error' => 'Route not found'], 404);
        }

        $this->em->remove($route);
        $this->em->flush();

        return new JsonResponse(['status' => 'deleted']);
    }

    #[Route('/api/routes/share/{token}', methods: ['GET'])]
    public function share(string $token): JsonResponse
    {
        $route = $this->routeRepository->findOneBy(['shareToken' => $token]);

        if (!$route) {
            return new JsonResponse(['error' => 'Route not found'], 404);
        }

        if ($route->isExpired()) {
            return new JsonResponse(['error' => 'Route has expired'], 410);
        }

        return new JsonResponse($this->serialize($route));
    }

    private function serialize(GameRoute $route): array
    {
        $now = new \DateTimeImmutable();
        $diff = $route->getExpiresAt()->getTimestamp() - $now->getTimestamp();

        return [
            'id' => $route->getId(),
            'name' => $route->getName(),
            'shareToken' => $route->getShareToken(),
            'createdAt' => $route->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'expiresAt' => $route->getExpiresAt()->format(\DateTimeInterface::ATOM),
            'isExpired' => $route->isExpired(),
            'secondsRemaining' => max(0, $diff),
            'zones' => $route->getZones()->map(fn($z) => [
                'id' => $z->getId(),
                'zoneName' => $z->getZoneName(),
                'timerMinutes' => $z->getTimerMinutes(),
                'position' => $z->getPosition(),
            ])->toArray(),
        ];
    }
}
