<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Notification::query();

        // Par défaut, uniquement les notifications de l'utilisateur actuel
        $userId = $request->get('user_id', Auth::id());
        $query->where('user_id', $userId);

        // Filtres
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_read')) {
            $query->where('is_read', $request->is_read);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('message', 'like', '%' . $request->search . '%');
            });
        }

        // Relations à charger
        $query->with('user');

        // Tri par date décroissante (les plus récentes d'abord)
        $query->orderBy('created_at', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 10);
        $notifications = $query->paginate($perPage);

        return response()->json($notifications);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|string|max:255',
            'user_id' => 'required|exists:users,id',
            'related_type' => 'nullable|string|max:255',
            'related_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $notification = Notification::create($request->all());
        return response()->json($notification->load('user'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $notification = Notification::with('user')->findOrFail($id);

        // Vérifier si l'utilisateur a le droit de voir cette notification
        if (Auth::id() !== $notification->user_id && !Auth::user()->isAdmin()) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        return response()->json($notification);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'message' => 'sometimes|required|string',
            'type' => 'sometimes|required|string|max:255',
            'is_read' => 'boolean',
            'related_type' => 'nullable|string|max:255',
            'related_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $notification = Notification::findOrFail($id);

        // Vérifier si l'utilisateur a le droit de modifier cette notification
        if (Auth::id() !== $notification->user_id && !Auth::user()->isAdmin()) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        $notification->update($request->all());

        return response()->json($notification->load('user'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $notification = Notification::findOrFail($id);

        // Vérifier si l'utilisateur a le droit de supprimer cette notification
        if (Auth::id() !== $notification->user_id && !Auth::user()->isAdmin()) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        $notification->delete();

        return response()->json(null, 204);
    }

    /**
     * Mark all notifications as read for the current user.
     */
    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues']);
    }

    /**
     * Get notification types.
     */
    public function getTypes()
    {
        $types = [
            'Maintenance',
            'Retard',
            'Problème',
            'Acquisition'
        ];

        return response()->json($types);
    }

    /**
     * Get unread count for the current user.
     */
    public function getUnreadCount()
    {
        $count = Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }
}
