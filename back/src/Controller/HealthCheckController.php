<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class HealthCheckController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly HttpClientInterface $httpClient
    ) {
    }

    #[Route('/api/health', name: 'api_health', methods: ['GET'])]
    public function check(): JsonResponse
    {
        $status = [
            'status' => 'OK',
            'timestamp' => date('c'),
            'services' => [
                'database' => $this->checkDatabase(),
                'albion_api' => $this->checkAlbionApi(),
            ]
        ];

        $statusCode = 200;
        foreach ($status['services'] as $service) {
            if ($service['status'] !== 'OK') {
                $status['status'] = 'ERROR';
                $statusCode = 503;
                break;
            }
        }

        return new JsonResponse($status, $statusCode);
    }

    private function checkDatabase(): array
    {
        try {
            $this->entityManager->getConnection()->connect();
            return ['status' => 'OK', 'message' => 'Database connected'];
        } catch (\Exception $e) {
            return ['status' => 'ERROR', 'message' => 'Database connection failed'];
        }
    }

    private function checkAlbionApi(): array
    {
        try {
            // Simple check to Albion Data Project API
            $response = $this->httpClient->request('GET', 'https://www.albion-online-data.com/api/v2/stats/prices/T4_BAG');
            if ($response->getStatusCode() === 200) {
                return ['status' => 'OK', 'message' => 'Albion API reachable'];
            }
            return ['status' => 'ERROR', 'message' => 'Albion API returned status ' . $response->getStatusCode()];
        } catch (\Exception $e) {
            return ['status' => 'ERROR', 'message' => 'Albion API unreachable'];
        }
    }
}
