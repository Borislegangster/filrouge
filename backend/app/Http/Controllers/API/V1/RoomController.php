<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Gate;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Vérifier les permissions
        if (!Gate::allows('view-rooms')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rooms = Room::with('equipment')->get();
        return response()->json($rooms);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Vérifier les permissions
        if (!Gate::allows('manage-rooms')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:rooms,name',
            'building' => 'nullable|string|max:255',
            'floor' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'nullable|integer|min:1',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room = Room::create($request->all());
        return response()->json($room, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Vérifier les permissions
        if (!Gate::allows('view-rooms')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $room = Room::with('equipment')->findOrFail($id);
        return response()->json($room);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Vérifier les permissions
        if (!Gate::allows('manage-rooms')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $room = Room::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:rooms,name,'.$room->id,
            'building' => 'nullable|string|max:255',
            'floor' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'nullable|integer|min:1',
            'is_active' => 'sometimes|required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room->update($request->all());
        return response()->json($room);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Vérifier les permissions
        if (!Gate::allows('manage-rooms')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $room = Room::findOrFail($id);
        
        // Vérifier si la salle a des équipements associés
        if ($room->equipment()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete room with associated equipment'
            ], 422);
        }

        $room->delete();
        return response()->json(null, 204);
    }
}