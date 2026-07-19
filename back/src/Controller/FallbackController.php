<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class FallbackController extends AbstractController
{
    // Attrape-tout en toute dernière priorité : l'API est une machine à JSON,
    // une URL inconnue renvoie un 404 JSON minimal plutôt que la page d'erreur
    // HTML de Symfony (rien à afficher, rien à divulguer).
    // Les chemins /api/* restent couverts avant par le firewall (401 sans jeton).
    #[Route('/{path}', requirements: ['path' => '.*'], priority: -1000)]
    public function notFound(): JsonResponse
    {
        return new JsonResponse(['error' => 'Not found'], 404);
    }
}
