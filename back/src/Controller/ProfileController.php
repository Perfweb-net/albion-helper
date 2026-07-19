<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Service\AppMailer;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
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

    // Rétro-compatibilité : les comptes créés avant la v3.2.0 (sans e-mail)
    // ajoutent leur adresse ici. Elle attend dans pendingEmail jusqu'au clic
    // sur le lien de confirmation — le compte reste utilisable entre-temps.
    #[Route('/api/profile/email', methods: ['POST'])]
    public function addEmail(
        Request $request,
        UserRepository $userRepository,
        AppMailer $mailer,
        LoggerInterface $logger,
    ): JsonResponse {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if ($user->getEmail() !== null) {
            return new JsonResponse(['error' => 'An email is already linked to this account'], 400);
        }

        $data = json_decode($request->getContent(), true);
        $email = trim($data['email'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Invalid email'], 400);
        }
        if ($userRepository->findOneBy(['email' => $email])) {
            return new JsonResponse(['error' => 'Email already in use'], 400);
        }

        $token = bin2hex(random_bytes(32));
        $user->setPendingEmail($email);
        $user->setEmailVerificationTokenHash(hash('sha256', $token));
        $this->em->flush();

        try {
            $mailer->sendEmailVerification($user, $token, $email);
        } catch (\Throwable $e) {
            $logger->error('Échec d\'envoi du mail de confirmation (ajout d\'adresse) : ' . $e->getMessage());
            return new JsonResponse(['error' => 'Could not send the verification email, try again later'], 500);
        }

        return new JsonResponse(['status' => 'Verification email sent']);
    }
}
