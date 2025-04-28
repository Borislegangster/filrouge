import { useState, useEffect } from 'react';
import { 
  Package, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Search, 
  User, 
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchCheckouts, 
  fetchCheckoutStatuses,
  fetchCheckoutStats,
  Checkout,
  CheckoutStats,
  CheckoutFilters
} from '../api/checkoutService';
import NewCheckoutModal from '../components/checkout/NewCheckoutModal';
import ReturnModal from '../components/checkout/ReturnModal';
import CheckoutDetailsModal from '../components/checkout/CheckoutDetailsModal';

interface CheckoutReturnProps {
  darkMode: boolean;
}

export default function CheckoutReturn({ darkMode }: CheckoutReturnProps) {
  const { user } = useAuth();
  const canManage = user?.role === 'administrateur' || user?.role === 'gestionnaire';
  
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [stats, setStats] = useState<CheckoutStats>({
    active: 0,
    late: 0,
    returnedToday: 0,
    upcoming: 0
  });
  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [statuses, setStatuses] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newCheckoutModalOpen, setNewCheckoutModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState<Checkout | null>(null);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0
  });

  const [filters, setFilters] = useState<CheckoutFilters>({
    page: 1,
    per_page: 10
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters: CheckoutFilters = { 
        ...filters,
        page: filters.page || 1,
        per_page: filters.per_page || 10
      };

      if (user?.role === 'formateur') {
        apiFilters.user_id = user.id;
      }
      
      if (searchTerm) {
        apiFilters.search = searchTerm;
      }
      
      if (statusFilter) {
        apiFilters.status = statusFilter;
      }

      const [checkoutsResponse, statusesResponse, statsResponse] = await Promise.all([
        fetchCheckouts(apiFilters),
        fetchCheckoutStatuses(),
        fetchCheckoutStats()
      ]);

      setCheckouts(checkoutsResponse.data);
      setPagination({
        currentPage: checkoutsResponse.current_page,
        lastPage: checkoutsResponse.last_page,
        perPage: checkoutsResponse.per_page,
        total: checkoutsResponse.total
      });

      setStatuses(statusesResponse);
      setStats(statsResponse);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchTerm,
        status: statusFilter,
        page: 1
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

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
      case 'En cours':
        return darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'En retard':
        return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'Retourné':
        return darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.lastPage) return;
    
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleViewDetails = (checkout: Checkout) => {
    setSelectedCheckout(checkout);
    setDetailsModalOpen(true);
  };

  const handleReturnEquipment = (checkout: Checkout) => {
    setSelectedCheckout(checkout);
    setReturnModalOpen(true);
  };

  const sortedCheckouts = [...checkouts];
  if (sortConfig !== null) {
    sortedCheckouts.sort((a: any, b: any) => {
      const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((prev, curr) => 
          prev && prev[curr] ? prev[curr] : null
        , obj);
      };
      
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      
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
        <h1 className="text-xl font-bold md:text-2xl">Gestion des Sorties et Retours</h1>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <button 
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              onClick={() => setNewCheckoutModalOpen(true)}
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Nouvelle Sortie
            </button>
            <button 
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              onClick={() => {
                // Open the return modal with no pre-selected checkout
                setSelectedCheckout(null);
                setReturnModalOpen(false); // We don't open it directly - user needs to select a checkout first
              }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Enregistrer Retour
            </button>
            <button 
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
              onClick={loadData}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Actualiser
            </button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>
            Équipements sortis
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}>
            {stats.active}
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-red-900' : 'bg-red-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-red-200' : 'text-red-600'}`}>
            Retards
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-red-100' : 'text-red-700'}`}>
            {stats.late}
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-green-200' : 'text-green-600'}`}>
            Retours aujourd'hui
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-green-100' : 'text-green-700'}`}>
            {stats.returnedToday}
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>
            Réservations à venir
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-purple-100' : 'text-purple-700'}`}>
            {stats.upcoming}
          </div>
        </div>
      </div>

      {/* Recherche et Filtres */}
      <div className={`rounded-lg shadow-md p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un équipement ou un emprunteur..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode 
                  ? 'focus:ring-blue-500' 
                  : 'focus:ring-blue-300'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className={`px-4 py-2 rounded-lg border ${darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode 
                ? 'focus:ring-blue-500' 
                : 'focus:ring-blue-300'}`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des sorties */}
      <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {error && (
          <div className={`p-4 mb-4 ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Chargement...</span>
          </div>
        )}

        {!loading && checkouts.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-lg font-medium">Aucun résultat trouvé</p>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Essayez de modifier vos filtres ou de créer un nouveau prêt.
            </p>
          </div>
        )}

        {!loading && checkouts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('equipment.name')}
                  >
                    <div className="flex items-center">
                      <span>Équipement</span>
                      {getSortIcon('equipment.name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('user.name')}
                  >
                    <div className="flex items-center">
                      <span>Emprunteur</span>
                      {getSortIcon('user.name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('purpose')}
                  >
                    <div className="flex items-center">
                      <span>Destination</span>
                      {getSortIcon('purpose')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('checkout_date')}
                  >
                    <div className="flex items-center">
                      <span>Dates</span>
                      {getSortIcon('checkout_date')}
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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {sortedCheckouts.map(checkout => (
                  <tr key={checkout.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className={`w-5 h-5 mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {checkout.equipment.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className={`w-5 h-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {checkout.user.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {checkout.purpose}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center">
                          <Calendar className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          {new Date(checkout.checkout_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          {new Date(checkout.expected_return_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(checkout.status)}`}>
                        {checkout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-4">
                        <button 
                          className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}
                          title="Détails"
                          onClick={() => handleViewDetails(checkout)}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {canManage && checkout.status !== 'Retourné' && (
                          <button 
                            className={darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}
                            title="Marquer comme retourné"
                            onClick={() => handleReturnEquipment(checkout)}
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

        {/* Pagination */}
        {!loading && checkouts.length > 0 && (
          <div className={`px-6 py-4 flex items-center justify-between border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-4 py-2 border text-sm font-medium rounded-md ${
                  pagination.currentPage === 1 
                    ? `${darkMode ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-400 border-gray-200'} cursor-not-allowed` 
                    : `${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`
                }`}
              >
                Précédent
              </button>
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
                className={`ml-3 px-4 py-2 border text-sm font-medium rounded-md ${
                  pagination.currentPage === pagination.lastPage 
                    ? `${darkMode ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-400 border-gray-200'} cursor-not-allowed` 
                    : `${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`
                }`}
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Affichage de <span className="font-medium">{(pagination.currentPage - 1) * pagination.perPage + 1}</span> à{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.perPage, pagination.total)}
                  </span> sur{' '}
                  <span className="font-medium">{pagination.total}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                      pagination.currentPage === 1 
                        ? `${darkMode ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-400 border-gray-200'} cursor-not-allowed` 
                        : `${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'}`
                    }`}
                  >
                    Précédent
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                    const page = i + 1;
                    const isCurrentPage = page === pagination.currentPage;
                    
                    return (
                      <button 
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage 
                            ? `${darkMode ? 'bg-gray-600 text-white border-gray-600' : 'bg-blue-50 text-blue-600 border-blue-500'} z-10` 
                            : `${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.lastPage}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                      pagination.currentPage === pagination.lastPage 
                        ? `${darkMode ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-400 border-gray-200'} cursor-not-allowed` 
                        : `${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'}`
                    }`}
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewCheckoutModal 
        isOpen={newCheckoutModalOpen}
        onClose={() => setNewCheckoutModalOpen(false)}
        onSuccess={loadData}
        darkMode={darkMode}
      />

      <ReturnModal 
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onSuccess={loadData}
        checkout={selectedCheckout}
        darkMode={darkMode}
      />

      <CheckoutDetailsModal 
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        checkout={selectedCheckout}
        darkMode={darkMode}
      />
    </div>
  );
}