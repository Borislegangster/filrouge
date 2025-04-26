<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use App\Models\User;
use App\Models\Invitation;
use Illuminate\Support\Facades\Mail;
use App\Mail\PasswordResetMail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AuthController extends Controller
{
    // Register
    public function completeProfile(Request $request) {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'name' => 'required|string',
            'password' => 'required|confirmed|min:8',
        ]);

        // Check if the invitation exists and is not used
        $invitation = Invitation::where('email', $request->email)
            ->where('token', $request->token)
            ->where('is_used', false)
            ->first();

        if (!$invitation) {
            return response()->json(['error' => 'Invitation invalide'], 400);
        }

        // Check if the email is already registered
        if (User::where('email', $request->email)->exists()) {
            return response()->json(['error' => 'Cet email est déjà utilisé'], 400);
        }
        
        // Create the user
        // and set the role from the invitation
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $invitation->role,
        ]);

        $invitation->update(['is_used' => true]);

        return response()->json(['message' => 'Compte créé avec succès !']);
    }

    // Login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Identifiants invalides'], 401);
        }

        if ($user->status !== 'Actif') {
            // Si le compte est désactivé, on ne permet pas la connexion
            return response()->json(['error' => 'Compte désactivé'], 403);
        }

        // Création du token avec des capacités (scopes) si nécessaire
        $token = $user->createToken('auth_token', ['*'])->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    // Get User
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

    // Forgot Password
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Email non trouvé'], 404);
        }

        // Générer un token et un code de vérification
        $token = Str::random(60);
        $verificationCode = rand(100000, 999999);

        // Enregistrer dans la base de données
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $token,
                'code' => $verificationCode,
                'created_at' => Carbon::now()
            ]
        );

        // Envoyer l'email
        Mail::to($user->email)->send(new PasswordResetMail($verificationCode, $token, $user->email));

        return response()->json(['message' => 'Un code de vérification a été envoyé à votre email']);
    }

    // Verify Code
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|numeric'
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$record) {
            return response()->json(['error' => 'Code invalide'], 400);
        }

        // Vérifier si le code a expiré (15 minutes)
        if (Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            return response()->json(['error' => 'Le code a expiré'], 400);
        }

        return response()->json([
            'message' => 'Code vérifié avec succès',
            'reset_token' => $record->token
        ]);
    }

    // Reset Password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
            return response()->json(['error' => 'Token invalide'], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Mettre à jour le mot de passe
        $user->password = Hash::make($request->password);
        $user->save();

        // Supprimer le token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès']);
    }
}
