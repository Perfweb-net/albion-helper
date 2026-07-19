<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Refuse la connexion tant que l'adresse e-mail du compte n'a pas été confirmée.
 * Les comptes historiques sans adresse (créés avant la v3.2.0, ex. admin) ne sont
 * pas concernés : la règle ne s'applique qu'aux comptes disposant d'un e-mail.
 */
class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        if ($user->getEmail() !== null && $user->getEmailVerifiedAt() === null) {
            throw new CustomUserMessageAccountStatusException(
                'Compte non activé : cliquez sur le lien de confirmation reçu par e-mail.'
            );
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
    }
}
