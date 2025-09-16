<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Service::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $service = $request->validate([
            'name' => 'required|string',
            'description' => 'sometimes|nullable|string',
            'icon' => 'sometimes|nullable|string',
            'categorie' => 'sometimes|nullable|integer|exists:categorie_services,id',
        ]);

        $service['id'] = Service::create($service);
        return response()->json($service, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Service $service)
    {

        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }
        return response()->json($service);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Service $service)
    {
        $service->update($request->all());
        return response()->json($service);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service)
    {
        $service->delete();
        return response()->json(['message' => 'Service deleted successfully'], 204);
    }
    
    /**
     * getServiceProviders
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \App\Models\Service $service
     * @return \Illuminate\Http\Response
     */
    public function getServiceProviders(Request $request, Service $service)
    {
        $providers = $service->providers;
        return response()->json($providers);
    }
}
