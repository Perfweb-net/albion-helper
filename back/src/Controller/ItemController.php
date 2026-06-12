<?php

namespace App\Controller;

use App\Repository\ItemRepository;
use App\Service\ItemMarketService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ItemController extends AbstractController
{
    public function __construct(
        private readonly ItemRepository $itemRepository,
        private readonly ItemMarketService $marketService,
        private readonly HttpClientInterface $client,
    ) {}

    #[Route('/api/items/search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $q    = trim($request->query->get('q', ''));
        $tier = $request->query->get('tier') !== null && $request->query->get('tier') !== ''
            ? (int) $request->query->get('tier')
            : null;
        $lang = $request->query->get('lang', 'en');

        if ($q === '' && $tier === null) {
            return new JsonResponse([]);
        }

        $langMap = [
            'fr' => 'FR-FR', 'en' => 'EN-US', 'de' => 'DE-DE', 'es' => 'ES-ES',
            'pt' => 'PT-BR', 'ru' => 'RU-RU', 'it' => 'IT-IT', 'pl' => 'PL-PL',
            'zh' => 'ZH-CN', 'ko' => 'KO-KR', 'ja' => 'JA-JP', 'tr' => 'TR-TR',
        ];
        $langKey = $langMap[$lang] ?? 'EN-US';

        $items = $this->itemRepository->search($q, $tier, $langKey);

        return new JsonResponse(array_map(function ($item) use ($langKey) {
            $names      = $item->getLocalizedNames();
            $uniqueName = $item->getUniqueName();

            return [
                'uniqueName'     => $uniqueName,
                'name'           => $names[$langKey] ?? $names['EN-US'] ?? $uniqueName,
                'localizedNames' => $names,
                'tier'           => $item->getTier(),
                'iconUrl'        => 'https://render.albiononline.com/v1/item/' . $uniqueName . '.png',
            ];
        }, $items));
    }

    #[Route('/api/items/count', methods: ['GET'])]
    public function count(): JsonResponse
    {
        return new JsonResponse(['count' => $this->itemRepository->countAll()]);
    }

    #[Route('/api/items/{uniqueName}/market', methods: ['GET'], requirements: ['uniqueName' => '[A-Za-z0-9_@]+'])]
    public function market(string $uniqueName, Request $request): JsonResponse
    {
        $quality = max(1, min(5, (int) $request->query->get('quality', 1)));
        return new JsonResponse($this->marketService->getMarketData($uniqueName, $quality));
    }

    #[Route('/api/items/{uniqueName}/market/refresh', methods: ['POST'], requirements: ['uniqueName' => '[A-Za-z0-9_@]+'])]
    public function refreshMarket(string $uniqueName, Request $request): JsonResponse
    {
        $quality = max(1, min(5, (int) $request->query->get('quality', 1)));
        return new JsonResponse($this->marketService->refreshMarketData($uniqueName, $quality));
    }

    #[Route('/api/items/market/batch', methods: ['POST'])]
    public function marketBatch(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $items = array_unique(array_slice($data['items'] ?? [], 0, 60));
        $quality = max(1, min(5, (int) ($data['quality'] ?? 1)));
        $result = [];
        foreach ($items as $uniqueName) {
            if (!preg_match('/^[A-Za-z0-9_@]+$/', $uniqueName)) continue;
            try {
                $result[$uniqueName] = $this->marketService->getMarketData($uniqueName, $quality);
            } catch (\Throwable) {
                $result[$uniqueName] = null;
            }
        }
        return new JsonResponse($result);
    }

    #[Route('/api/proxy/icon/{uniqueName}', methods: ['GET'], requirements: ['uniqueName' => '[A-Za-z0-9_@:]+'])]
    public function proxyIcon(string $uniqueName): Response
    {
        $url = 'https://render.albiononline.com/v1/item/' . $uniqueName . '.png';
        try {
            $upstream = $this->client->request('GET', $url);
            $content  = $upstream->getContent();
        } catch (\Throwable) {
            return new Response('', 404);
        }
        return new Response($content, 200, [
            'Content-Type'                => 'image/png',
            'Cache-Control'               => 'public, max-age=86400',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
