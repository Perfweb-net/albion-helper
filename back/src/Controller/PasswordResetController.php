<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Service\AppMailer;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Annotation\Route;

class PasswordResetController extends AbstractController
{
    private const PASSWORD_MIN_LENGTH = 8;
    private const TOKEN_TTL = '+1 hour';

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly AppMailer $mailer,
        private readonly LoggerInterface $logger,
    ) {
    }

    // Demande de réinitialisation : la réponse est toujours 200 avec le même
    // message, que l'adresse existe ou non — sinon la route permettrait
    // d'énumérer les e-mails des comptes existants.
    #[Route('/api/password/forgot', name: 'api_password_forgot', methods: ['POST'])]
    public function forgot(Request $request, RateLimiterFactoryInterface $passwordResetLimiter): JsonResponse
    {
        $limiter = $passwordResetLimiter->create($request->getClientIp());
        if (!$limiter->consume(1)->isAccepted()) {
            return new JsonResponse(['error' => 'Too many reset attempts, try again later'], 429);
        }

        $data = json_decode($request->getContent(), true);
        $email = trim($data['email'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Invalid email'], 400);
        }

        $genericResponse = new JsonResponse(['status' => 'If this email is linked to an account, a reset link has been sent']);

        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            return $genericResponse;
        }

        $plainToken = bin2hex(random_bytes(32));
        $user->setResetTokenHash(hash('sha256', $plainToken));
        $user->setResetTokenExpiresAt(new \DateTimeImmutable(self::TOKEN_TTL));
        $this->userRepository->save($user, true);

        try {
            $this->mailer->sendPasswordReset($user, $plainToken);
        } catch (\Throwable $e) {
            // Réponse générique conservée même en cas d'échec d'envoi : une
            // erreur différenciée révélerait que l'adresse existe en base.
            $this->logger->error('Échec d\'envoi du mail de reset : ' . $e->getMessage());
        }

        return $genericResponse;
    }

    #[Route('/api/password/reset', name: 'api_password_reset', methods: ['POST'])]
    public function reset(Request $request, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($token) || empty($password)) {
            return new JsonResponse(['error' => 'Missing token or password'], 400);
        }

        if (mb_strlen($password) < self::PASSWORD_MIN_LENGTH) {
            return new JsonResponse(['error' => sprintf('Password must be at least %d characters long', self::PASSWORD_MIN_LENGTH)], 400);
        }

        $user = $this->userRepository->findOneBy(['resetTokenHash' => hash('sha256', $token)]);
        if (!$user || $user->getResetTokenExpiresAt() === null || $user->getResetTokenExpiresAt() < new \DateTimeImmutable()) {
            return new JsonResponse(['error' => 'Invalid or expired token'], 400);
        }

        $user->setPassword($passwordHasher->hashPassword($user, $password));
        // Jeton à usage unique : invalidé dès que le mot de passe est changé
        $user->setResetTokenHash(null);
        $user->setResetTokenExpiresAt(null);
        $this->userRepository->save($user, true);

        return new JsonResponse(['status' => 'Password updated']);
    }
}
