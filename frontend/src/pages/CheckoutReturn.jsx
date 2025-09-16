import { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';

// interface Checkout {
//   id: number;
//   equipment: string;
//   borrower: string;
//   location: string;
//   checkoutDate: string;
//   expectedReturn: string;
//   status: 'En cours' | 'En retard' | 'Retourné';
// }

// interface CheckoutReturnProps {
//   darkMode: boolean;
// }

export default function CheckoutReturn({ darkMode }) {
  const [checkouts] = useState([
    {
      id: 1,
      equipment: 'Ordinateur portable Dell XPS',
      borrower: 'Jean Formateur',
      location: 'Formation Excel - Site Client',
      checkoutDate: '2024-01-15',
      expectedReturn: '2024-01-18',
      status: 'En cours'
    },
    {
      id: 2,
      equipment: 'Projecteur Epson',
      borrower: 'Marie Gestionnaire',
      location: 'Séminaire Marketing',
      checkoutDate: '2024-01-14',
      expectedReturn: '2024-01-16',
      status: 'En retard'
    },
    {
      id: 3,
      equipment: 'Kit Visioconférence',
      borrower: 'Pierre Support',
      location: 'Formation à distance',
      checkoutDate: '2024-01-13',
      expectedReturn: '2024-01-15',
      status: 'Retourné'
    }
  ]);

  const [sortConfig, setSortConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-0" />;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getStatusBadgeClass = (status) => {
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

  const filteredCheckouts = checkouts.filter(checkout => {
    const matchesSearch = 
      checkout.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkout.borrower.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkout.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? checkout.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const sortedCheckouts = [...filteredCheckouts];
  if (sortConfig !== null) {
    sortedCheckouts.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold md:text-2xl">Gestion des Sorties et Retours</h1>
        <div className="flex flex-wrap gap-2">
          <button 
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Nouvelle Sortie
          </button>
          <button 
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Enregistrer Retour
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>
            Équipements sortis
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}>
            8
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-red-900' : 'bg-red-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-red-200' : 'text-red-600'}`}>
            Retards
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-red-100' : 'text-red-700'}`}>
            2
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-green-200' : 'text-green-600'}`}>
            Retours aujourd'hui
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-green-100' : 'text-green-700'}`}>
            5
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>
            Réservations à venir
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-purple-100' : 'text-purple-700'}`}>
            3
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
              <option value="">Tous les statuts</option>
              <option value="En cours">En cours</option>
              <option value="En retard">En retard</option>
              <option value="Retourné">Retourné</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des sorties */}
      <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
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
                  onClick={() => requestSort('borrower')}
                >
                  <div className="flex items-center">
                    <span>Emprunteur</span>
                    {getSortIcon('borrower')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('location')}
                >
                  <div className="flex items-center">
                    <span>Destination</span>
                    {getSortIcon('location')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('checkoutDate')}
                >
                  <div className="flex items-center">
                    <span>Dates</span>
                    {getSortIcon('checkoutDate')}
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
                        {checkout.equipment}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className={`w-5 h-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {checkout.borrower}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {checkout.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex items-center">
                        <Calendar className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        Sortie: {checkout.checkoutDate}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        Retour: {checkout.expectedReturn}
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
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {checkout.status !== 'Retourné' && (
                        <button 
                          className={darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}
                          title="Marquer comme retourné"
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

        {/* Pagination */}
        <div className={`px-6 py-4 flex items-center justify-between border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex-1 flex justify-between sm:hidden">
            <button 
              className={`px-4 py-2 border text-sm font-medium rounded-md ${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
            >
              Précédent
            </button>
            <button 
              className={`ml-3 px-4 py-2 border text-sm font-medium rounded-md ${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Affichage de <span className="font-medium">1</span> à{' '}
                <span className="font-medium">{sortedCheckouts.length}</span> sur{' '}
                <span className="font-medium">{checkouts.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button 
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'}`}
                >
                  Précédent
                </button>
                <button 
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                >
                  1
                </button>
                <button 
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                >
                  2
                </button>
                <button 
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'}`}
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}