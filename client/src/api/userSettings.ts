import api from './api'; // Assuming 'api' is your configured Axios instance

// Interface for the data returned by getProfile
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string | null; // Match backend possibilities (nullable)
  address?: string | null; // Match backend possibilities (nullable)
  profile_picture?: string | null; // This is likely the filename, not the full URL
  avatar_url?: string | null; // This should be the full URL for display
  role?: string; // Include role if backend sends it
  // Add other relevant fields returned by the backend if needed
}

// Interface for the data structure returned upon successful update
// It might be the same as UserProfile, or just a success message + user object
interface UpdateProfileResponse {
    message: string;
    user: UserProfile; // Assuming the backend returns the updated user object
    avatar_url?: string | null; // Ensure the new avatar URL is returned
}


/**
 * Fetches the current user's profile data.
 * @returns {Promise<UserProfile>} A promise that resolves with the user profile data.
 * @throws {Error} Throws an error if the request fails.
 */
export const getProfile = async (): Promise<UserProfile> => {
  try {
    // The backend returns { user: UserProfile, avatar_url: string | null }
    const response = await api.get<{ user: UserProfile, avatar_url: string | null }>('/api/user-profile');
    // Combine the user data and the avatar URL into a single object
    return {
        ...response.data.user, // Spread the user properties
        avatar_url: response.data.avatar_url // Add the avatar URL
    };
  } catch (error: any) {
    console.error("API Error fetching profile:", error.response?.data || error.message);
    // Provide a more user-friendly error message
    throw new Error(error.response?.data?.message || 'Impossible de charger le profil.');
  }
};

/**
 * Updates the user's profile data.
 * Accepts FormData directly, which should include all necessary fields.
 * @param {FormData} formData The FormData object containing profile data and potentially a profile picture file.
 * @returns {Promise<UserProfile>} A promise that resolves with the updated user profile data.
 * @throws {object|Error} Throws the backend validation errors object or a generic error.
 */
export const updateProfile = async (formData: FormData): Promise<UserProfile> => {
  try {
    // Send PUT request with FormData. Axios handles Content-Type for FormData.
    // Note: Some backend setups might require POST with _method='PUT' for file uploads.
    // If PUT fails, try changing to api.post and adding formData.append('_method', 'PUT');
    const response = await api.post<UpdateProfileResponse>('/api/user-profile', formData, {
       headers: {
         // Typically Axios sets this correctly for FormData, but explicitly setting it can sometimes help.
         // 'Content-Type': 'multipart/form-data', // Usually not needed with Axios + FormData
       },
    });

     // Return the updated user data, ensuring avatar_url is included
    return {
        ...response.data.user,
        avatar_url: response.data.avatar_url
    };

  } catch (error: any) {
    console.error("API Error updating profile:", error.response?.data || error.message);
    // Check if the error response contains validation errors from Laravel (usually status 422)
    if (error.response?.status === 422 && error.response?.data?.errors) {
      // Throw the validation errors object for the frontend to handle
      throw error.response.data.errors;
    }
    // Throw a more generic error for other types of failures
    throw new Error(error.response?.data?.message || 'Échec de la mise à jour du profil.');
  }
};

// Export the functions as part of a default object or individually
export default {
  getProfile,
  updateProfile,
};
