<?php

namespace App\Schedule;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Illuminate\Console\Scheduling\Schedule;

class UpdateOverdueCheckouts
{
    public function __invoke()
    {
        // Appel à la méthode du contrôleur
        App::make(\App\Http\Controllers\API\V1\CheckoutController::class)->updateOverdue();

        // (optionnel) Log
        Log::info('Tâche planifiée : updateOverdue exécutée.');
    }

    public function schedule(Schedule $schedule): void
    {
        $schedule->call($this)->daily();
    }
}
