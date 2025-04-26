import { useState, useEffect } from 'react';
import {
  Edit, Trash2, ChevronDown, ChevronUp, Search,
  Shield, User, BookOpen, Loader,
  AlertCircle, CheckCircle, Send
} from 'lucide-react';
import userService, { User as UserType } from '../api/users';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface UsersProps {
  darkMode: boolean;
}

export default function Users({ darkMode }: UsersProps) {
  const { user: currentAuthUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres et tri
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserType; direction: 'ascending' | 'descending' } | null>(null);

  // Modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chargement initial des utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await userService.getAll();
        setUsers(data);
      } catch (error) {
        setError("Erreur lors du chargement des utilisateurs");
        toast.error("Erreur lors du chargement des utilisateurs");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Fonction pour trier les utilisateurs
  const requestSort = (key: keyof UserType) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof UserType) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-0" />;
    return sortConfig.direction === 'ascending' 
      ? <ChevronUp className="w-4 h-4" /> 
      : <ChevronDown className="w-4 h-4" />;
  };

  // Classes CSS dynamiques
  const getRoleBadgeClass = (role: string) => {
    const classes = {
      'administrateur': darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
      'formateur': darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
      'gestionnaire': darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
    };
    return classes[role as keyof typeof classes] || 
      (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800');
  };

  const getStatusBadgeClass = (status: string) => {
    const classes = {
      'Actif': darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
      'Inactif': darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
      'En attente': darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
    };
    return classes[status as keyof typeof classes] || 
      (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800');
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      'administrateur': <Shield className="w-4 h-4 mr-1" />,
      'formateur': <BookOpen className="w-4 h-4 mr-1" />,
      'gestionnaire': <User className="w-4 h-4 mr-1" />,
    };
    return icons[role as keyof typeof icons] || <User className="w-4 h-4 mr-1" />;
  };

  const handleSendInvitation = async (data: UserType) => {
    setIsSubmitting(true);
    try {
      await userService.sendInvitation({
        email: data.email,
        role: data.role
      });
      const updatedUsers = await userService.getAll();
      setUsers(updatedUsers);
      setIsInviteModalOpen(false);
      toast.success('Invitation envoyée avec succès');
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi de l'invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateUser = async (Id: number) => {
    setIsSubmitting(true);
    try {
      await userService.activateUser(Id);
      const updatedUsers = await userService.getAll();
      setUsers(updatedUsers);
      toast.success('Utilisateur activé avec succès');
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de l'activation de l'utilisateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (data: UserType) => {
    if (!currentUser?.id) return;
    
    setIsSubmitting(true);
    try {
      const updatedUser = await userService.update(currentUser.id, data);
      setUsers(users.map(user => 
        user.id === currentUser.id ? updatedUser : user
      ));
      setIsEditModalOpen(false);
      toast.success('Utilisateur mis à jour avec succès');
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser?.id) return;
    
    setIsSubmitting(true);
    try {
      await userService.deleteUser(currentUser.id);
      setUsers(users.filter(user => user.id !== currentUser.id));
      setIsDeleteModalOpen(false);
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la suppression");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrage et tri des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesStatus = statusFilter ? user.status === statusFilter : true;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  // Vérification des permissions
  const canInvite = currentAuthUser?.role === 'administrateur' || currentAuthUser?.role === 'gestionnaire';

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold md:text-2xl">Gestion des Utilisateurs</h1>
        
        <div className="flex gap-2">
          {canInvite && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className={`flex items-center px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              <Send className="w-5 h-5 mr-2" />
              Inviter Un Utilisateur
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className={`rounded-lg shadow-md p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Tous les rôles</option>
              <option value="administrateur">Administrateur</option>
              <option value="gestionnaire">Gestionnaire</option>
              <option value="formateur">Formateur</option>
            </select>
            
            <select
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous statuts</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="En attente">En attente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2">Chargement...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                    <div className="flex items-center">
                      <span>Utilisateur</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => requestSort('role')}>
                    <div className="flex items-center">
                      <span>Rôle</span>
                      {getSortIcon('role')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>
                    <div className="flex items-center">
                      <span>Statut</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {sortedUsers.map(user => (
                  <tr key={user.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.name}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            setCurrentUser(user);
                            setIsEditModalOpen(true);
                          }}
                          className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setCurrentUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className={darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        
                        {user.status === 'En attente' && (
                          <button
                            onClick={() => user.id && handleActivateUser(user.id)}
                            className={darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}
                            title="Activer"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Inviter un utilisateur"
        size="lg"
        darkMode={darkMode}
      >
        <UserForm
          onSubmit={handleSendInvitation}
          onCancel={() => setIsInviteModalOpen(false)}
          darkMode={darkMode}
          isSubmitting={isSubmitting}
          isInvitationMode={true}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier l'utilisateur"
        size="lg"
        darkMode={darkMode}
      >
        <UserForm
          user={currentUser || undefined}
          onSubmit={handleEditUser}
          onCancel={() => setIsEditModalOpen(false)}
          darkMode={darkMode}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
        size="sm"
        darkMode={darkMode}
      >
        <div className="py-4">
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Êtes-vous sûr de vouloir supprimer l'utilisateur <span className="font-semibold">{currentUser?.name}</span> ?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center ${isSubmitting ? 'opacity-75' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  Suppression...
                </>
              ) : 'Supprimer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}