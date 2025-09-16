<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invitation;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvitationMail;

class InvitationController extends Controller
{
    public function index()
    {
        $invitations = Invitation::all();
        return response()->json($invitations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:Administrateur,Manager,Gestionnaire,Utilisateur'
        ]);

        $token = Str::random(60);
        $code = rand(100000, 999999); // Code à 6 chiffres

        $invitation = Invitation::create([
            'email' => $request->email,
            'token' => $token,
            'role' => $request->role,
            'code' => $code,
            'expires_at' => now()->addHours(48),
        ]);

        Mail::to($request->email)->send(new InvitationMail($token, $code, $request->role));

        return response()->json(['message' => 'Invitation envoyée !', 'data' => $invitation], 201);
    }

    public function show($id)
    {
        $invitation = Invitation::findOrFail($id);
        return response()->json($invitation);
    }

    public function update(Request $request, $id)
    {
        $invitation = Invitation::findOrFail($id);
        
        $request->validate([
            'email' => 'sometimes|email',
            'role' => 'sometimes|in:Administrateur,Manager,Gestionnaire,Utilisateur',
            'is_used' => 'sometimes|boolean'
        ]);

        $invitation->update($request->all());

        return response()->json($invitation);
    }

    public function destroy($id)
    {
        $invitation = Invitation::findOrFail($id);
        $invitation->delete();

        return response()->json(null, 204);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|numeric',
            'token' => 'required|string'
        ]);

        $invitation = Invitation::where('token', $request->token)
            ->where('code', $request->code)
            ->where('expires_at', '>', now())
            ->first();

        if (!$invitation) {
            return response()->json(['error' => 'Lien invalide ou expiré'], 400);
        }

        return response()->json([
            'email' => $invitation->email,
            'token' => $invitation->token
        ]);
    }
}