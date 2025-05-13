<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Gate;

class ProviderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Vérification des permissions
        if (!Gate::allows('manage-providers')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Provider::query();

        // Filtres
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('contact_name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $providers = $query->paginate($perPage);

        return response()->json($providers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!Gate::allows('manage-providers')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:providers',
            'contact_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:providers',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'description' => 'nullable|string',
            'services' => 'required|array',
            'services.*' => 'string|max:255',
            'contract_end_date' => 'required|date',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $provider = Provider::create($request->all());
        return response()->json($provider, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        if (!Gate::allows('manage-providers')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $provider = Provider::with(['equipment', 'acquisitions'])->findOrFail($id);
        return response()->json($provider);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        if (!Gate::allows('manage-providers')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $provider = Provider::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:providers,name,'.$provider->id,
            'contact_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:providers,email,'.$provider->id,
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'description' => 'nullable|string',
            'services' => 'required|array',
            'services.*' => 'string|max:255',
            'contract_end_date' => 'required|date',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $provider->update($request->all());
        return response()->json($provider);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        if (!Gate::allows('manage-providers')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $provider = Provider::findOrFail($id);
        $provider->delete();

        return response()->json(null, 204);
    }
}