import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Phone,
  Mail,
  Globe,
  Building,
  HardHat,
  CheckCircle,
  Video,
  Wrench,
} from 'lucide-react';

interface Provider {
  id: number;
  name: string;
  contact: string;
  email: string;
  website: string;
  services: string[];
  status: 'Actif' | 'Inactif';
  contractEndDate: string;
}

interface ProvidersProps {
  darkMode: boolean;
}

export default function Providers({ darkMode }: ProvidersProps) {
  const [providers, setProviders] = useState<Provider[]>([
    {
      id: 1,
      name: 'TechSolutions SARL',
      contact: 'Jean Dupont - 06 12 34 56 78',
      email: 'contact@techsolutions.com',
      website: 'www.techsolutions.com',
      services: ['Maintenance', 'Fourniture matériel'],
      status: 'Actif',
      contractEndDate: '2025-12-31'
    },
    {
      id: 2,
      name: 'AV Services',
      contact: 'Marie Martin - 07 89 01 23 45',
      email: 'info@avservices.fr',
      website: 'www.avservices.fr',
      services: ['Audiovisuel', 'Installation'],
      status: 'Actif',
      contractEndDate: '2024-06-30'
    },
    {
      id: 3,
      name: 'IT Distribute',
      contact: 'Paul Bernard - 01 23 45 67 89',
      email: 'support@itdistribute.com',
      website: 'www.itdistribute.com',
      services: ['Fourniture matériel'],
      status: 'Inactif',
      contractEndDate: '2023-12-31'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Provider; direction: 'ascending' | 'descending' } | null>(null);

  const requestSort = (key: keyof Provider) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Provider) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-0" />;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getStatusBadgeClass = (status: Provider['status']) => {
    switch (status) {
      case 'Actif':
        return darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      case 'Inactif':
        return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'Maintenance':
        return <HardHat className="w-4 h-4 mr-1" />;
      case 'Fourniture matériel':
        return <Building className="w-4 h-4 mr-1" />;
      case 'Audiovisuel':
        return <Video className="w-4 h-4 mr-1" />;
      case 'Installation':
        return <Wrench className="w-4 h-4 mr-1" />;
      default:
        return <CheckCircle className="w-4 h-4 mr-1" />;
    }
  };

  const allServices = Array.from(new Set(providers.flatMap(p => p.services)));

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? provider.status === statusFilter : true;
    const matchesService = serviceFilter ? provider.services.includes(serviceFilter) : true;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  const sortedProviders = [...filteredProviders];
  if (sortConfig !== null) {
    sortedProviders.sort((a, b) => {
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
        <h1 className="text-xl font-bold md:text-2xl">Gestion des Prestataires</h1>
        <button 
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Prestataire
        </button>
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
                placeholder="Rechercher un prestataire..."
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
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
            <select
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="">Tous services</option>
              {allServices.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des prestataires */}
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
                    <span>Nom</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Services
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
                  onClick={() => requestSort('contractEndDate')}
                >
                  <div className="flex items-center">
                    <span>Fin de contrat</span>
                    {getSortIcon('contractEndDate')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {sortedProviders.map(provider => (
                <tr key={provider.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {provider.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Phone className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {provider.contact}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {provider.email}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Globe className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {provider.website}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {provider.services.map(service => (
                        <span 
                          key={service} 
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {getServiceIcon(service)}
                          {service}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(provider.status)}`}>
                      {provider.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {provider.contractEndDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      <button 
                        className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        className={darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
                <span className="font-medium">{sortedProviders.length}</span> sur{' '}
                <span className="font-medium">{providers.length}</span> résultats
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