import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Loader2, Check, X } from 'lucide-react';
import userSettings from '../api/userSettings'; // Assuming userSettings API is correctly defined

// Define a more specific type for the user profile state
interface UserProfileState {
  id: number;
  name: string;
  email: string;
  phone?: string | null; // Allow null
  address?: string | null; // Allow null
  avatar_url?: string | null; // Allow null
  // Fields for password change (not part of the actual user model)
  currentPassword?: string;
  newPassword?: string;
  newPasswordConfirmation?: string;
}

interface ProfilePageProps {
  darkMode: boolean;
}

export default function ProfilePage({ darkMode }: ProfilePageProps) {
  // Use the user from AuthContext for initial comparison if needed, but fetch fresh profile data
  const { user: authUser, logout, updateUser } = useAuth();
  // Initialize state with null or a default structure
  const [user, setUser] = useState<UserProfileState | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState<any>({}); // Consider a more specific error type
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true); // Start loading
      setErrors({}); // Clear previous errors
      try {
        // Fetch profile data using the API service
        // The response from getProfile should match UserProfile interface from userSettings.ts
        const profileData = await userSettings.getProfile();
        // Set the user state with fetched data
        setUser({
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            address: profileData.address,
            avatar_url: profileData.avatar_url, // Use the correct field name from backend
        });
        setPreviewUrl(profileData.avatar_url || null); // Set initial preview/avatar
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setErrors({ general: 'Impossible de charger le profil. Veuillez réessayer.' });
        // Optionally logout or redirect if profile fetch fails critically
        // if (error.response?.status === 401) {
        //   logout();
        // }
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchProfile();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic validation (optional: add size/type checks here)
      if (file.size > 2 * 1024 * 1024) { // Example: 2MB limit
          setErrors({ ...errors, profile_picture: ['Le fichier est trop volumineux (max 2Mo).'] });
          return;
      }
      setSelectedFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Clear potential previous file error
      setErrors((prevErrors: any) => {
          const { profile_picture, ...rest } = prevErrors;
          return rest;
      });
    }
  };

  // Trigger the hidden file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle changes in form inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Update the user state, ensuring user is not null
    setUser(prevUser => prevUser ? { ...prevUser, [name]: value } : null);
     // Clear errors for the field being changed
    if (errors[name]) {
        setErrors((prevErrors: any) => {
            const { [name]: _, ...rest } = prevErrors;
            return rest;
        });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent submission if already submitting or if user data is not loaded
    if (isSubmitting || !user) return;

    setIsSubmitting(true); // Set submitting state
    setErrors({}); // Clear previous errors
    setSuccess(''); // Clear previous success message

    // Create FormData to send data including the file
    const formData = new FormData();

    // **Always** append required fields for backend validation
    formData.append('name', user.name);
    formData.append('email', user.email);

    // Append other fields (handle null/undefined)
    formData.append('phone', user.phone || ''); // Send empty string if null/undefined
    formData.append('address', user.address || ''); // Send empty string if null/undefined

    // Append the profile picture file if selected
    if (selectedFile) {
      formData.append('profile_picture', selectedFile);
    }

    // Append password fields only if new password is provided
    if (user.newPassword) {
      formData.append('current_password', user.currentPassword || '');
      formData.append('new_password', user.newPassword);
      formData.append('new_password_confirmation', user.newPasswordConfirmation || '');
    }

    // Append _method for PUT request if your backend/axios setup requires it
    // Laravel typically handles PUT requests with FormData correctly via Axios,
    // but if you encounter issues, uncomment the line below and ensure your
    // `api.put` call in `userSettings.ts` actually sends as POST.
    // formData.append('_method', 'PUT');

    try {
      // Call the updateProfile service function directly with FormData
      const updatedUser = await userSettings.updateProfile(formData); // Pass FormData directly

      // Update local state with the response data
      setUser({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          avatar_url: updatedUser.avatar_url, // Use the updated avatar URL
          // Clear password fields from state after successful update
          currentPassword: '',
          newPassword: '',
          newPasswordConfirmation: '',
      });
      // Update the preview URL if it changed
      if (updatedUser.avatar_url) {
          setPreviewUrl(updatedUser.avatar_url);
      }

      // Mettez à jour le contexte d'authentification
      if (updateUser) {
        updateUser({
          name: updatedUser.name,
          email: updatedUser.email,
          avatar_url: updatedUser.avatar_url,
          phone: updatedUser.phone,
          address: updatedUser.address
        });
      }

      setSuccess('Profil mis à jour avec succès !');
      setEditMode(false); // Exit edit mode
      setSelectedFile(null); // Clear selected file
      // No need to clear previewUrl if it's showing the new avatar_url
    } catch (error: any) {
      console.error("Update profile error:", error);
      if (error && typeof error === 'object') {
        // Assuming the error object has keys corresponding to field names
        setErrors(error);
      } else if (error instanceof Error) {
         setErrors({ general: error.message || 'Échec de la mise à jour du profil.' });
      } else {
         setErrors({ general: 'Une erreur inconnue est survenue.' });
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
    setErrors({}); // Clear errors
    setSelectedFile(null); // Clear selected file
    // Reset user state to the initially fetched state (requires storing it)
    // Or re-fetch the profile - simpler for now: reset preview if file was selected
    if (selectedFile && user) {
        setPreviewUrl(user.avatar_url || null);
    }
    // Clear password fields on cancel
    setUser(prevUser => prevUser ? {
        ...prevUser,
        currentPassword: '',
        newPassword: '',
        newPasswordConfirmation: '',
    } : null);
  };


  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className={`animate-spin h-12 w-12 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
      </div>
    );
  }

  // Render message if user data failed to load
  if (!user && !loading) {
      return (
          <div className={`p-4 md:p-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <div className="max-w-4xl mx-auto text-center">
                  <p className={`mb-4 p-3 rounded-md text-sm ${darkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'}`}>
                      {errors.general || 'Impossible de charger les informations du profil.'}
                  </p>
                  <button
                      onClick={() => window.location.reload()} // Simple reload action
                      className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition`}
                  >
                      Réessayer
                  </button>
              </div>
          </div>
      );
  }

  // Render the main profile page content
  return (
    <div className={`p-4 md:p-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="max-w-3xl mx-auto"> {/* Adjusted max-width */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Mon Profil</h1>
            {!editMode && (
                <button
                    onClick={() => setEditMode(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition`}
                >
                    Modifier le profil
                </button>
            )}
        </div>

        {/* Success Message */}
        {success && (
          <div className={`mb-4 p-3 rounded-md text-sm flex items-center ${darkMode ? 'bg-green-900/60 text-green-200 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200'}`}>
            <Check className="h-5 w-5 mr-2 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* General Error Message */}
        {errors.general && (
          <div className={`mb-4 p-3 rounded-md text-sm flex items-center ${darkMode ? 'bg-red-900/60 text-red-200 border border-red-700' : 'bg-red-100 text-red-800 border border-red-200'}`}>
             <X className="h-5 w-5 mr-2 flex-shrink-0" />
             {errors.general}
          </div>
        )}

        {/* Profile Card */}
        <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8"> {/* Increased spacing */}
              {/* Profile Picture Section */}
              <div className="relative group flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
                  <img
                    // Use previewUrl if available (during edit), otherwise user's avatar_url, or fallback
                    src={previewUrl || user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&color=fff&length=2&bold=true&size=160`}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                    onError={(e) => { // Fallback for broken image links
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&color=fff&length=2&bold=true&size=160`;
                    }}
                  />
                </div>

                {/* Edit Button for Profile Picture */}
                {editMode && (
                  <>
                    <button
                      type="button" // Important: prevent form submission
                      onClick={triggerFileInput}
                      disabled={isSubmitting} // Disable while submitting
                      className={`absolute bottom-1 right-1 flex items-center justify-center w-10 h-10 rounded-full ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-100 hover:bg-blue-200'} text-blue-600 dark:text-blue-300 transition-all shadow-md`}
                      aria-label="Changer la photo de profil"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/gif" // Be specific
                      className="hidden"
                      disabled={isSubmitting}
                    />
                     {errors.profile_picture && <p className="mt-1 text-xs text-red-500 absolute -bottom-5 w-full text-center">{errors.profile_picture[0]}</p>}
                  </>
                )}
              </div>

              {/* User Information Section */}
              <div className="flex-1 w-full">
                {editMode ? (
                  // EDIT MODE FORM
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nom complet</label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={user?.name || ''}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                        required // HTML5 validation
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name[0]}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={user?.email || ''}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                        required // HTML5 validation
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Téléphone (Optionnel)</label>
                      <input
                        id="phone"
                        type="tel" // Use type="tel"
                        name="phone"
                        value={user?.phone || ''}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        placeholder="Ex: +1234567890"
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone[0]}</p>}
                    </div>

                    {/* Address */}
                    <div>
                      <label htmlFor="address" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Adresse (Optionnel)</label>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        value={user?.address || ''}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        placeholder="Votre adresse"
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : ''}`}
                      />
                      {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address[0]}</p>}
                    </div>

                    {/* Password Change Section */}
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold mb-3">Changer le mot de passe (Optionnel)</h3>
                      <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                          <label htmlFor="currentPassword" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mot de passe actuel</label>
                          <input
                            id="currentPassword"
                            type="password"
                            name="currentPassword"
                            value={user?.currentPassword || ''}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            // Conditionally require if new password is set
                            required={!!user?.newPassword}
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.current_password ? 'border-red-500' : ''}`}
                          />
                          {errors.current_password && <p className="mt-1 text-sm text-red-500">{errors.current_password[0]}</p>}
                        </div>

                        {/* New Password */}
                        <div>
                          <label htmlFor="newPassword" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nouveau mot de passe</label>
                          <input
                            id="newPassword"
                            type="password"
                            name="newPassword"
                            value={user?.newPassword || ''}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            minLength={8} // HTML5 validation
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.new_password ? 'border-red-500' : ''}`}
                          />
                          {errors.new_password && <p className="mt-1 text-sm text-red-500">{errors.new_password[0]}</p>}
                        </div>

                        {/* Confirm New Password */}
                        <div>
                          <label htmlFor="newPasswordConfirmation" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirmer le nouveau mot de passe</label>
                          <input
                            id="newPasswordConfirmation"
                            type="password"
                            name="newPasswordConfirmation"
                            value={user?.newPasswordConfirmation || ''}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                             // Conditionally require if new password is set
                            required={!!user?.newPassword}
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.new_password_confirmation ? 'border-red-500' : ''}`} // Check confirmation error if backend sends it
                          />
                           {/* Display confirmation error if passwords don't match (from backend) */}
                           {errors.new_password && errors.new_password[0]?.includes('confirmation') && <p className="mt-1 text-sm text-red-500">{errors.new_password[0]}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6">
                      <button
                        type="button" // Cancel button
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} transition flex items-center`}
                      >
                        <X className="h-4 w-4 mr-1" /> Annuler
                      </button>
                      <button
                        type="submit" // Submit button
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </form>
                ) : (
                  // VIEW MODE
                  <div className="space-y-4">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nom complet</p>
                      <p className="text-lg">{user?.name}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                      <p className="text-lg">{user?.email}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Téléphone</p>
                      <p className="text-lg">{user?.phone || <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Non fourni</span>}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Adresse</p>
                      <p className="text-lg">{user?.address || <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Non fournie</span>}</p>
                    </div>
                     {/* Display Role - Assuming role comes from AuthContext or profile fetch */}
                     <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rôle</p>
                        <p className="text-lg capitalize">{authUser?.role || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
