<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class EmailVerificationController extends AbstractController
{
    // Confirme l'adresse e-mail via le jeton reçu à l'inscription. Route publique :
    // l'utilisateur clique le lien du mail sans être nécessairement connecté.
    #[Route('/api/email/verify', name: 'api_email_verify', methods: ['POST'])]
    public function verify(Request $request, UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? '';

        if (empty($token)) {
            return new JsonResponse(['error' => 'Missing token'], 400);
        }

        $user = $userRepository->findOneBy(['emailVerificationTokenHash' => hash('sha256', $token)]);
        if (!$user) {
            return new JsonResponse(['error' => 'Invalid token'], 400);
        }

        // Compte historique : l'adresse en attente est promue au moment de la
        // confirmation (re-contrôle d'unicité : elle a pu être prise entre-temps)
        if ($user->getPendingEmail() !== null) {
            if ($userRepository->findOneBy(['email' => $user->getPendingEmail()])) {
                return new JsonResponse(['error' => 'Email already in use'], 400);
            }
            $user->setEmail($user->getPendingEmail());
            $user->setPendingEmail(null);
        }

        $user->setEmailVerifiedAt(new \DateTimeImmutable());
        $user->setEmailVerificationTokenHash(null);
        $userRepository->save($user, true);

        return new JsonResponse(['status' => 'Email verified']);
    }
}
