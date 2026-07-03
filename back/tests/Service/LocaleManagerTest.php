<?php

namespace App\Tests\Service;

use App\Service\LocaleManager;
use PHPUnit\Framework\TestCase;

class LocaleManagerTest extends TestCase
{
    private string $projectDir;
    private LocaleManager $manager;

    protected function setUp(): void
    {
        // Projet temporaire isolé avec une référence fr seedée.
        $this->projectDir = sys_get_temp_dir() . '/locale_test_' . uniqid('', true);
        mkdir($this->projectDir . '/data/locales', 0775, true);
        file_put_contents(
            $this->projectDir . '/data/locales/fr.json',
            json_encode([
                'nav' => ['dashboard' => 'Tableau de bord', 'map' => 'Carte'],
                'common' => ['save' => 'Enregistrer'],
            ]),
        );
        $this->manager = new LocaleManager($this->projectDir);
    }

    protected function tearDown(): void
    {
        foreach (glob($this->projectDir . '/data/locales/*.json') ?: [] as $f) {
            unlink($f);
        }
        @rmdir($this->projectDir . '/data/locales');
        @rmdir($this->projectDir . '/data');
        @rmdir($this->projectDir);
    }

    public function testListCodesReturnsSeededReference(): void
    {
        $this->assertSame(['fr'], $this->manager->listCodes());
    }

    public function testCreateClonesAllKeysWithEmptyValues(): void
    {
        $created = $this->manager->create('es');

        $this->assertArrayHasKey('nav', $created);
        $this->assertSame('', $created['nav']['dashboard']);
        $this->assertSame('', $created['nav']['map']);
        $this->assertSame('', $created['common']['save']);
        // La structure (clés) est identique à la référence.
        $this->assertSame(
            array_keys($this->manager->get('fr')['nav']),
            array_keys($created['nav']),
        );
        $this->assertContains('es', $this->manager->listCodes());
    }

    public function testCreateRejectsInvalidCode(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->manager->create('invalid_code_123');
    }

    public function testCreateRejectsDuplicate(): void
    {
        $this->manager->create('de');
        $this->expectException(\RuntimeException::class);
        $this->manager->create('de');
    }

    public function testCreateNormalizesCase(): void
    {
        $this->manager->create('PT-BR');
        $this->assertTrue($this->manager->exists('pt-br'));
        $this->assertContains('pt-br', $this->manager->listCodes());
    }

    public function testGetUnknownThrows404(): void
    {
        try {
            $this->manager->get('zz');
            $this->fail('Expected exception');
        } catch (\RuntimeException $e) {
            $this->assertSame(404, $e->getCode());
        }
    }

    public function testUpdateDeepMergesValues(): void
    {
        $this->manager->create('es');
        $this->manager->update('es', ['nav' => ['dashboard' => 'Panel']]);

        $es = $this->manager->get('es');
        $this->assertSame('Panel', $es['nav']['dashboard']);
        // Les autres clés restent présentes (fusion, pas remplacement).
        $this->assertSame('', $es['nav']['map']);
        $this->assertSame('', $es['common']['save']);
    }

    public function testDeleteRemovesLocale(): void
    {
        $this->manager->create('es');
        $this->manager->delete('es');
        $this->assertFalse($this->manager->exists('es'));
    }

    public function testReferenceCannotBeDeleted(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->manager->delete('fr');
    }
}
