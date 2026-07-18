<?php

namespace App\Tests\Service;

use App\Entity\CraftingRecipe;
use App\Entity\Zone;
use App\Service\ReferenceDataSeeder;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class ReferenceDataSeederTest extends KernelTestCase
{
    private EntityManagerInterface $em;
    private string $mapJsonPath;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->em = static::getContainer()->get(EntityManagerInterface::class);
        // Isolation entre tests (et entre runs) : chaque test tourne dans sa
        // propre transaction, annulée en tearDown — la base de test n'est
        // jamais polluée par des données restantes d'un run précédent.
        $this->em->getConnection()->beginTransaction();

        $this->mapJsonPath = sys_get_temp_dir() . '/seeder_test_map_' . uniqid('', true) . '.json';
        file_put_contents($this->mapJsonPath, json_encode([
            [
                'name' => 'Testville',
                'tier' => 4,
                'type' => 'PLAYERCITY_SAFEAREA_01',
                'color' => 'city',
                'zoneInfo' => [
                    'resources' => [['name' => 'Wood', 'tier' => 4, 'count' => 3]],
                    'mobs' => [['name' => 'Direboar', 'tier' => 4, 'count' => 2]],
                    'markers' => [['name' => 'Bank', 'posX' => 10, 'posY' => 20]],
                ],
            ],
        ]));
    }

    protected function tearDown(): void
    {
        if ($this->em->getConnection()->isTransactionActive()) {
            $this->em->getConnection()->rollBack();
        }
        @unlink($this->mapJsonPath);
        parent::tearDown();
    }

    private function seeder(): ReferenceDataSeeder
    {
        return new ReferenceDataSeeder($this->em, $this->mapJsonPath);
    }

    public function testSeedZonesCreatesZoneWithChildren(): void
    {
        $created = $this->seeder()->seedZones();
        $this->assertSame(1, $created);

        // Collections inverse-side : on repart d'un EM propre pour forcer un
        // rechargement depuis la base plutôt que l'objet en mémoire post-persist.
        $this->em->clear();
        $zone = $this->em->getRepository(Zone::class)->findOneBy(['name' => 'Testville']);
        $this->assertNotNull($zone);
        $this->assertCount(1, $zone->getResources());
        $this->assertCount(1, $zone->getMobs());
        $this->assertCount(1, $zone->getMarkers());
    }

    public function testSeedZonesIsIdempotent(): void
    {
        $this->seeder()->seedZones();
        $secondRun = $this->seeder()->seedZones();

        $this->assertSame(0, $secondRun);
        $count = count($this->em->getRepository(Zone::class)->findBy(['name' => 'Testville']));
        $this->assertSame(1, $count);
    }

    public function testSeedCraftingRecipesIsIdempotent(): void
    {
        $firstRun = $this->seeder()->seedCraftingRecipes();
        $secondRun = $this->seeder()->seedCraftingRecipes();

        $this->assertGreaterThan(0, $firstRun);
        $this->assertSame(0, $secondRun);

        $repo = $this->em->getRepository(CraftingRecipe::class);
        $count = count($repo->findBy(['uniqueName' => 'T4_PLANKS']));
        $this->assertSame(1, $count);
    }
}
