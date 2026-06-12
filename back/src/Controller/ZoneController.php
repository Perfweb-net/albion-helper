<?php

namespace App\Controller;

use App\Service\MapService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ZoneController extends AbstractController
{
    public function __construct(
        private readonly MapService $mapService
    ) {
    }

    #[Route('/api/map/search', methods: ['GET'])]
    public function searchMap(Request $request): JsonResponse
    {
        $search = $request->query->get('map');
        $maps = $this->mapService->searchMaps($search);

        return new JsonResponse(['statut' => 'OK', 'maps' => $maps]);
    }

    #[Route('/api/zones/autocomplete', methods: ['GET'])]
    public function autocomplete(Request $request): JsonResponse
    {
        $q = $request->query->get('q', '');
        $names = $this->mapService->autocompleteZones($q);

        return new JsonResponse($names);
    }
}
