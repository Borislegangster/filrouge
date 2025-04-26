<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Gate;

class EquipmentController extends Controller
{
    public function index(Request $request)
    {
        // Vérification de l'authentification
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Vérification des permissions
        if (!Gate::allows('manage-equipment') && !Gate::allows('view-equipment')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $query = Equipment::query();

        // Filtres
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('serial_number', 'like', '%' . $request->search . '%');
            });
        }

        // Relations à charger
        $with = ['room', 'provider'];
        $query->with($with);

        // Pagination
        $equipment = Equipment::with(['room', 'provider'])
                 ->orderBy('created_at', 'desc')
                 ->paginate(10);

        return response()->json([
            'data' => $equipment->items(),
            'pagination' => [
                'total' => $equipment->total(),
                'per_page' => $equipment->perPage(),
                'current_page' => $equipment->currentPage(),
                'last_page' => $equipment->lastPage(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        if (!Gate::allows('manage-equipment')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
    
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'status' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:equipment',
            'description' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'last_maintenance' => 'nullable|date',
            'next_maintenance' => 'nullable|date',
            'room_id' => 'nullable|integer|exists:rooms,id',
            'provider_id' => 'nullable|integer|exists:providers,id',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $equipment = Equipment::create($request->all());
        return response()->json($equipment, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!Gate::allows('manage-equipment') && !Gate::allows('view-equipment')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $equipment = Equipment::with(['room', 'provider', 'issues', 'checkouts'])->findOrFail($id);
        return response()->json($equipment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!Gate::allows('manage-equipment')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:equipment,serial_number,'.$id,
            'description' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'last_maintenance' => 'nullable|date',
            'next_maintenance' => 'nullable|date',
            'room_id' => 'nullable|exists:rooms,id',
            'provider_id' => 'nullable|exists:providers,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $equipment = Equipment::findOrFail($id);
        $equipment->update($request->all());

        return response()->json($equipment);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!Gate::allows('manage-equipment')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $equipment = Equipment::findOrFail($id);
        $equipment->delete();

        return response()->json(null, 204);
    }

    /**
     * Get equipment types.
     */
    public function getTypes()
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $types = [
            'Informatique',
            'Audiovisuel',
            'Réseau',
            'Périphérique'
        ];

        return response()->json($types);
    }

    /**
     * Get equipment statuses.
     */
    public function getStatuses()
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $statuses = [
            'Fonctionnel',
            'En panne',
            'En maintenance',
            'Réservé'
        ];

        return response()->json($statuses);
    }
}