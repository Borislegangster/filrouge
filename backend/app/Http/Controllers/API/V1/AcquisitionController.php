<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Acquisition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AcquisitionController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Acquisition::query();

        // Filtres selon le rôle
        if ($user->role === 'formateur') {
            $query->where('requested_by', $user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('provider_id')) {
            $query->where('provider_id', $request->provider_id);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Relations à charger
        $with = ['provider', 'requester', 'approver', 'equipment'];
        $query->with($with);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $acquisitions = $query->paginate($perPage);

        return response()->json($acquisitions);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'provider_id' => 'nullable|exists:providers,id',
            'amount' => 'nullable|numeric',
            'request_date' => 'required|date',
            'urgency' => 'required|string|in:Haute,Normale,Basse',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        $data['requested_by'] = Auth::id();
        $data['status'] = 'En attente'; // Force le statut initial

        $acquisition = Acquisition::create($data);

        return response()->json($acquisition->load(['provider', 'requester']), 201);
    }

    public function show(string $id)
    {
        $user = Auth::user();
        $acquisition = Acquisition::with(['provider', 'requester', 'approver', 'equipment'])->findOrFail($id);

        // Vérification des permissions
        if ($user->role === 'formateur' && $acquisition->requested_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($acquisition);
    }

    public function update(Request $request, string $id)
    {
        $user = Auth::user();
        $acquisition = Acquisition::findOrFail($id);

        // Vérification des permissions
        if ($user->role === 'formateur' && $acquisition->requested_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Un formateur ne peut modifier que les demandes en attente
        if ($user->role === 'formateur' && $acquisition->status !== 'En attente') {
            return response()->json(['message' => 'Vous ne pouvez modifier que les demandes en attente'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'provider_id' => 'nullable|exists:providers,id',
            'amount' => 'nullable|numeric',
            'status' => 'sometimes|required|string|in:En attente,Validée,Rejetée,Livrée',
            'request_date' => 'sometimes|required|date',
            'approval_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',
            'urgency' => 'sometimes|required|string|in:Haute,Normale,Basse',
            'approved_by' => 'nullable|exists:users,id',
            'equipment' => 'nullable|array',
            'equipment.*.id' => 'nullable|exists:equipment,id',
            'equipment.*.quantity' => 'required_with:equipment.*.id|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Seul l'admin peut approuver
        if ($request->has('status') && $request->status === 'Validée') {
            if ($user->role !== 'administrateur') {
                return response()->json(['message' => 'Seul l\'administrateur peut approuver une demande'], 403);
            }
            $request->merge(['approved_by' => $user->id, 'approval_date' => now()]);
        }

        // Si on ajoute/modifie des équipements et que le statut est "Validée", passer à "Livrée"
        if ($request->has('equipment') && $acquisition->status === 'Validée') {
            $request->merge(['status' => 'Livrée', 'delivery_date' => now()]);
        }

        $acquisition->update($request->all());

        // Gestion des équipements (seulement pour admin/gestionnaire)
        if (($user->role === 'administrateur' || $user->role === 'gestionnaire') && $request->has('equipment')) {
            $acquisition->equipment()->detach();
            foreach ($request->equipment as $item) {
                if (isset($item['id']) && isset($item['quantity'])) {
                    $acquisition->equipment()->attach($item['id'], ['quantity' => $item['quantity']], ['provider_id' => $item['provider_id'] ?? null]);
                }
            }
        }

        return response()->json($acquisition->load(['provider', 'requester', 'approver', 'equipment']));
    }

    public function destroy(string $id)
    {
        $user = Auth::user();
        $acquisition = Acquisition::findOrFail($id);

        // Vérification des permissions
        if ($user->role === 'formateur') {
            if ($acquisition->requested_by !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            // Un formateur ne peut supprimer que les demandes en attente
            if ($acquisition->status !== 'En attente') {
                return response()->json(['message' => 'Vous ne pouvez supprimer que les demandes en attente'], 403);
            }
        }

        $acquisition->equipment()->detach();
        $acquisition->delete();

        return response()->json(null, 204);
    }

    public function getStatuses()
    {
        return response()->json([
            'En attente',
            'Validée',
            'Rejetée',
            'Livrée'
        ]);
    }

    public function getUrgencies()
    {
        return response()->json([
            'Haute',
            'Normale',
            'Basse'
        ]);
    }
}