<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\provider as ResourcesProvider;
use App\Models\Provider;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProviderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {        
        $query = Provider::query()->with(['services' => function ($query) {
                $query->orderBy('provider_services.service_id', 'asc');
            }]);

        // Sort the provider services having a specified name
        if ($request->has('service')) {
            $query->whereHas('services', function ($q) use ($request) {
                $q->where('name', $request->service);
            });
        }

        // Filtres
        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'Actif'?1:0);
        }
        
        // if ($request->has('service')) {
        //     $query->where('services.name', 'like', '%' . $request->service . '%');
        // }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('contact_name', 'like', '%' . $request->search . '%');
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $providers = $query->paginate($perPage);

        return ResourcesProvider::collection($providers);

        // $providers = Provider::with('services')->paginate(10);
        // return ResourcesProvider::collection($providers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $provider = $request->validateWithBag('errors', [
            'name' => 'required|string|max:155',
            'id' => 'sometimes|required|exists:providers,id',
            'services.*.id' => 'required|exists:services,id',
            'contact_name' => 'sometimes|nullable|string|max:155',
            'email' => 'sometimes|nullable|email|max:255',
            'phone' => 'sometimes|nullable|string|max:25',
            'phone2' => 'sometimes|nullable|string|max:25',
            'address' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|nullable|string',
            'website' => 'sometimes|nullable|string',
            'is_active' => 'boolean',
        ]);

        $provider['phone'] ? $provider['phone'] = str_replace(' ', '', $provider['phone']) : null;
        $provider['phone2'] ? $provider['phone2'] = str_replace(' ', '', $provider['phone2']) : null;
        
        $serviceIds = collect($request->services)->pluck('id')->toArray();
        $services = Service::whereIn('id', $serviceIds)->select('id', 'name', 'description', 'icon')->get();
        $provider = Provider::create($request->all());
        $provider->services()->attach($serviceIds);
        $provider->services = $services;
        
        return response()->json($provider, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $provider = Provider::with(['equipment', 'acquisitions'])->findOrFail($id);
        return response()->json($provider);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $provider = Provider::findOrFail($id);
        $provider->update($request->all());

        return response()->json($provider);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $provider = Provider::findOrFail($id);
        $provider->delete();

        return response()->json(null, 204);
    }

    /**
     * Get services of a provider.
     */
    public function getServices(Provider $provider)
    {
        $services = $provider->services;
        return response()->json($services);
    }

    /**
     * Add a service to a provider.
     */
    public function addService(Provider $provider, Service $service)
    {
        $provider->services()->attach($service->id);
        return response()->json(['message' => 'Service added to provider'], 201);
    }   

    /**
     * Delete a service from a provider.
     */
    public function deleteService(Provider $provider, Service $service)
    {
        $provider->services()->detach($service->id);
        return response()->json(['message' => 'Service removed from provider'], 204);
    }
}