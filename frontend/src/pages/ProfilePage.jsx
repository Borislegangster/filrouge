import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Loader2, Check, X } from 'lucide-react';
import userSettings from '../apis/userSettings';

// interface ProfilePageProps {
//   darkMode: boolean;
// }

export default function ProfilePage({ darkMode }) {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userSettings.getProfile();
        setUser(profile);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Créer un URL de prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
  
    try {
      const formData = new FormData();
      
      if (user.name !== authUser?.name) formData.append('name', user.name);
      if (user.email !== authUser?.email) formData.append('email', user.email);
      if (user.phone !== authUser?.phone) formData.append('phone', user.phone || '');
      if (user.address !== authUser?.address) formData.append('address', user.address || '');
      if (selectedFile) formData.append('profile_picture', selectedFile);
      
      // Gestion du mot de passe
      if (user.newPassword) {
        formData.append('current_password', user.currentPassword || '');
        formData.append('new_password', user.newPassword);
        formData.append('new_password_confirmation', user.newPasswordConfirmation || '');
      }
  
      const updatedUser = await userSettings.updateProfile({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profile_picture: selectedFile,
        current_password: user.currentPassword,
        new_password: user.newPassword,
        new_password_confirmation: user.newPasswordConfirmation
      });
      
      setUser(updatedUser);
      setSuccess('Profil mis à jour avec succès');
      setEditMode(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      if (typeof error === 'object') {
        setErrors(error);
      } else {
        setErrors({ general: error.message });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
        
        {success && (
          <div className={`mb-4 p-3 rounded-md text-sm ${darkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800'}`}>
            {success}
          </div>
        )}

        {errors.general && (
          <div className={`mb-4 p-3 rounded-md text-sm ${darkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'}`}>
            {errors.general}
          </div>
        )}

        <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
              {/* Photo de profil */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500">
                  <img
                    src={previewUrl || user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=random&color=fff&length=2&bold=true`}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {editMode && (
                  <>
                    <button
                      onClick={triggerFileInput}
                      className={`absolute bottom-0 right-0 flex items-center justify-center w-10 h-10 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-100 hover:bg-blue-200'} transition-all`}
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* Informations utilisateur */}
              <div className="flex-1">
                {editMode ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nom complet</label>
                      <input
                        type="text"
                        name="name"
                        value={user?.name || ''}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name[0]}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={user?.email || ''}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${errors.email ? 'border-red-500' : ''}`}
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Téléphone</label>
                      <input
                        type="text"
                        name="phone"
                        value={user?.phone || ''}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${errors.phone ? 'border-red-500' : ''}`}
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone[0]}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Adresse</label>
                      <input
                        type="text"
                        name="address"
                        value={user?.address || ''}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${errors.address ? 'border-red-500' : ''}`}
                      />
                      {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address[0]}</p>}
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium mb-3">Changer le mot de passe</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mot de passe actuel</label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={user?.currentPassword || ''}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${errors.current_password ? 'border-red-500' : ''}`}
                          />
                          {errors.current_password && <p className="mt-1 text-sm text-red-500">{errors.current_password[0]}</p>}
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nouveau mot de passe</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={user?.newPassword || ''}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${errors.new_password ? 'border-red-500' : ''}`}
                          />
                          {errors.new_password && <p className="mt-1 text-sm text-red-500">{errors.new_password[0]}</p>}
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirmer le nouveau mot de passe</label>
                          <input
                            type="password"
                            name="newPasswordConfirmation"
                            value={user?.newPasswordConfirmation || ''}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setErrors({});
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition flex items-center`}
                      >
                        <Check className="h-5 w-5 mr-1" />
                        Enregistrer
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold">{user?.name}</h2>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user?.email}</p>
                      {user?.phone && <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.phone}</p>}
                      {user?.address && <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.address}</p>}
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => setEditMode(true)}
                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white transition`}
                      >
                        Modifier le profil
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}