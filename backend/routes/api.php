<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\UserController;
use App\Http\Controllers\API\V1\RoomController;
use App\Http\Controllers\API\V1\EquipmentController;
use App\Http\Controllers\API\V1\ProviderController;
use App\Http\Controllers\API\V1\AcquisitionController;
use App\Http\Controllers\API\V1\IssueController;
use App\Http\Controllers\API\V1\CheckoutController;
use App\Http\Controllers\API\V1\NotificationController;

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/verify-code', [AuthController::class, 'verifyCode']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Users
    Route::apiResource('users', UserController::class);
    Route::put('/users/{user}/activate', [UserController::class, 'activate']);
    
    // Rooms
    Route::apiResource('rooms', RoomController::class);
    
    // Equipment
    Route::get('/equipment/types', [EquipmentController::class, 'getTypes']);
    Route::get('/equipment/statuses', [EquipmentController::class, 'getStatuses']);
    Route::apiResource('equipment', EquipmentController::class);
    
    // Providers
    Route::apiResource('providers', ProviderController::class);
    
    // Acquisitions
    Route::get('/acquisitions/statuses', [AcquisitionController::class, 'getStatuses']);
    Route::get('/acquisitions/urgencies', [AcquisitionController::class, 'getUrgencies']);
    Route::apiResource('acquisitions', AcquisitionController::class);
    
    // Issues
    Route::get('/issues/priorities', [IssueController::class, 'getPriorities']);
    Route::get('/issues/statuses', [IssueController::class, 'getStatuses']);
    Route::get('/issues/stats', [IssueController::class, 'stats']);
    Route::post('/issues/{id}/take-charge', [IssueController::class, 'takeCharge']);
    Route::post('/issues/{id}/mark-as-resolved', [IssueController::class, 'markAsResolved']);
    Route::apiResource('issues', IssueController::class);
    
    // Checkouts
    Route::get('/checkouts/statuses', [CheckoutController::class, 'getStatuses']);
    Route::get('/checkouts/stats', [CheckoutController::class, 'getStats']);
    Route::post('/checkouts/update-overdue', [CheckoutController::class, 'updateOverdue']);
    Route::apiResource('checkouts', CheckoutController::class);
    
    // Notifications
    Route::get('/notifications/types', [NotificationController::class, 'getTypes']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::apiResource('notifications', NotificationController::class);
});