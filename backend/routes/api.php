<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\InvitationController;
use App\Http\Controllers\API\V1\RoomController;
use App\Http\Controllers\API\V1\EquipmentController;
use App\Http\Controllers\API\V1\ProviderController;
use App\Http\Controllers\API\V1\AcquisitionController;
use App\Http\Controllers\API\V1\IssueController;
use App\Http\Controllers\API\V1\CheckoutController;
use App\Http\Controllers\API\V1\NotificationController;
use App\Http\Controllers\API\V1\UserController;
use App\Http\Controllers\API\V1\UserSettingController;
use App\Http\Controllers\API\V1\ServiceController;

// CSRF cookie route
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->noContent();
});

/********************************************* Routes publiques *************************************************/
// Vérification de l'invitation
Route::post('/verify-invitation', [InvitationController::class, 'verify']);
// Login
Route::post('/login', [AuthController::class, 'login']);
// Register
Route::post('/register', [AuthController::class, 'completeProfile']);
// Forgot Password
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
// Verify Code
Route::post('/verify-code', [AuthController::class, 'verifyCode']);
// Reset Password
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/crypt', [AuthController::class, 'crypt']);

/********************************************* Routes protégées *************************************************/
Route::middleware('auth:sanctum')->group(function () {
    // Route pour récupérer l'utilisateur authentifié
    Route::get('/user', [AuthController::class, 'user']);

    // User Profile Routes
    Route::prefix('user-profile')->group(function () {
        Route::get('/', [UserSettingController::class, 'getUserProfile']);
        Route::put('/', [UserSettingController::class, 'updateProfile']);
    });

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Invitation
    Route::apiResource('invitations', InvitationController::class)->except(['create', 'edit']);

    // Rooms
    Route::apiResource('rooms', RoomController::class);

    // Equipment
    Route::get('/equipment/types', [EquipmentController::class, 'getTypes']);
    Route::get('/equipment/statuses', [EquipmentController::class, 'getStatuses']);
    Route::apiResource('equipment', EquipmentController::class);

    // Providers
    Route::apiResource('providers', ProviderController::class);
    Route::apiResource('services', ServiceController::class)->except(['create', 'edit']);
    Route::get('/providers/{provider}/services', [ProviderController::class, 'getServices']);
    Route::post('/providers/{provider}/services/{service}', [ProviderController::class, 'addService']);
    Route::delete('/providers/{provider}/services/{service}', [ProviderController::class, 'deleteService']);

    // Acquisitions
    Route::get('/acquisitions/statuses', [AcquisitionController::class, 'getStatuses']);
    Route::get('/acquisitions/urgencies', [AcquisitionController::class, 'getUrgencies']);
    Route::apiResource('acquisitions', AcquisitionController::class);

    /* // Issues
    Route::get('/issues/priorities', [IssueController::class, 'getPriorities']);
    Route::get('/issues/statuses', [IssueController::class, 'getStatuses']);
    Route::apiResource('issues', IssueController::class); */

    // Issues
    Route::prefix('issues')->group(function () {
        Route::get('/', [IssueController::class, 'index']);
        Route::post('/', [IssueController::class, 'store']);
        Route::get('/priorities', [IssueController::class, 'getPriorities']);
        Route::get('/statuses', [IssueController::class, 'getStatuses']);
        Route::get('/stats', [IssueController::class, 'stats']);
        Route::get('/{id}', [IssueController::class, 'show']);
        Route::put('/{id}', [IssueController::class, 'update']);
        Route::delete('/{id}', [IssueController::class, 'destroy']);
        Route::post('/{id}/take-charge', [IssueController::class, 'takeCharge']);
        Route::post('/{id}/mark-as-resolved', [IssueController::class, 'markAsResolved']);
    });

    /* // Issues
    Route::get('/priorities', [IssueController::class, 'getPriorities']);
    Route::get('/statuses', [IssueController::class, 'getStatuses']);
    Route::get('/stats', [IssueController::class, 'getStats']);
    Route::apiResource('/', IssueController::class);
    Route::put('/{issue}/take-charge', [IssueController::class, 'takeCharge']);
    Route::put('/{issue}/mark-as-resolved', [IssueController::class, 'markAsResolved']); */


    // Checkouts
    Route::get('/checkouts/statuses', [CheckoutController::class, 'getStatuses']);
    Route::apiResource('checkouts', CheckoutController::class);

    // Notifications
    Route::get('/notifications/types', [NotificationController::class, 'getTypes']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::apiResource('notifications', NotificationController::class);

    // Utilisateurs (admin & gestionnaire)
    Route::middleware(['role:administrateur,gestionnaire'])->group(function () {
        Route::get('/users', [UserController::class, 'index']); // Liste
        Route::put('/users/{user}', [UserController::class, 'update']); // Mettre a jour l'utilisateur
        Route::delete('/users/{user}', [UserController::class, 'destroy']); // Supprimer
        Route::put('/users/{user}/activate', [UserController::class, 'activate']);// Activate user
    });
});