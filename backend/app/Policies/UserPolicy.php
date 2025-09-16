<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function manage(User $user, User $targetUser)
    {
        // Un admin peut gérer tout le monde
        if ($user->role === 'Administrateur') {
            return true;
        }

        // Un gestionnaire peut gérer seulement les formateurs
        if ($user->role === 'Gestionnaire') {
            return $targetUser->role === 'Utilisateur';
        }

        return false;
    }
}