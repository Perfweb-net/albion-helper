<?php

namespace App\DataFixtures;

use App\Entity\CraftingRecipe;
use App\Entity\CraftingRecipeIngredient;
use App\Entity\GameRoute;
use App\Entity\Marker;
use App\Entity\RouteZone;
use App\Entity\SearchLog;
use App\Entity\User;
use App\Entity\Zone;
use App\Entity\Resource;
use App\Entity\Mob;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }
    private const BATCH_SIZE = 100;

    private function makeRecipe(string $uniqueName, string $category, string $subcategory, int $tier, int $focusCost, ?string $bonusCity, array $ingredients, ?string $name = null): CraftingRecipe
    {
        $recipe = new CraftingRecipe();
        $recipe->setUniqueName($uniqueName)
               ->setName($name)
               ->setCategory($category)
               ->setSubcategory($subcategory)
               ->setTier($tier)
               ->setFocusCostBase($focusCost)
               ->setBonusCity($bonusCity);
        foreach ($ingredients as [$name, $qty]) {
            $ing = new CraftingRecipeIngredient();
            $ing->setUniqueName($name)->setAmount($qty);
            $recipe->addIngredient($ing);
        }
        return $recipe;
    }

    private function loadCraftingRecipes(ObjectManager $manager): void
    {
        // --- REFINEMENT: Wood -> Planks ---
        $woodRefinement = [
            ['T4_PLANKS',  4, 100, [['T4_WOOD', 2], ['T3_PLANKS', 1]],     'Planches T4'],
            ['T5_PLANKS',  5, 200, [['T5_WOOD', 3], ['T4_PLANKS', 1]],     'Planches T5'],
            ['T6_PLANKS',  6, 400, [['T6_WOOD', 4], ['T5_PLANKS', 1]],     'Planches T6'],
            ['T7_PLANKS',  7, 800, [['T7_WOOD', 5], ['T6_PLANKS', 1]],     'Planches T7'],
            ['T8_PLANKS',  8, 1600, [['T8_WOOD', 6], ['T7_PLANKS', 1]],    'Planches T8'],
        ];
        foreach ($woodRefinement as [$un, $tier, $focus, $ings, $name]) {
            $manager->persist($this->makeRecipe($un, 'refinement', 'wood', $tier, $focus, 'Fort Sterling', $ings, $name));
        }

        // --- REFINEMENT: Ore -> Metal Bars ---
        $metalRefinement = [
            ['T4_METALBAR', 4, 100, [['T4_ORE', 2], ['T3_METALBAR', 1]],   'Barre de métal T4'],
            ['T5_METALBAR', 5, 200, [['T5_ORE', 3], ['T4_METALBAR', 1]],   'Barre de métal T5'],
            ['T6_METALBAR', 6, 400, [['T6_ORE', 4], ['T5_METALBAR', 1]],   'Barre de métal T6'],
            ['T7_METALBAR', 7, 800, [['T7_ORE', 5], ['T6_METALBAR', 1]],   'Barre de métal T7'],
            ['T8_METALBAR', 8, 1600, [['T8_ORE', 6], ['T7_METALBAR', 1]],  'Barre de métal T8'],
        ];
        foreach ($metalRefinement as [$un, $tier, $focus, $ings, $name]) {
            $manager->persist($this->makeRecipe($un, 'refinement', 'metal', $tier, $focus, 'Thetford', $ings, $name));
        }

        // --- REFINEMENT: Hide -> Leather ---
        $leatherRefinement = [
            ['T4_LEATHER', 4, 100, [['T4_HIDE', 2], ['T3_LEATHER', 1]],    'Cuir T4'],
            ['T5_LEATHER', 5, 200, [['T5_HIDE', 3], ['T4_LEATHER', 1]],    'Cuir T5'],
            ['T6_LEATHER', 6, 400, [['T6_HIDE', 4], ['T5_LEATHER', 1]],    'Cuir T6'],
            ['T7_LEATHER', 7, 800, [['T7_HIDE', 5], ['T6_LEATHER', 1]],    'Cuir T7'],
            ['T8_LEATHER', 8, 1600, [['T8_HIDE', 6], ['T7_LEATHER', 1]],   'Cuir T8'],
        ];
        foreach ($leatherRefinement as [$un, $tier, $focus, $ings, $name]) {
            $manager->persist($this->makeRecipe($un, 'refinement', 'hide', $tier, $focus, 'Martlock', $ings, $name));
        }

        // --- REFINEMENT: Fiber -> Cloth ---
        $clothRefinement = [
            ['T4_CLOTH', 4, 100, [['T4_FIBER', 2], ['T3_CLOTH', 1]],       'Tissu T4'],
            ['T5_CLOTH', 5, 200, [['T5_FIBER', 3], ['T4_CLOTH', 1]],       'Tissu T5'],
            ['T6_CLOTH', 6, 400, [['T6_FIBER', 4], ['T5_CLOTH', 1]],       'Tissu T6'],
            ['T7_CLOTH', 7, 800, [['T7_FIBER', 5], ['T6_CLOTH', 1]],       'Tissu T7'],
            ['T8_CLOTH', 8, 1600, [['T8_FIBER', 6], ['T7_CLOTH', 1]],      'Tissu T8'],
        ];
        foreach ($clothRefinement as [$un, $tier, $focus, $ings, $name]) {
            $manager->persist($this->makeRecipe($un, 'refinement', 'fiber', $tier, $focus, 'Lymhurst', $ings, $name));
        }

        // --- REFINEMENT: Rock -> Stone Blocks ---
        $stoneRefinement = [
            ['T4_STONEBLOCK', 4, 100, [['T4_ROCK', 2], ['T3_STONEBLOCK', 1]],   'Bloc de pierre T4'],
            ['T5_STONEBLOCK', 5, 200, [['T5_ROCK', 3], ['T4_STONEBLOCK', 1]],   'Bloc de pierre T5'],
            ['T6_STONEBLOCK', 6, 400, [['T6_ROCK', 4], ['T5_STONEBLOCK', 1]],   'Bloc de pierre T6'],
            ['T7_STONEBLOCK', 7, 800, [['T7_ROCK', 5], ['T6_STONEBLOCK', 1]],   'Bloc de pierre T7'],
            ['T8_STONEBLOCK', 8, 1600, [['T8_ROCK', 6], ['T7_STONEBLOCK', 1]],  'Bloc de pierre T8'],
        ];
        foreach ($stoneRefinement as [$un, $tier, $focus, $ings, $name]) {
            $manager->persist($this->makeRecipe($un, 'refinement', 'stone', $tier, $focus, 'Bridgewatch', $ings, $name));
        }

        // --- WEAPONS: Broadsword (1H sword) ---
        $swordAmounts = [4 => 4, 5 => 8, 6 => 12, 7 => 16, 8 => 20];
        $swordFocus   = [4 => 300, 5 => 600, 6 => 1200, 7 => 2400, 8 => 4800];
        foreach ($swordAmounts as $t => $qty) {
            $manager->persist($this->makeRecipe(
                "T{$t}_MAIN_SWORD", 'weapons', 'sword', $t, $swordFocus[$t], 'Lymhurst',
                [["T{$t}_METALBAR", $qty], ["T{$t}_PLANKS", $qty]],
                "Broadsword T{$t}"
            ));
        }

        // --- WEAPONS: Warbow (2H bow) ---
        $bowAmounts = [4 => 8, 5 => 16, 6 => 24, 7 => 32, 8 => 40];
        $bowFocus   = [4 => 600, 5 => 1200, 6 => 2400, 7 => 4800, 8 => 9600];
        foreach ($bowAmounts as $t => $qty) {
            $manager->persist($this->makeRecipe(
                "T{$t}_2H_BOW", 'weapons', 'bow', $t, $bowFocus[$t], 'Lymhurst',
                [["T{$t}_PLANKS", $qty], ["T{$t}_LEATHER", intval($qty / 2)]],
                "Warbow T{$t}"
            ));
        }

        // --- ARMOR: Plate Armor chest (Soldier Armor) ---
        $plateAmounts = [4 => 8, 5 => 16, 6 => 24, 7 => 32, 8 => 40];
        $plateFocus   = [4 => 600, 5 => 1200, 6 => 2400, 7 => 4800, 8 => 9600];
        foreach ($plateAmounts as $t => $qty) {
            $manager->persist($this->makeRecipe(
                "T{$t}_ARMOR_PLATE_SET1", 'armor', 'plate_chest', $t, $plateFocus[$t], 'Bridgewatch',
                [["T{$t}_METALBAR", $qty], ["T{$t}_LEATHER", intval($qty / 2)]],
                "Armure de soldat T{$t}"
            ));
        }

        // --- ARMOR: Leather chest (Hunter Armor) ---
        foreach ($plateAmounts as $t => $qty) {
            $manager->persist($this->makeRecipe(
                "T{$t}_ARMOR_LEATHER_SET1", 'armor', 'leather_chest', $t, $plateFocus[$t], 'Thetford',
                [["T{$t}_LEATHER", $qty], ["T{$t}_CLOTH", intval($qty / 2)]],
                "Armure de chasseur T{$t}"
            ));
        }

        // --- FOOD: Beef Stew (T4-T8) ---
        $foodData = [
            [4, 'T4_MEAL_STEW_BEEF',     'stew',     60,  [['T4_MEAT', 30], ['T4_VEGETABLE', 10]], 'Ragoût de bœuf T4'],
            [5, 'T5_MEAL_STEW_BEEF',     'stew',     120, [['T5_MEAT', 40], ['T5_VEGETABLE', 15]], 'Ragoût de bœuf T5'],
            [6, 'T6_MEAL_STEW_BEEF',     'stew',     240, [['T6_MEAT', 50], ['T6_VEGETABLE', 20]], 'Ragoût de bœuf T6'],
            [7, 'T7_MEAL_STEW_BEEF',     'stew',     480, [['T7_MEAT', 60], ['T7_VEGETABLE', 25]], 'Ragoût de bœuf T7'],
            [8, 'T8_MEAL_STEW_BEEF',     'stew',     960, [['T8_MEAT', 70], ['T8_VEGETABLE', 30]], 'Ragoût de bœuf T8'],
            [4, 'T4_MEAL_OMELETTE_PORK', 'omelette', 60,  [['T4_MEAT', 20], ['T1_EGG', 20]],       'Omelette au porc T4'],
            [5, 'T5_MEAL_OMELETTE_PORK', 'omelette', 120, [['T5_MEAT', 30], ['T1_EGG', 30]],       'Omelette au porc T5'],
            [6, 'T6_MEAL_OMELETTE_PORK', 'omelette', 240, [['T6_MEAT', 40], ['T1_EGG', 40]],       'Omelette au porc T6'],
        ];
        foreach ($foodData as [$t, $un, $sub, $focus, $ings, $name]) {
            $manager->persist($this->makeRecipe($un, 'food', $sub, $t, $focus, null, $ings, $name));
        }

        $manager->flush();
    }

    public function load(ObjectManager $manager): void
    {
        // Compte admin
        $admin = new User();
        $admin->setUsername('admin');
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin'));
        $admin->setRoles(['ROLE_USER', 'ROLE_ADMIN']);
        $admin->setCreatedAt(new \DateTimeImmutable('-10 days'));
        $manager->persist($admin);

        // Compte user standard
        $user = new User();
        $user->setUsername('test');
        $user->setPassword($this->passwordHasher->hashPassword($user, 'test'));
        $user->setRoles(['ROLE_USER']);
        $user->setCreatedAt(new \DateTimeImmutable('-5 days'));
        $manager->persist($user);

        // User créé aujourd'hui (pour KPI new_today)
        $newUser = new User();
        $newUser->setUsername('newplayer');
        $newUser->setPassword($this->passwordHasher->hashPassword($newUser, 'newplayer'));
        $newUser->setRoles(['ROLE_USER']);
        $newUser->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($newUser);

        $manager->flush();

        // Route de demo pour admin
        $route = new GameRoute();
        $route->setName('Farm T6 - Merlyn');
        $route->setUser($admin);
        $zone1 = new RouteZone(); $zone1->setZoneName('Merlyn\'s Rest')->setTimerMinutes(20)->setPosition(1)->setRoute($route);
        $zone2 = new RouteZone(); $zone2->setZoneName('Forest of Merlyn')->setTimerMinutes(15)->setPosition(2)->setRoute($route);
        $zone3 = new RouteZone(); $zone3->setZoneName('Deepwood Mire')->setTimerMinutes(25)->setPosition(3)->setRoute($route);
        $manager->persist($route);
        $manager->persist($zone1);
        $manager->persist($zone2);
        $manager->persist($zone3);

        // Route de demo pour user
        $route2 = new GameRoute();
        $route2->setName('Solo T4 quick run');
        $route2->setUser($user);
        $zone4 = new RouteZone(); $zone4->setZoneName('Thetford Outskirts')->setTimerMinutes(10)->setPosition(1)->setRoute($route2);
        $zone5 = new RouteZone(); $zone5->setZoneName('Thetford Forest')->setTimerMinutes(10)->setPosition(2)->setRoute($route2);
        $manager->persist($route2);
        $manager->persist($zone4);
        $manager->persist($zone5);

        // SearchLogs de demo
        foreach (['Equart', 'Borris', 'Zorn', 'MightyMage', 'Darkblade'] as $p) {
            $manager->persist(new SearchLog('player', $p));
        }
        foreach (['BlackArmy', 'Elevate', 'POE', 'SquadAlpha'] as $g) {
            $manager->persist(new SearchLog('guild', $g));
        }

        $manager->flush();

        // Crafting recipes seed
        $this->loadCraftingRecipes($manager);

        // Lire le fichier JSON
        $json = file_get_contents(__DIR__ . '/map.json'); // Utiliser le fichier nettoyé
        $data = json_decode($json, true);

        $i = 0;

        foreach ($data as $zoneData) {
            // Création de la Zone
            $zone = new Zone();
            $zone->setName($zoneData['name']);
            $zone->setTier($zoneData['tier']);
            $zone->setType($zoneData['type']);
            $zone->setColor($zoneData['color']);

            $manager->persist($zone);
            $i++;

            // Flush seulement si nécessaire
            if ($i % self::BATCH_SIZE === 0) {
                $manager->flush();
            }

            // Ajouter les ressources
            foreach ($zoneData['zoneInfo']['resources'] as $resourceData) {
                $resource = new Resource();
                $resource->setName($resourceData['name']);
                $resource->setTier($resourceData['tier']);
                $resource->setCount($resourceData['count']);
                $resource->setZone($zone); // Associer à la Zone

                $manager->persist($resource);
                $i++;
            }

            // Ajouter les mobs
            foreach ($zoneData['zoneInfo']['mobs'] as $mobData) {
                $mob = new Mob();
                $mob->setName($mobData['name']);
                $mob->setTier($mobData['tier']);
                $mob->setCount($mobData['count']);
                $mob->setZone($zone); // Associer à la Zone

                $manager->persist($mob);
                $i++;
            }

            foreach ($zoneData['zoneInfo']['markers'] as $markerData) {
                $marker = new Marker();
                $marker->setName($markerData['name']);
                $marker->setPosX($markerData['posX']);
                $marker->setPosY($markerData['posY']);
                $marker->setZone($zone); // Associer à la Zone

                $manager->persist($marker);
                $i++;
            }

            if ($i % self::BATCH_SIZE === 0) {
                $manager->flush();
            }
        }

        $manager->flush();
    }
}
