import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Wrench, 
  CheckCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Search,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import axios from '../api/api';
import { useAuth } from '../context/AuthContext';
import IssueModal from '../components/IssueModal';
import ConfirmModal from '../components/ConfirmModal';

interface Equipment {
  id: number;
  name: string;
  room: {
    name: string;
  };
}

interface User {
  id: number;
  name: string;
}

interface Issue {
  id: number;
  title: string;
  description: string;
  equipment: Equipment;
  priority: 'Basse' | 'Moyenne' | 'Haute' | 'Critique';
  status: 'Ouvert' | 'En cours' | 'Résolu' | 'Fermé';
  reported_by: User;
  assigned_to?: User;
  reported_date: string;
  resolved_date?: string;
  resolution_notes?: string;
}

interface IssuesProps {
  darkMode: boolean;
}

export default function Issues({ darkMode }: IssuesProps) {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<number | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: '0j'
  });

  const [sortConfig, setSortConfig] = useState<{ key: keyof Issue; direction: 'ascending' | 'descending' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchIssues();
    fetchStats();
  }, []);

  const fetchIssues = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/issues');
      setIssues(response.data.data);
    } catch (err) {
      setError('Erreur lors du chargement des pannes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/issues/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const requestSort = (key: keyof Issue) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Issue) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-0" />;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getPriorityBadgeClass = (priority: Issue['priority']) => {
    switch (priority) {
      case 'Haute':
      case 'Critique':
        return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'Moyenne':
        return darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'Basse':
        return darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeClass = (status: Issue['status']) => {
    switch (status) {
      case 'Ouvert':
        return darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'En cours':
        return darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'Résolu':
      case 'Fermé':
        return darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const handleTakeCharge = async (id: number) => {
    try {
      await axios.post(`/api/issues/${id}/take-charge`);
      fetchIssues();
      fetchStats();
    } catch (err) {
      console.error('Erreur lors de la prise en charge:', err);
    }
  };

  const handleMarkAsResolved = async (id: number) => {
    try {
      await axios.post(`/api/issues/${id}/mark-as-resolved`, {
        resolution_notes: 'Problème résolu'
      });
      fetchIssues();
      fetchStats();
    } catch (err) {
      console.error('Erreur lors de la résolution:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/issues/${id}`);
      fetchIssues();
      fetchStats();
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.equipment.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter ? issue.priority === priorityFilter : true;
    const matchesStatus = statusFilter ? issue.status === statusFilter : true;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const sortedIssues = [...filteredIssues];
  if (sortConfig !== null) {
    sortedIssues.sort((a, b) => {
      // Gestion spéciale pour les dates et les objets imbriqués
      let aValue, bValue;
      
      if (sortConfig.key === 'equipment') {
        aValue = a.equipment.name;
        bValue = b.equipment.name;
      } else if (sortConfig.key === 'reported_by') {
        aValue = a.reported_by.name;
        bValue = b.reported_by.name;
      } else if (sortConfig.key === 'assigned_to') {
        aValue = a.assigned_to?.name || '';
        bValue = b.assigned_to?.name || '';
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const canEditDelete = (issue: Issue) => {
    if (user?.role === 'administrateur' || user?.role === 'gestionnaire') return true;
    return issue.reported_by.id === user?.id && !issue.assigned_to;
  };

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      {/* Modal pour créer/modifier une panne */}
      <IssueModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentIssue(null);
        }}
        onSave={() => {
          fetchIssues();
          setIsModalOpen(false);
          setCurrentIssue(null);
        }}
        issue={currentIssue}
        darkMode={darkMode}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => issueToDelete && handleDelete(issueToDelete)}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce signalement de panne ?"
        darkMode={darkMode}
      />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold md:text-2xl">Signalement des Pannes</h1>
        <button 
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Signaler une Panne
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-yellow-200' : 'text-yellow-600'}`}>
            En attente
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-yellow-100' : 'text-yellow-700'}`}>
            {stats.pending}
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>
            En cours
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}>
            {stats.inProgress}
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-green-200' : 'text-green-600'}`}>
            Résolues
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-green-100' : 'text-green-700'}`}>
            {stats.resolved}
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>
            Temps moyen de résolution
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-purple-100' : 'text-purple-700'}`}>
            {stats.avgResolutionTime}
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className={`rounded-lg shadow-md p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un équipement, problème ou signalant..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">Toutes priorités</option>
              <option value="Basse">Basse</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Haute">Haute</option>
              <option value="Critique">Critique</option>
            </select>
            <select
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous statuts</option>
              <option value="Ouvert">Ouvert</option>
              <option value="En cours">En cours</option>
              <option value="Résolu">Résolu</option>
              <option value="Fermé">Fermé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des pannes */}
      <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('title')}
                >
                  <div className="flex items-center">
                    <span>Titre</span>
                    {getSortIcon('title')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('equipment')}
                >
                  <div className="flex items-center">
                    <span>Équipement</span>
                    {getSortIcon('equipment')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('priority')}
                >
                  <div className="flex items-center">
                    <span>Priorité</span>
                    {getSortIcon('priority')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    <span>Statut</span>
                    {getSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('assigned_to')}
                >
                  <div className="flex items-center">
                    <span>Assigné à</span>
                    {getSortIcon('assigned_to')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Chargement...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : sortedIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Aucun signalement trouvé
                  </td>
                </tr>
              ) : (
                sortedIssues.map(issue => (
                  <tr key={issue.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {issue.title}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {issue.description.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {issue.equipment?.name || 'Équipement inconnu'}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {issue.equipment?.room?.name || 'Localisation inconnue'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {issue.assigned_to?.name ? (
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {issue.assigned_to.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {issue.assigned_to.name}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Non assigné
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        {(user?.role === 'administrateur' || user?.role === 'gestionnaire') && issue.status === 'Ouvert' && (
                          <button 
                            onClick={() => handleTakeCharge(issue.id)}
                            className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}
                            title="Prendre en charge"
                          >
                            <Wrench className="w-5 h-5" />
                          </button>
                        )}
                        {(user?.role === 'administrateur' || user?.role === 'gestionnaire') && issue.status === 'En cours' && (
                          <button 
                            onClick={() => handleMarkAsResolved(issue.id)}
                            className={darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}
                            title="Marquer comme résolu"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {canEditDelete(issue) && (
                          <>
                            <button 
                              onClick={() => {
                                setCurrentIssue(issue);
                                setIsModalOpen(true);
                              }}
                              className={darkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-800'}
                              title="Modifier"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                setIssueToDelete(issue.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className={darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}