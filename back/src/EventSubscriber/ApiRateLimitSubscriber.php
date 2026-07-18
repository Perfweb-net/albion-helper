<?php

namespace App\EventSubscriber;

use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;

/**
 * Garde-fou général sur l'API : 50 requêtes/minute par utilisateur connecté
 * (par IP pour les routes publiques). Priorité 0 sur kernel.request, en dessous
 * du firewall JWT (priorité 8, cf. Symfony\Component\Security\Http\Firewall) —
 * indispensable pour que Security::getUser() soit déjà résolu ici.
 */
class ApiRateLimitSubscriber implements EventSubscriberInterface
{
    // Jamais limité : sonde de supervision (deploy/healthcheck-probe.sh, */5 min).
    private const EXEMPT_PREFIXES = ['/api/health'];

    public function __construct(
        private readonly RateLimiterFactoryInterface $apiGeneralLimiter,
        private readonly Security $security,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::REQUEST => ['onKernelRequest', 0]];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $path = $request->getPathInfo();
        if (!str_starts_with($path, '/api')) {
            return;
        }
        foreach (self::EXEMPT_PREFIXES as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return;
            }
        }

        $user = $this->security->getUser();
        $key = $user ? 'user:' . $user->getUserIdentifier() : 'ip:' . $request->getClientIp();

        $limiter = $this->apiGeneralLimiter->create($key);
        if (!$limiter->consume(1)->isAccepted()) {
            $event->setResponse(new JsonResponse(
                ['error' => 'Too many requests, please slow down.'],
                429,
            ));
        }
    }
}
