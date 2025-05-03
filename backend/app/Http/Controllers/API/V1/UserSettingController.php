<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class UserSettingController extends Controller
{
    /**
     * Get the authenticated user's profile information.
     */
    public function getUserProfile()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Construct the full URL for the profile picture
            $avatar_url = null;
            if ($user->profile_picture) {
                // Ensure the storage link exists (php artisan storage:link)
                $avatar_url = asset('storage/profiles/'.$user->profile_picture);
            }

            return response()->json([
                'user' => $user,
                'avatar_url' => $avatar_url // Send the full URL
            ]);

        } catch (\Exception $e) {
            Log::error('Get Profile Error: '.$e->getMessage());
            return response()->json(['error' => 'Server error while fetching profile'], 500);
        }
    }

    /**
     * Update the authenticated user's profile information.
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,'.$user->id,
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                // Ensure profile_picture validation works with file uploads
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,jfif|max:2048', // Max 2MB
                // Validate password fields only if new_password is present
                'current_password' => 'required_with:new_password|nullable|string',
                'new_password' => 'nullable|string|min:8|confirmed', // 'confirmed' checks new_password_confirmation
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // --- Update Password ---
            // Check current password only if a new password is being set
            if ($request->filled('new_password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json(['errors' => ['current_password' => ['Le mot de passe actuel est incorrect.']]], 422);
                }
                // Hash and update the new password
                $user->password = Hash::make($request->new_password);
            }

            // --- Update Profile Picture ---
            if ($request->hasFile('profile_picture')) {
                // Delete old file if it exists
                if ($user->profile_picture && Storage::disk('public')->exists('profiles/'.$user->profile_picture)) {
                    Storage::disk('public')->delete('profiles/'.$user->profile_picture);
                }

                // Store new file
                $file = $request->file('profile_picture');
                // Generate a unique filename (e.g., timestamp_userid.extension)
                $filename = time().'_'.$user->id.'.'.$file->getClientOriginalExtension();
                // Store in 'storage/app/public/profiles'
                $path = $file->storeAs('profiles', $filename, 'public'); // Use the 'public' disk

                // Update the user's profile picture attribute with the filename only
                $user->profile_picture = $filename;
            }

            // --- Update Basic Fields ---
            // Use fill to update only allowed fields defined in the model's $fillable array
            // Exclude password and profile_picture as they are handled separately
            $user->fill($request->only(['name', 'email', 'phone', 'address']));

            // Save all changes
            $user->save();

            // Construct the new avatar URL after potential update
            $new_avatar_url = null;
            if ($user->profile_picture) {
                $new_avatar_url = asset('storage/profiles/'.$user->profile_picture);
            }

            // Return success response with updated user data and avatar URL
            return response()->json([
                'message' => 'Profil mis à jour avec succès !',
                'user' => $user->fresh(), // Return the updated user model
                'avatar_url' => $new_avatar_url
            ]);

        } catch (\Exception $e) {
            Log::error('Update Profile Error: '.$e->getMessage().' Stack: '.$e->getTraceAsString());
            return response()->json(['error' => 'Server error during profile update'], 500);
        }
    }
}
