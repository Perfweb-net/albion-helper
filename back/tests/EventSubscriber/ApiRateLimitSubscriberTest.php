<?php

namespace App\Tests\EventSubscriber;

use App\Entity\User;
use App\EventSubscriber\ApiRateLimitSubscriber;
use PHPUnit\Framework\TestCase;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\RateLimiter\Storage\InMemoryStorage;

class ApiRateLimitSubscriberTest extends TestCase
{
    private function makeSubscriber(?User $user, int $limit = 2): ApiRateLimitSubscriber
    {
        $factory = new RateLimiterFactory(
            ['id' => 'test_api', 'policy' => 'sliding_window', 'limit' => $limit, 'interval' => '1 minute'],
            new InMemoryStorage(),
        );

        $security = $this->createMock(Security::class);
        $security->method('getUser')->willReturn($user);

        return new ApiRateLimitSubscriber($factory, $security);
    }

    private function makeEvent(string $path, string $ip = '10.0.0.1'): RequestEvent
    {
        $kernel = $this->createMock(HttpKernelInterface::class);
        $request = Request::create($path, 'GET', server: ['REMOTE_ADDR' => $ip]);

        return new RequestEvent($kernel, $request, HttpKernelInterface::MAIN_REQUEST);
    }

    public function testAllowsRequestsUnderTheLimit(): void
    {
        $subscriber = $this->makeSubscriber(user: null, limit: 2);

        $event = $this->makeEvent('/api/items/search');
        $subscriber->onKernelRequest($event);

        $this->assertFalse($event->hasResponse());
    }

    public function testBlocksRequestsOverTheLimitWith429(): void
    {
        $subscriber = $this->makeSubscriber(user: null, limit: 2);

        $subscriber->onKernelRequest($this->makeEvent('/api/items/search'));
        $subscriber->onKernelRequest($this->makeEvent('/api/items/search'));
        $thirdEvent = $this->makeEvent('/api/items/search');
        $subscriber->onKernelRequest($thirdEvent);

        $this->assertTrue($thirdEvent->hasResponse());
        $this->assertSame(429, $thirdEvent->getResponse()->getStatusCode());
    }

    public function testCountsPerUserNotGlobally(): void
    {
        $factory = new RateLimiterFactory(
            ['id' => 'test_api', 'policy' => 'sliding_window', 'limit' => 1, 'interval' => '1 minute'],
            new InMemoryStorage(),
        );
        $userA = $this->createMock(Security::class);
        $userA->method('getUser')->willReturn(null);

        $subscriber = new ApiRateLimitSubscriber($factory, $userA);

        // Deux IP différentes ne doivent pas partager le même quota.
        $subscriber->onKernelRequest($this->makeEvent('/api/items/search', '10.0.0.1'));
        $eventFromOtherIp = $this->makeEvent('/api/items/search', '10.0.0.2');
        $subscriber->onKernelRequest($eventFromOtherIp);

        $this->assertFalse($eventFromOtherIp->hasResponse());
    }

    public function testHealthCheckIsNeverLimited(): void
    {
        $subscriber = $this->makeSubscriber(user: null, limit: 1);

        $subscriber->onKernelRequest($this->makeEvent('/api/health'));
        $secondEvent = $this->makeEvent('/api/health');
        $subscriber->onKernelRequest($secondEvent);

        $this->assertFalse($secondEvent->hasResponse());
    }

    public function testNonApiRoutesAreIgnored(): void
    {
        $subscriber = $this->makeSubscriber(user: null, limit: 1);

        $subscriber->onKernelRequest($this->makeEvent('/somewhere'));
        $secondEvent = $this->makeEvent('/somewhere');
        $subscriber->onKernelRequest($secondEvent);

        $this->assertFalse($secondEvent->hasResponse());
    }
}
