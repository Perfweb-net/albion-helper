<?php

namespace App\DataFixtures;

use App\Entity\GameRoute;
use App\Entity\RouteZone;
use App\Entity\SearchLog;
use App\Entity\User;
use App\Service\ReferenceDataSeeder;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly EntityManagerInterface $entityManager,
    ) {
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

        // Données de référence du jeu (zones/mobs/ressources/markers, recettes de
        // craft) : logique partagée avec app:seed-reference-data, cf. ReferenceDataSeeder.
        $seeder = new ReferenceDataSeeder($this->entityManager);
        $seeder->seedZones();
        $seeder->seedCraftingRecipes();
    }
}
