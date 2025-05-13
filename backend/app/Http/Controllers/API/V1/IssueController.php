<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class IssueController extends Controller
{
    public function index(Request $request)
    {
        $query = Issue::query();

        // Pour les formateurs, ne voir que leurs propres signalements
        if (Auth::user()->role === 'formateur') {
            $query->where('reported_by', Auth::id());
        }

        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('equipment_id')) {
            $query->where('equipment_id', $request->equipment_id);
        }

        if ($request->has('reported_by')) {
            $query->where('reported_by', $request->reported_by);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Relations à charger
        $with = ['equipment', 'reporter', 'assignee'];
        $query->with($with);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $issues = $query->paginate($perPage);

        return response()->json($issues);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'equipment_id' => 'required|exists:equipment,id',
            'priority' => 'required|string|in:Basse,Moyenne,Haute,Critique',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        $data['reported_by'] = Auth::id();
        $data['status'] = 'Ouvert';
        $data['reported_date'] = now();

        $issue = Issue::create($data);
        return response()->json($issue->load(['equipment', 'reporter', 'assignee']), 201);
    }

    public function show(string $id)
    {
        $issue = Issue::with(['equipment', 'reporter', 'assignee'])->findOrFail($id);

        // Vérification des permissions
        if (Auth::user()->role === 'formateur' && $issue->reported_by !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($issue);
    }

    public function update(Request $request, string $id)
    {
        $issue = Issue::findOrFail($id);

        // Vérification des permissions
        if (Auth::user()->role === 'formateur') {
            if ($issue->reported_by !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Empêcher la modification si déjà assigné
            if ($issue->assigned_to) {
                return response()->json(['message' => 'Cannot update an assigned issue'], 403);
            }
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'equipment_id' => 'sometimes|required|exists:equipment,id',
            'priority' => 'sometimes|required|string|in:Basse,Moyenne,Haute,Critique',
            'status' => 'sometimes|required|string|in:Ouvert,En cours,Résolu,Fermé',
            'assigned_to' => 'nullable|exists:users,id',
            'resolution_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Mise à jour spéciale pour la résolution
        if ($request->has('status') && $request->status === 'Résolu') {
            $request->merge(['resolved_date' => now()]);
        }

        $issue->update($request->all());
        return response()->json($issue->load(['equipment', 'reporter', 'assignee']));
    }

    public function destroy(string $id)
    {
        $issue = Issue::findOrFail($id);

        // Vérification des permissions
        if (Auth::user()->role === 'formateur') {
            if ($issue->reported_by !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Empêcher la suppression si déjà assigné
            if ($issue->assigned_to) {
                return response()->json(['message' => 'Cannot delete an assigned issue'], 403);
            }
        }

        $issue->delete();
        return response()->json(null, 204);
    }

    public function takeCharge(Request $request, string $id)
    {
        if (!in_array(Auth::user()->role, ['administrateur', 'gestionnaire'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $issue = Issue::findOrFail($id);
        
        $issue->update([
            'assigned_to' => Auth::id(),
            'status' => 'En cours'
        ]);

        return response()->json($issue->load(['equipment', 'reporter', 'assignee']));
    }

    public function markAsResolved(Request $request, string $id)
    {
        if (!in_array(Auth::user()->role, ['administrateur', 'gestionnaire'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'resolution_notes' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $issue = Issue::findOrFail($id);
        
        $issue->update([
            'status' => 'Résolu',
            'resolved_date' => now(),
            'resolution_notes' => $request->resolution_notes
        ]);

        return response()->json($issue->load(['equipment', 'reporter', 'assignee']));
    }

    public function stats()
    {
        $query = Issue::query();
        
        // Pour les formateurs, ne voir que leurs propres statistiques
        if (Auth::user()->role === 'formateur') {
            $query->where('reported_by', Auth::id());
        }

        $stats = [
            'pending' => $query->clone()->where('status', 'Ouvert')->count(),
            'inProgress' => $query->clone()->where('status', 'En cours')->count(),
            'resolved' => $query->clone()->whereIn('status', ['Résolu', 'Fermé'])->count(),
        ];

        // Calcul du temps moyen de résolution (en jours)
        $resolvedIssues = $query->clone()
            ->whereNotNull('resolved_date')
            ->whereNotNull('reported_date')
            ->get();

        $avgDays = $resolvedIssues->avg(function ($issue) {
            return $issue->reported_date->diffInDays($issue->resolved_date);
        });

        $stats['avgResolutionTime'] = round($avgDays ?? 0) . 'j';

        return response()->json($stats);
    }

    public function getPriorities()
    {
        $priorities = ['Basse', 'Moyenne', 'Haute', 'Critique'];
        return response()->json($priorities);
    }

    public function getStatuses()
    {
        $statuses = ['Ouvert', 'En cours', 'Résolu', 'Fermé'];
        return response()->json($statuses);
    }
}