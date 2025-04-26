import { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Edit, 
  Eye, 
  ChevronDown,
  ChevronUp,
  Search,
  Trash2
} from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import RoomModal from '../components/RoomModal';

interface Room {
  id: number;
  name: string;
  building?: string;
  floor?: string;
  description?: string;
  capacity?: number;
  is_active: boolean;
  equipment?: Equipment[];
  created_at?: string;
  updated_at?: string;
}

interface Equipment {
  id: number;
  name: string;
}

interface RoomsProps {
  darkMode: boolean;
}

export default function Rooms({ darkMode }: RoomsProps) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [buildingFilter, setBuildingFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Room; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/rooms');
      setRooms(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des salles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;
    
    try {
      await api.delete(`/api/rooms/${id}`);
      setRooms(rooms.filter(room => room.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const requestSort = (key: keyof Room) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Room) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-0" />;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getStatusBadgeClass = (isActive: boolean) => {
    return isActive 
      ? (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
      : (darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800');
  };

  const getBuildingBadgeClass = (building?: string) => {
    if (!building) return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    
    const buildingColors: Record<string, string> = {
      'Bâtiment A': darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
      'Bâtiment B': darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
      'Bâtiment C': darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
    };
    return buildingColors[building] || (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800');
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.building && room.building.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter 
      ? (statusFilter === 'active' ? room.is_active : !room.is_active)
      : true;
    
    const matchesBuilding = buildingFilter 
      ? room.building === buildingFilter
      : true;
    
    return matchesSearch && matchesStatus && matchesBuilding;
  });

  const sortedRooms = [...filteredRooms];
  if (sortConfig !== null) {
    sortedRooms.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const allBuildings = Array.from(new Set(rooms.map(room => room.building).filter(Boolean))) as string[];

  if (loading) return <div className="p-4 text-center">Chargement...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold md:text-2xl">Gestion des Salles</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title={viewMode === 'grid' ? 'Vue liste' : 'Vue grille'}
          >
            {viewMode === 'grid' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )}
          </button>
          {(user?.role === 'administrateur' || user?.role === 'gestionnaire') && (
            <button 
              onClick={() => {
                setCurrentRoom(null);
                setIsModalOpen(true);
              }}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Salle
            </button>
          )}
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
                placeholder="Rechercher une salle, bâtiment ou description..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
            <select
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
            >
              <option value="">Tous bâtiments</option>
              {allBuildings.map(building => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {sortedRooms.length === 0 ? (
        <div className={`p-8 text-center rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          Aucune salle trouvée
        </div>
      ) : viewMode === 'grid' ? (
        /* Vue Grille */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRooms.map(room => (
            <div key={room.id} className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {room.name}
                      {room.building && (
                        <span className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {room.floor && `Étage ${room.floor}, `}{room.building}
                        </span>
                      )}
                    </h2>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(room.is_active)}`}>
                        {room.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {room.building && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getBuildingBadgeClass(room.building)}`}>
                          {room.building}
                        </span>
                      )}
                    </div>
                  </div>
                  {(user?.role === 'administrateur' || user?.role === 'gestionnaire') && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleDelete(room.id)}
                        className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  {room.capacity && (
                    <div className={`flex items-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Users className="w-5 h-5 mr-2" />
                      <span>Capacité: {room.capacity} personnes</span>
                    </div>
                  )}
                  {room.description && (
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="font-medium">Description:</p>
                      <p className="line-clamp-2">{room.description}</p>
                    </div>
                  )}
                </div>
                {room.equipment && room.equipment.length > 0 && (
                  <div className="mt-4">
                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      Équipements:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {room.equipment.slice(0, 3).map((equip) => (
                        <span 
                          key={equip.id} 
                          className={`px-2 py-1 rounded-md text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {equip.name}
                        </span>
                      ))}
                      {room.equipment.length > 3 && (
                        <span className={`px-2 py-1 rounded-md text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          +{room.equipment.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className={`px-6 py-4 flex justify-end space-x-3 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                {(user?.role === 'administrateur' || user?.role === 'gestionnaire') && (
                  <button 
                    onClick={() => {
                      setCurrentRoom(room);
                      setIsModalOpen(true);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    <Edit className="w-5 h-5 mr-2 inline" />
                    Modifier
                  </button>
                )}
                <button 
                  onClick={() => {
                    setCurrentRoom(room);
                    setIsModalOpen(true);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  <Eye className="w-5 h-5 mr-2 inline" />
                  Détails
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vue Liste */
        <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Salle</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('building')}
                  >
                    <div className="flex items-center">
                      <span>Bâtiment</span>
                      {getSortIcon('building')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('capacity')}
                  >
                    <div className="flex items-center">
                      <span>Capacité</span>
                      {getSortIcon('capacity')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('is_active')}
                  >
                    <div className="flex items-center">
                      <span>Statut</span>
                      {getSortIcon('is_active')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Équipements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {sortedRooms.map(room => (
                  <tr key={room.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {room.name}
                        {room.floor && (
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Étage {room.floor}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {room.building || '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {room.capacity ? `${room.capacity} pers.` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(room.is_active)}`}>
                        {room.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {room.equipment && room.equipment.slice(0, 3).map((equip) => (
                          <span 
                            key={equip.id} 
                            className={`px-2 py-1 rounded-md text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {equip.name}
                          </span>
                        ))}
                        {room.equipment && room.equipment.length > 3 && (
                          <span className={`px-2 py-1 rounded-md text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            +{room.equipment.length - 3}
                          </span>
                        )}
                        {!room.equipment?.length && '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-4">
                        {(user?.role === 'administrateur' || user?.role === 'gestionnaire') && (
                          <>
                            <button 
                              onClick={() => {
                                setCurrentRoom(room);
                                setIsModalOpen(true);
                              }}
                              className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}
                              title="Modifier"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(room.id)}
                              className={darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => {
                            setCurrentRoom(room);
                            setIsModalOpen(true);
                          }}
                          className={darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}
                          title="Détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentRoom(null);
        }}
        onSave={() => {
          setIsModalOpen(false);
          fetchRooms();
        }}
        room={currentRoom}
        darkMode={darkMode}
      />
    </div>
  );
}