import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Phone,
  Mail,
  Building,
  HardHat,
  CheckCircle,
  Video,
  Wrench,
  Loader2,
  X,
  Check
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import api from '../api/api';

interface Provider {
  id: number;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  services: string[];
  is_active: boolean;
  contract_end_date: string;
  status: string;
}

interface ProvidersProps {
  darkMode: boolean;
}

const providerSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  contact_name: z.string().min(1, 'Le contact est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(1, 'Le téléphone est requis'),
  address: z.string().min(1, 'L\'adresse est requise'),
  description: z.string().optional(),
  services: z.array(z.string()).nonempty('Au moins un service est requis'),
  contract_end_date: z.string().min(1, 'La date de fin de contrat est requise'),
  is_active: z.boolean()
});

type ProviderFormValues = z.infer<typeof providerSchema>;

const serviceOptions = [
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Fourniture_matériel', label: 'Fourniture_matériel' },
  { value: 'Audiovisuel', label: 'Audiovisuel' },
  { value: 'Installation', label: 'Installation' },
  { value: 'Réparation', label: 'Réparation' },
];

export default function Providers({ darkMode }: ProvidersProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      is_active: true,
      services: []
    }
  });

  const selectedServices = watch('services');

  // Fetch providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/api/providers');
        setProviders(response.data.data);
      } catch (err) {
        console.error('Failed to fetch providers:', err);
        setError('Erreur lors du chargement des prestataires');
        toast.error('Impossible de charger les prestataires');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Form submission handler
  const onSubmit = async (data: ProviderFormValues) => {
    try {
      if (currentProvider) {
        // Update existing provider
        await api.put(`/api/providers/${currentProvider.id}`, data);
        toast.success('Prestataire mis à jour avec succès');
      } else {
        // Create new provider
        await api.post('/api/providers', data);
        toast.success('Prestataire créé avec succès');
      }
      
      // Refresh providers list
      const response = await api.get('/api/providers');
      setProviders(response.data.data);
      closeModal();
    } catch (err) {
      console.error('Error saving provider:', err);
      toast.error('Une erreur est survenue lors de la sauvegarde');
    }
  };

  // Delete provider handler
  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce prestataire ?')) return;
    
    setIsDeleting(true);
    setDeleteId(id);
    try {
      await api.delete(`/api/providers/${id}`);
      setProviders(providers.filter(provider => provider.id !== id));
      toast.success('Prestataire supprimé avec succès');
    } catch (err) {
      console.error('Error deleting provider:', err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Modal handlers
  const openModal = (provider: Provider | null = null) => {
    setCurrentProvider(provider);
    if (provider) {
      setValue('name', provider.name);
      setValue('contact_name', provider.contact_name);
      setValue('email', provider.email);
      setValue('phone', provider.phone);
      setValue('address', provider.address);
      setValue('description', provider.description || '');
      setValue('services', provider.services);
      setValue('contract_end_date', provider.contract_end_date);
      setValue('is_active', provider.is_active);
    } else {
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProvider(null);
    reset();
  };

  // Toggle service selection
  const toggleService = (service: string) => {
    const newServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    setValue('services', newServices);
  };

  // Filter and sort logic
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Provider; direction: 'ascending' | 'descending' } | null>(null);

  const requestSort = (key: keyof Provider) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Provider) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-0" />;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getStatusBadgeClass = (status: string) => {
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

  // Filter providers
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? provider.status === statusFilter : true;
    const matchesService = serviceFilter ? provider.services.includes(serviceFilter) : true;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  // Sort providers
  const sortedProviders = [...filteredProviders];
  if (sortConfig) {
    sortedProviders.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  // Get all unique services for filter dropdown
  const allServices = Array.from(new Set(providers.flatMap(p => p.services))) as string[];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
        <h2 className="font-bold">Erreur de chargement</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className={`mt-2 px-4 py-2 rounded ${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-200 hover:bg-red-300'}`}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold md:text-2xl">Gestion des Prestataires</h1>
        <button 
          onClick={() => openModal()}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Prestataire
        </button>
      </div>

      {/* Filters and Search */}
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

      {/* Providers Table */}
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
                  onClick={() => requestSort('contract_end_date')}
                >
                  <div className="flex items-center">
                    <span>Fin de contrat</span>
                    {getSortIcon('contract_end_date')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {sortedProviders.length > 0 ? (
                sortedProviders.map(provider => (
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
                            {provider.phone}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Mail className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {provider.email}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {provider.contact_name}
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
                      {new Date(provider.contract_end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-4">
                        <button 
                          onClick={() => openModal(provider)}
                          className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(provider.id)}
                          className={darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}
                          title="Supprimer"
                          disabled={isDeleting && deleteId === provider.id}
                        >
                          {isDeleting && deleteId === provider.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Aucun prestataire trouvé
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Provider Modal */}
      {isModalOpen && (
        <div className={`fixed inset-0 z-50 overflow-y-auto ${darkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'}`}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium">
                    {currentProvider ? 'Modifier Prestataire' : 'Ajouter un Prestataire'}
                  </h3>
                  <button
                    type="button"
                    className={`rounded-md p-1.5 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'}`}
                    onClick={closeModal}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nom du prestataire *
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`mt-1 block w-full rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Personne à contacter *
                    </label>
                    <input
                      type="text"
                      {...register('contact_name')}
                      className={`mt-1 block w-full rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                    />
                    {errors.contact_name && <p className="mt-1 text-sm text-red-600">{errors.contact_name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email *
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        className={`mt-1 block w-full rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Téléphone *
                      </label>
                      <input
                        type="text"
                        {...register('phone')}
                        className={`mt-1 block w-full rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Adresse *
                    </label>
                    <input
                      type="text"
                      {...register('address')}
                      className={`mt-1 block w-full rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className={`mt-1 block w-full rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Services proposés *
                    </label>
                    <div className="mt-2 space-y-2">
                      {serviceOptions.map((service) => (
                        <div key={service.value} className="flex items-center">
                          <button
                            type="button"
                            onClick={() => toggleService(service.value)}
                            className={`flex items-center justify-center w-5 h-5 rounded border ${selectedServices.includes(service.value) ? 'bg-blue-600 border-blue-600' : darkMode ? 'border-gray-500' : 'border-gray-300'}`}
                          >
                            {selectedServices.includes(service.value) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                          <span className="ml-2 text-sm">{service.label}</span>
                        </div>
                      ))}
                    </div>
                    {errors.services && <p className="mt-1 text-sm text-red-600">{errors.services.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Date de fin de contrat *
                      </label>
                      <input
                        type="date"
                        {...register('contract_end_date')}
                        className={`mt-1 block w-full rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                      />
                      {errors.contract_end_date && <p className="mt-1 text-sm text-red-600">{errors.contract_end_date.message}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Statut
                      </label>
                      <div className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            {...register('is_active')}
                            className={`rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} text-blue-600 shadow-sm focus:ring-blue-500`}
                          />
                          <span className="ml-2 text-sm">Actif</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:col-start-2 sm:text-sm ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      ) : currentProvider ? (
                        'Mettre à jour'
                      ) : (
                        'Ajouter'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className={`mt-3 w-full inline-flex justify-center rounded-md border ${darkMode ? 'border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 sm:mt-0 sm:col-start-1 sm:text-sm' : 'border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:col-start-1 sm:text-sm'}`}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}