<?php

namespace App\DataFixtures;

use App\Entity\Marker;
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
    private const BATCH_SIZE = 100; // Nombre d'objets avant un flush

    public function load(ObjectManager $manager): void
    {
        $user = new User();
        $user->setUsername('test'); // Nom d'utilisateur
        $user->setRoles(['ROLE_USER']); // Définir le rôle (admin si besoin)

        // Hacher le mot de passe avant de le stocker
        $hashedPassword = $this->passwordHasher->hashPassword($user, 'test');
        $user->setPassword($hashedPassword);

        $manager->persist($user);
        $manager->flush();

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
