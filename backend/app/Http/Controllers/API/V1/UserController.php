<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // Get all users
    public function index(Request $request)
    {
        $currentUser = $request->user();

        if ($currentUser->role === 'administrateur') {
            $users = User::where('id', '!=', $currentUser->id)->get();
        } elseif ($currentUser->role === 'gestionnaire') {
            $users = User::where('role', 'formateur')->get();
        } else {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        return response()->json($users);
    }

    // Update user
    public function update(Request $request, User $user)
    {
        $currentUser = $request->user();

        // Vérification des permissions
        if ($currentUser->role === 'gestionnaire' && $user->role !== 'formateur') {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        if ($user->id === $currentUser->id) {
            return response()->json(['error' => 'Action interdite sur vous-même'], 403);
        }

        // Validation
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,'.$user->id,
            'role' => [
                'sometimes',
                'required',
                'string',
                Rule::in(['administrateur', 'gestionnaire', 'formateur'])
            ],
            'status' => 'sometimes|required|string|in:Actif,Inactif,En attente'
        ]);

        // Mise à jour
        $user->update($request->only(['name', 'email', 'role', 'status']));

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $user
        ]);
    }

    // Delete user
    public function destroy(User $user)
    {
        $currentUser = request()->user();

        // Vérification des permissions
        if ($currentUser->role === 'gestionnaire' && $user->role !== 'formateur') {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        if ($user->id === $currentUser->id) {
            return response()->json(['error' => 'Impossible de supprimer votre propre compte'], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    // Activate user
    public function activate(User $user)
    {
        $currentUser = request()->user();

        // Vérification des permissions
        if ($currentUser->role === 'gestionnaire' && $user->role !== 'formateur') {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        if ($user->status !== 'En attente') {
            return response()->json(['error' => 'Seuls les utilisateurs en attente peuvent être activés'], 400);
        }

        $user->update([
            'status' => 'Actif'
        ]);

        return response()->json([
            'message' => 'Utilisateur activé avec succès',
            'user' => $user
        ]);
    }
}