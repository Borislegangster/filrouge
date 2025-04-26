<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function manage(User $user, User $targetUser)
    {
        // Un admin peut gérer tout le monde
        if ($user->role === 'administrateur') {
            return true;
        }

        // Un gestionnaire peut gérer seulement les formateurs
        if ($user->role === 'gestionnaire') {
            return $targetUser->role === 'formateur';
        }

        return false;
    }
}