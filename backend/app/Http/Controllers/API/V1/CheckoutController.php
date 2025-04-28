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
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Checkout::query();

        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('equipment_id')) {
            $query->where('equipment_id', $request->equipment_id);
        }

        if ($request->has('user_id')) {
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipment_id' => 'required|exists:equipment,id',
            'user_id' => 'required|exists:users,id',
            'checkout_date' => 'required|date',
            'expected_return_date' => 'required|date|after:checkout_date',
            'purpose' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Vérifier si l'équipement est disponible
        $equipment = Equipment::findOrFail($request->equipment_id);
        if ($equipment->status !== 'Fonctionnel') {
            return response()->json(['error' => 'Cet équipement n\'est pas disponible pour le prêt.'], 422);
        }

        // Créer l'enregistrement de prêt
        $data = $request->all();
        $data['status'] = 'En cours';
        $data['checked_out_by'] = Auth::id();

        $checkout = Checkout::create($data);

        // Mettre à jour le statut de l'équipement
        $equipment->update(['status' => 'Réservé']);

        return response()->json($checkout->load(['equipment', 'user', 'checkedOutBy']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $checkout = Checkout::with(['equipment', 'user', 'checkedOutBy', 'checkedInBy'])->findOrFail($id);
        return response()->json($checkout);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'equipment_id' => 'sometimes|required|exists:equipment,id',
            'user_id' => 'sometimes|required|exists:users,id',
            'checkout_date' => 'sometimes|required|date',
            'expected_return_date' => 'sometimes|required|date|after:checkout_date',
            'actual_return_date' => 'nullable|date',
            'purpose' => 'sometimes|required|string',
            'status' => 'sometimes|required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $checkout = Checkout::findOrFail($id);
        $oldStatus = $checkout->status;
        $newStatus = $request->status ?? $oldStatus;

        // Si on retourne l'équipement, mettre à jour checked_in_by et le statut de l'équipement
        if ($oldStatus === 'En cours' && $newStatus === 'Retourné') {
            $request->merge(['checked_in_by' => Auth::id()]);
            $request->merge(['actual_return_date' => $request->actual_return_date ?? now()]);

            // Mettre à jour le statut de l'équipement
            $equipment = Equipment::findOrFail($checkout->equipment_id);
            $equipment->update(['status' => 'Fonctionnel']);
        }

        $checkout->update($request->all());

        return response()->json($checkout->load(['equipment', 'user', 'checkedOutBy', 'checkedInBy']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $checkout = Checkout::findOrFail($id);

        // Si le prêt est en cours, remettre l'équipement en état fonctionnel
        if ($checkout->status === 'En cours') {
            $equipment = Equipment::findOrFail($checkout->equipment_id);
            $equipment->update(['status' => 'Fonctionnel']);
        }

        $checkout->delete();

        return response()->json(null, 204);
    }

    /**
     * Get checkout statuses.
     */
    public function getStatuses()
    {
        $statuses = [
            'En cours',
            'Retourné',
            'En retard'
        ];

        return response()->json($statuses);
    }

    /**
     * Update the status of overdue checkouts.
     */
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

    /**
     * Get checkout statistics.
     */
    public function getStats()
    {
        $today = Carbon::today();
        
        return response()->json([
            'active' => Checkout::where('status', 'En cours')->count(),
            'late' => Checkout::where('status', 'En retard')->count(),
            'returnedToday' => Checkout::where('status', 'Retourné')
                ->whereDate('actual_return_date', $today)
                ->count(),
            'upcoming' => Checkout::where('status', 'En cours')
                ->whereDate('expected_return_date', '<=', $today->addDays(3))
                ->count()
        ]);
    }
}