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
    public function getUserProfile()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            
            return response()->json([
                'user' => $user,
                'avatar_url' => $user->profile_picture 
                    ? asset('storage/profiles/'.$user->profile_picture) 
                    : null
            ]);
            
        } catch (\Exception $e) {
            Log::error('Profile Error: '.$e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,'.$user->id,
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'current_password' => 'required_with:new_password',
                'new_password' => 'sometimes|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Update basic fields
            $user->name = $request->name;
            $user->email = $request->email;
            $user->phone = $request->phone;
            $user->address = $request->address;

            // Handle password change
            if ($request->new_password) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json(['errors' => ['current_password' => ['Current password is incorrect']]], 422);
                }
                $user->password = Hash::make($request->new_password);
            }

            // Handle profile picture
            if ($request->hasFile('profile_picture')) {
                // Delete old file if exists
                if ($user->profile_picture && Storage::exists('public/profiles/'.$user->profile_picture)) {
                    Storage::delete('public/profiles/'.$user->profile_picture);
                }
                
                // Store new file
                $file = $request->file('profile_picture');
                $filename = time().'_'.$user->id.'.'.$file->extension();
                $path = $file->storeAs('public/profiles', $filename);
                $user->profile_picture = $filename;
            }

            $user->save();

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user,
                'avatar_url' => $user->profile_picture 
                    ? asset('storage/profiles/'.$user->profile_picture) 
                    : null
            ]);
            
        } catch (\Exception $e) {
            Log::error('Update Profile Error: '.$e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }
}