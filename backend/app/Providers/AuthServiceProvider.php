<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        User::class => UserPolicy::class,
    ];
    

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // 
        $this->registerPolicies();

        // Define a policy for managing equipment
        Gate::define('manage-equipment', function ($user) {
            return in_array($user->role, ['administrateur', 'gestionnaire']);
        });
        
        Gate::define('view-equipment', function ($user) {
            return in_array($user->role, ['administrateur', 'gestionnaire', 'formateur']);
        });

        // Define a policy for managing rooms
        Gate::define('manage-rooms', function ($user) {
            return in_array($user->role, ['administrateur', 'gestionnaire']);
        });
        
        Gate::define('view-rooms', function ($user) {
            return in_array($user->role, ['administrateur', 'gestionnaire', 'formateur']);
        });

        Gate::define('manage-providers', function ($user) {
            return $user->hasAnyRole(['administrateur', 'gestionnaire']);
        });
    }
}
