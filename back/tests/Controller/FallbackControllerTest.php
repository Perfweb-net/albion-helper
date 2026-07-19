<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class FallbackControllerTest extends WebTestCase
{
    public function testUnknownPathReturnsJsonNotFound(): void
    {
        $client = static::createClient();

        $client->request('GET', '/');
        $this->assertResponseStatusCodeSame(404);
        $this->assertResponseHeaderSame('Content-Type', 'application/json');

        $client->request('GET', '/nimporte/quoi');
        $this->assertResponseStatusCodeSame(404);
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Not found', $content['error']);
    }
}
