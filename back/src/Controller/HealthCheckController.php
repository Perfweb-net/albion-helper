<?php

namespace App\Controller;

use App\Service\AppMailer;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class HealthCheckController extends AbstractController
{
    // La sonde cron interroge /api/health toutes les 5 minutes : sans ce délai
    // de grâce, une panne prolongée déclencherait un e-mail à chaque passage.
    private const ALERT_COOLDOWN_SECONDS = 1800;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly HttpClientInterface $httpClient,
        private readonly AppMailer $mailer,
        private readonly CacheItemPoolInterface $cache,
        private readonly LoggerInterface $logger,
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
        $failing = array_filter($status['services'], fn (array $s) => $s['status'] !== 'OK');
        if ($failing !== []) {
            $status['status'] = 'ERROR';
            $statusCode = 503;
            $this->sendAlert($failing);
        }

        return new JsonResponse($status, $statusCode);
    }

    /**
     * Envoie l'e-mail d'alerte avec le détail des services en erreur,
     * au plus une fois par fenêtre de cooldown.
     *
     * @param array<string, array{status: string, message: string}> $failingServices
     */
    private function sendAlert(array $failingServices): void
    {
        try {
            $cooldown = $this->cache->getItem('health_alert_cooldown');
            if ($cooldown->isHit()) {
                return;
            }

            $this->mailer->sendHealthAlert($failingServices);

            $cooldown->set(true)->expiresAfter(self::ALERT_COOLDOWN_SECONDS);
            $this->cache->save($cooldown);
        } catch (\Throwable $e) {
            // L'alerte ne doit jamais faire échouer la sonde elle-même
            $this->logger->error('Échec d\'envoi de l\'alerte health check : ' . $e->getMessage());
        }
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
