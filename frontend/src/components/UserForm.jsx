import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import userService from '../apis/users';

// interface UserFormProps {
//   user?: User;
//   onSubmit: (data: User) => void;
//   onCancel: () => void;
//   darkMode: boolean;
//   isSubmitting: boolean;
//   isInvitationMode?: boolean;
// }

const UserForm = ({
  user,
  onSubmit,
  onCancel,
  darkMode,
  isSubmitting,
  isInvitationMode = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Utilisateur',
    status: 'Actif',
  });

  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Charger les options
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true);
      try {
        const [roles] = await Promise.all([
          userService.getRoles()
        ]);
        setAvailableRoles(roles);
      } catch (error) {
        console.error("Erreur lors du chargement des options", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOptions();
  }, []);

  // Initialiser le formulaire
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Formateur',
        status: user.status || 'Actif'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email est requis';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!isInvitationMode && !formData.name) {
      newErrors.name = 'Nom est requis';
    }
    
    if (!formData.role) {
      newErrors.role = 'Rôle est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isInvitationMode ? (
        <div>
          <label htmlFor="email" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="email@exemple.com"
          />
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="name" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Nom complet *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="Nom et prénom"
            />
          </div>

          <div>
            <label htmlFor="email" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="email@exemple.com"
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="role" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          Rôle *
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
        >
          {isLoading ? (
            <option>Chargement...</option>
          ) : (
            availableRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))
          )}
        </select>
      </div>

      {!isInvitationMode && (
        <div>
          <label htmlFor="status" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Statut *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
          >
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
            <option value="En attente">En attente</option>
          </select>
        </div>
      )}

      {isInvitationMode && (
        <div className={`p-3 rounded-md ${darkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
          <p className="text-sm">
            Un email d'invitation sera envoyé à cette adresse avec un lien d'activation.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center min-w-[100px] ${isSubmitting ? 'opacity-75' : ''}`}
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin mr-2" size={16} />
              {isInvitationMode ? 'Envoi...' : 'Enregistrement...'}
            </>
          ) : (
            isInvitationMode ? 'Envoyer' : (user ? 'Mettre à jour' : 'Ajouter')
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
