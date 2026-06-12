<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ProfileController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface $em) {}

    #[Route('/api/profile/preferences', methods: ['GET'])]
    public function get(): JsonResponse
    {
        $user = $this->getUser();
        $defaults = [
            'city' => 'Caerleon',
            'premium' => false,
            'useFocus' => false,
            'dailyBonus' => 0,
            'specializations' => [
                'weapons'     => 0,
                'armor'       => 0,
                'food'        => 0,
                'refinement'  => 0,
            ],
        ];

        $prefs = $user->getPreferences() ?? [];
        return new JsonResponse(array_merge($defaults, $prefs));
    }

    #[Route('/api/profile/preferences', methods: ['PUT'])]
    public function update(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true) ?? [];

        $allowed = ['city', 'premium', 'useFocus', 'dailyBonus', 'specializations'];
        $current = $user->getPreferences() ?? [];
        foreach ($allowed as $key) {
            if (array_key_exists($key, $data)) {
                $current[$key] = $data[$key];
            }
        }

        $user->setPreferences($current);
        $this->em->flush();

        return new JsonResponse($current);
    }
}
