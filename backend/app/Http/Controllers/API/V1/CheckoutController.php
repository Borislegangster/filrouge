<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Checkout;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Checkout::query();

        // Filtres selon le rôle
        if ($user->role === 'formateur') {
            $query->where('user_id', $user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('equipment_id')) {
            $query->where('equipment_id', $request->equipment_id);
        }

        if ($request->has('user_id') && ($user->role === 'administrateur' || $user->role === 'gestionnaire')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('equipment', function($subQ) use ($search) {
                    $subQ->where('name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('user', function($subQ) use ($search) {
                    $subQ->where('name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                })
                ->orWhere('purpose', 'like', '%' . $search . '%');
            });
        }

        // Relations à charger
        $with = ['equipment', 'user', 'checkedOutBy', 'checkedInBy'];
        $query->with($with);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $checkouts = $query->orderBy('checkout_date', 'desc')->paginate($perPage);

        return response()->json($checkouts);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['administrateur', 'gestionnaire'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'equipment_id' => 'required|exists:equipment,id',
            'user_id' => 'required|exists:users,id',
            'checkout_date' => 'required|date',
            'expected_return_date' => 'required|date|after:checkout_date',
            'purpose' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $equipment = Equipment::findOrFail($request->equipment_id);
        if ($equipment->status !== 'Fonctionnel') {
            return response()->json(['error' => 'Cet équipement n\'est pas disponible pour le prêt.'], 422);
        }

        $data = $request->all();
        $data['status'] = 'En cours';
        $data['checked_out_by'] = $user->id;

        $checkout = Checkout::create($data);

        $equipment->update(['status' => 'Réservé']);

        return response()->json($checkout->load(['equipment', 'user', 'checkedOutBy']), 201);
    }

    public function show(string $id)
    {
        $checkout = Checkout::with(['equipment', 'user', 'checkedOutBy', 'checkedInBy'])->findOrFail($id);
        
        $user = Auth::user();
        if ($user->role === 'formateur' && $checkout->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($checkout);
    }

    public function update(Request $request, string $id)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['administrateur', 'gestionnaire'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'equipment_id' => 'sometimes|required|exists:equipment,id',
            'user_id' => 'sometimes|required|exists:users,id',
            'checkout_date' => 'sometimes|required|date',
            'expected_return_date' => 'sometimes|required|date|after:checkout_date',
            'actual_return_date' => 'nullable|date',
            'purpose' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:En cours,Retourné,En retard',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $checkout = Checkout::findOrFail($id);
        $oldStatus = $checkout->status;
        $newStatus = $request->status ?? $oldStatus;

        if ($oldStatus === 'En cours' && $newStatus === 'Retourné') {
            $request->merge(['checked_in_by' => $user->id]);
            $request->merge(['actual_return_date' => $request->actual_return_date ?? now()]);

            $equipment = Equipment::findOrFail($checkout->equipment_id);
            $equipment->update(['status' => 'Fonctionnel']);
        }

        $checkout->update($request->all());

        return response()->json($checkout->load(['equipment', 'user', 'checkedOutBy', 'checkedInBy']));
    }

    public function destroy(string $id)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['administrateur', 'gestionnaire'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $checkout = Checkout::findOrFail($id);

        if ($checkout->status === 'En cours') {
            $equipment = Equipment::findOrFail($checkout->equipment_id);
            $equipment->update(['status' => 'Fonctionnel']);
        }

        $checkout->delete();

        return response()->json(null, 204);
    }

    public function getStatuses()
    {
        return response()->json([
            'En cours',
            'Retourné',
            'En retard'
        ]);
    }

    public function updateOverdue()
    {
        $today = Carbon::now()->startOfDay();
        
        $overdueCheckouts = Checkout::where('status', 'En cours')
            ->whereDate('expected_return_date', '<', $today)
            ->get();
            
        $updated = 0;
        
        foreach ($overdueCheckouts as $checkout) {
            $checkout->update(['status' => 'En retard']);
            $updated++;
        }
        
        return response()->json([
            'message' => $updated . ' prêts ont été marqués comme en retard',
            'updated_count' => $updated
        ]);
    }

    public function getStats()
    {
        $today = Carbon::today();
        $user = Auth::user();
        
        $query = Checkout::query();
        
        if ($user->role === 'formateur') {
            $query->where('user_id', $user->id);
        }
        
        return response()->json([
            'active' => $query->clone()->where('status', 'En cours')->count(),
            'late' => $query->clone()->where('status', 'En retard')->count(),
            'returnedToday' => $query->clone()->where('status', 'Retourné')
                ->whereDate('actual_return_date', $today)
                ->count(),
            'upcoming' => $query->clone()->where('status', 'En cours')
                ->whereDate('expected_return_date', '<=', $today->addDays(3))
                ->count()
        ]);
    }
}