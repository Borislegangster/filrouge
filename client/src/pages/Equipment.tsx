import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  HardDrive,
  Monitor,
  Video,
  Server,
  Wifi,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getEquipment, 
  getEquipmentTypes, 
  getEquipmentStatuses,
  createEquipment,
  updateEquipment,
  deleteEquipment
} from '../api/equipment';
import EquipmentModal from '../components/EquipmentModal';
import ConfirmationModal from '../components/ConfirmationModal';

interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  status: string;
  serial_number?: string;
  description?: string;
  purchase_date?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  room?: {
    id: number;
    name: string;
  };
  provider?: {
    id: number;
    name: string;
  };
}

interface EquipmentProps {
  darkMode: boolean;
}

export default function Equipment({ darkMode }: EquipmentProps) {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState<EquipmentItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<number | null>(null);

  const canManage = user?.role === 'administrateur' || user?.role === 'gestionnaire';

  useEffect(() => {
    fetchEquipment();
    fetchFilters();
  }, []);

  const fetchEquipment = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        search: searchTerm,
        type: typeFilter,
        status: statusFilter,
        per_page: pagination.per_page
      };
      
      const response = await getEquipment(params);
      setEquipment(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [typesResponse, statusesResponse] = await Promise.all([
        getEquipmentTypes(),
        getEquipmentStatuses()
      ]);
      setTypes(typesResponse);
      setStatuses(statusesResponse);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleSearch = () => {
    fetchEquipment(1);
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-0" />;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Fonctionnel':
        return darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      case 'En panne':
        return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'En maintenance':
        return darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'Réservé':
        return darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Informatique':
        return <HardDrive className="w-5 h-5 mr-2" />;
      case 'Audiovisuel':
        return <Video className="w-5 h-5 mr-2" />;
      case 'Réseau':
        return <Wifi className="w-5 h-5 mr-2" />;
      case 'Périphérique':
        return <Monitor className="w-5 h-5 mr-2" />;
      default:
        return <Server className="w-5 h-5 mr-2" />;
    }
  };

  const handlePageChange = (page: number) => {
    fetchEquipment(page);
  };

  const handleCreate = () => {
    setCurrentEquipment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (equip: EquipmentItem) => {
    setCurrentEquipment(equip);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setEquipmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (equipmentToDelete) {
      try {
        await deleteEquipment(equipmentToDelete);
        fetchEquipment(pagination.current_page);
      } catch (error) {
        console.error('Error deleting equipment:', error);
      } finally {
        setIsDeleteModalOpen(false);
        setEquipmentToDelete(null);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (currentEquipment) {
        await updateEquipment(currentEquipment.id, data);
      } else {
        await createEquipment(data);
      }
      fetchEquipment(pagination.current_page);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  const sortedEquipment = [...equipment];
  if (sortConfig !== null) {
    sortedEquipment.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof EquipmentItem];
      const bValue = b[sortConfig.key as keyof EquipmentItem];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold md:text-2xl">Gestion des Équipements</h1>
        {canManage && (
          <button 
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            onClick={handleCreate}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvel Équipement
          </button>
        )}
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
                placeholder="Rechercher un équipement ou numéro de série..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tous les types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les états</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des équipements */}
      <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('name')}
                    >
                      <div className="flex items-center">
                        <span>Équipement</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('type')}
                    >
                      <div className="flex items-center">
                        <span>Type</span>
                        {getSortIcon('type')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('status')}
                    >
                      <div className="flex items-center">
                        <span>État</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('room.name')}
                    >
                      <div className="flex items-center">
                        <span>Emplacement</span>
                        {getSortIcon('room.name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('last_maintenance')}
                    >
                      <div className="flex items-center">
                        <span>Dernière maintenance</span>
                        {getSortIcon('last_maintenance')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  {sortedEquipment.length > 0 ? (
                    sortedEquipment.map(item => (
                      <tr key={item.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </div>
                          {item.serial_number && (
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.serial_number}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTypeIcon(item.type)}
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {item.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.room?.name || 'Non attribué'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.last_maintenance || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-4">
                            {canManage ? (
                              <>
                                <button 
                                  className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}
                                  title="Modifier"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button 
                                  className={darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}
                                  title="Supprimer"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <button 
                                className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}
                                title="Voir les détails"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Aucun équipement trouvé
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className={`px-6 py-4 flex items-center justify-between border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex-1 flex justify-between sm:hidden">
                  <button 
                    onClick={() => handlePageChange(Math.max(1, pagination.current_page - 1))}
                    disabled={pagination.current_page === 1}
                    className={`px-4 py-2 border text-sm font-medium rounded-md ${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} ${pagination.current_page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Précédent
                  </button>
                  <button 
                    onClick={() => handlePageChange(Math.min(pagination.last_page, pagination.current_page + 1))}
                    disabled={pagination.current_page === pagination.last_page}
                    className={`ml-3 px-4 py-2 border text-sm font-medium rounded-md ${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} ${pagination.current_page === pagination.last_page ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Affichage de <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> à{' '}
                      <span className="font-medium">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> sur{' '}
                      <span className="font-medium">{pagination.total}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button 
                        onClick={() => handlePageChange(Math.max(1, pagination.current_page - 1))}
                        disabled={pagination.current_page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'} ${pagination.current_page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Précédent
                      </button>
                      {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                        let pageNum;
                        if (pagination.last_page <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.current_page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.current_page >= pagination.last_page - 2) {
                          pageNum = pagination.last_page - 4 + i;
                        } else {
                          pageNum = pagination.current_page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} ${pagination.current_page === pageNum ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600') : ''}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button 
                        onClick={() => handlePageChange(Math.min(pagination.last_page, pagination.current_page + 1))}
                        disabled={pagination.current_page === pagination.last_page}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'} ${pagination.current_page === pagination.last_page ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Suivant
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        equipment={currentEquipment}
        types={types}
        statuses={statuses}
        darkMode={darkMode}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action est irréversible."
        darkMode={darkMode}
      />
    </div>
  );
}