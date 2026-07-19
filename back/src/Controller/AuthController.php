<?php
// src/Controller/AuthController.php
namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class AuthController extends AbstractController
{
    private const PASSWORD_MIN_LENGTH = 8;

    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    // Méthode d'inscription
    #[Route('/api/register', methods: ['POST'])]
    public function register(Request $request, UserRepository $userRepository, RateLimiterFactoryInterface $registrationLimiter): JsonResponse
    {
        // Limite les créations de compte par IP (anti-abus)
        $limiter = $registrationLimiter->create($request->getClientIp());
        if (!$limiter->consume(1)->isAccepted()) {
            return new JsonResponse(['error' => 'Too many registration attempts, try again later'], 429);
        }

        $data = json_decode($request->getContent(), true);

        // Vérification des données
        if (empty($data['username']) || empty($data['password'])) {
            return new JsonResponse(['error' => 'Missing credentials'], 400);
        }

        // Politique de mot de passe : longueur minimale
        if (mb_strlen($data['password']) < self::PASSWORD_MIN_LENGTH) {
            return new JsonResponse(['error' => sprintf('Password must be at least %d characters long', self::PASSWORD_MIN_LENGTH)], 400);
        }

        // E-mail optionnel (nécessaire pour la réinitialisation de mot de passe)
        $email = trim($data['email'] ?? '');
        if ($email !== '') {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return new JsonResponse(['error' => 'Invalid email'], 400);
            }
            if ($userRepository->findOneBy(['email' => $email])) {
                return new JsonResponse(['error' => 'Email already in use'], 400);
            }
        }

        // Vérifier si l'utilisateur existe déjà
        $existingUser = $userRepository->findOneBy(['username' => $data['username']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'User already exists'], 400);
        }

        // Création de l'utilisateur
        $user = new User();
        $user->setUsername($data['username']);
        $user->setEmail($email !== '' ? $email : null);
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        $user->setRoles(['ROLE_USER']);
        $user->setCreatedAt(new \DateTimeImmutable());

        // Enregistrer l'utilisateur en base de données
        $userRepository->save($user, true);

        return new JsonResponse(['status' => 'User created'], 201);
    }

    // La connexion est gérée par le firewall (json_login + lexik), qui intercepte
    // POST /api/login avant ce contrôleur. La route doit exister pour le routing,
    // mais ce corps n'est jamais exécuté.
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        throw new \LogicException('Cette route est interceptée par le firewall json_login (security.yaml).');
    }

    // Le jeton vivant dans un cookie httpOnly, le front ne peut plus le décoder :
    // cette route lui fournit l'identité de la session courante.
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return new JsonResponse([
            'username' => $user->getUsername(),
            'roles' => $user->getRoles(),
        ]);
    }

    // Déconnexion : invalide le refresh token en base puis expire les deux cookies.
    // Route publique : un jeton d'accès expiré ne doit pas empêcher de se déconnecter.
    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(Request $request, RefreshTokenManagerInterface $refreshTokenManager): JsonResponse
    {
        $refreshTokenValue = $request->cookies->get('refresh_token');
        if ($refreshTokenValue) {
            $refreshToken = $refreshTokenManager->get($refreshTokenValue);
            if ($refreshToken) {
                $refreshTokenManager->delete($refreshToken);
            }
        }

        $response = new JsonResponse(['status' => 'Logged out']);
        foreach (['jwt_token', 'refresh_token'] as $name) {
            $response->headers->setCookie(
                Cookie::create($name, '', 1, '/', null, true, true, false, Cookie::SAMESITE_NONE)
            );
        }

        return $response;
    }
}
