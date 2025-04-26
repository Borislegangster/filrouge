import { useState, useEffect } from 'react';
import { Plus, FileText, Check, X, Eye, ChevronDown, ChevronUp, Search, Edit, Trash } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import NewAcquisitionModal from '../components/acquisitions/NewAcquisitionModal';
import AcquisitionDetailsModal from '../components/acquisitions/AcquisitionDetailsModal';
import ApproveModal from '../components/acquisitions/ApproveModal';
import RejectModal from '../components/acquisitions/RejectModal';
import EditAcquisitionModal from '../components/acquisitions/EditAcquisitionModal';

interface Equipment {
  id: number;
  name: string;
  quantity: number;
}

interface Provider {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface Acquisition {
  id: number;
  title: string;
  description: string;
  provider_id: number | null;
  provider?: Provider;
  amount: number | null;
  status: 'En attente' | 'Validée' | 'Rejetée' | 'Livrée';
  request_date: string;
  approval_date: string | null;
  delivery_date: string | null;
  requested_by: number;
  requester?: User;
  approved_by: number | null;
  approver?: User;
  urgency: 'Haute' | 'Normale' | 'Basse';
  equipment: Equipment[];
  created_at: string;
  updated_at: string;
}

interface AcquisitionsProps {
  darkMode: boolean;
}

export default function Acquisitions({ darkMode }: AcquisitionsProps) {
  const { user } = useAuth();
  const [acquisitions, setAcquisitions] = useState<Acquisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedAcquisition, setSelectedAcquisition] = useState<Acquisition | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    delivered: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    const fetchAcquisitions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/acquisitions', {
          params: {
            search: searchTerm,
            status: statusFilter === null ? undefined : statusFilter
          }
        });
        setAcquisitions(response.data.data);
        
        const pending = response.data.data.filter((a: Acquisition) => a.status === 'En attente').length;
        const approved = response.data.data.filter((a: Acquisition) => a.status === 'Validée').length;
        const rejected = response.data.data.filter((a: Acquisition) => a.status === 'Rejetée').length;
        const delivered = response.data.data.filter((a: Acquisition) => a.status === 'Livrée').length;
        const totalAmount = response.data.data
          .filter((a: Acquisition) => a.status === 'Validée')
          .reduce((sum: number, a: Acquisition) => sum + (a.amount || 0), 0);
        
        setStats({
          pending,
          approved,
          rejected,
          delivered,
          totalAmount
        });
      } catch (error) {
        console.error('Error fetching acquisitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcquisitions();
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

  const sortedAcquisitions = [...acquisitions];
  if (sortConfig !== null) {
    sortedAcquisitions.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Acquisition];
      const bValue = b[sortConfig.key as keyof Acquisition];
      
      if (aValue === null || bValue === null) return 0;

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const getStatusBadgeClass = (status: Acquisition['status']) => {
    switch (status) {
      case 'En attente': return darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'Validée': return darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      case 'Rejetée': return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'Livrée': return darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      default: return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyBadgeClass = (urgency: Acquisition['urgency']) => {
    switch (urgency) {
      case 'Haute': return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'Normale': return darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'Basse': return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
      default: return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (acquisitionId: number, amount: number) => {
    try {
      await api.put(`/api/acquisitions/${acquisitionId}`, {
        status: 'Validée',
        amount: amount,
        approved_by: user?.id
      });
      setIsApproveModalOpen(false);
      const response = await api.get('/api/acquisitions');
      setAcquisitions(response.data.data);
    } catch (error) {
      console.error('Error approving acquisition:', error);
    }
  };

  const handleReject = async (acquisitionId: number, reason: string) => {
    try {
      await api.put(`/api/acquisitions/${acquisitionId}`, {
        status: 'Rejetée',
        description: reason
      });
      setIsRejectModalOpen(false);
      const response = await api.get('/api/acquisitions');
      setAcquisitions(response.data.data);
    } catch (error) {
      console.error('Error rejecting acquisition:', error);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const response = await api.post('/api/acquisitions', {
        ...data,
        equipment: [] // Les formateurs ne peuvent pas ajouter d'équipements
      });
      setIsNewModalOpen(false);
      const updatedResponse = await api.get('/api/acquisitions');
      setAcquisitions(updatedResponse.data.data);
    } catch (error) {
      console.error('Error creating acquisition:', error);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await api.put(`/api/acquisitions/${selectedAcquisition?.id}`, data);
      setIsEditModalOpen(false);
      const response = await api.get('/api/acquisitions');
      setAcquisitions(response.data.data);
    } catch (error) {
      console.error('Error updating acquisition:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/acquisitions/${id}`);
      const response = await api.get('/api/acquisitions');
      setAcquisitions(response.data.data);
    } catch (error) {
      console.error('Error deleting acquisition:', error);
    }
  };

  const canEdit = (acquisition: Acquisition) => {
    if (user?.role === 'administrateur') return true;
    if (user?.role === 'gestionnaire' && acquisition.status === 'En attente') return true;
    return user?.id === acquisition.requested_by && acquisition.status === 'En attente';
  };

  const canDelete = (acquisition: Acquisition) => {
    if (user?.role === 'administrateur') return true;
    return user?.id === acquisition.requested_by && acquisition.status === 'En attente';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <NewAcquisitionModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreate}
        darkMode={darkMode}
      />

      {selectedAcquisition && (
        <>
          <AcquisitionDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            acquisition={selectedAcquisition}
            darkMode={darkMode}
          />

          <ApproveModal
            isOpen={isApproveModalOpen}
            onClose={() => setIsApproveModalOpen(false)}
            onApprove={handleApprove}
            acquisition={selectedAcquisition}
            darkMode={darkMode}
          />

          <RejectModal
            isOpen={isRejectModalOpen}
            onClose={() => setIsRejectModalOpen(false)}
            onReject={handleReject}
            acquisition={selectedAcquisition}
            darkMode={darkMode}
          />

          <EditAcquisitionModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleUpdate}
            acquisition={selectedAcquisition}
            darkMode={darkMode}
            canEditEquipment={user?.role === 'administrateur' || user?.role === 'gestionnaire'}
          />
        </>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold md:text-2xl">Gestion des Acquisitions</h1>
        <div className="flex gap-4">
          <button 
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            onClick={() => setIsNewModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Demande
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>
            Demandes en attente
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}>
            {stats.pending}
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-green-200' : 'text-green-600'}`}>
            Demandes approuvées
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-green-100' : 'text-green-700'}`}>
            {stats.approved}
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>
            Budget approuvé
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-purple-100' : 'text-purple-700'}`}>
            {stats.totalAmount.toLocaleString()}XAF
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-red-900' : 'bg-red-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-red-200' : 'text-red-600'}`}>
            Demandes rejetées
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-red-100' : 'text-red-700'}`}>
            {stats.rejected}
          </div>
        </div>
      </div>

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
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
            >
              <option value="">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Validée">Validée</option>
              <option value="Rejetée">Rejetée</option>
              <option value="Livrée">Livrée</option>
            </select>
          </div>
        </div>
      </div>

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
                    <span>Demande</span>
                    {getSortIcon('title')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('requester.name')}
                >
                  <div className="flex items-center">
                    <span>Demandeur</span>
                    {getSortIcon('requester.name')}
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
                  onClick={() => requestSort('urgency')}
                >
                  <div className="flex items-center">
                    <span>Urgence</span>
                    {getSortIcon('urgency')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('amount')}
                >
                  <div className="flex items-center">
                    <span>Montant</span>
                    {getSortIcon('amount')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {sortedAcquisitions.map(acquisition => (
                <tr key={acquisition.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {acquisition.title}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(acquisition.request_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {acquisition.requester?.name || 'Inconnu'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(acquisition.status)}`}>
                      {acquisition.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyBadgeClass(acquisition.urgency)}`}>
                      {acquisition.urgency}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {acquisition.amount ? `${acquisition.amount.toLocaleString()}XAF` : 'Non défini'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button 
                        className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}
                        title="Voir détails"
                        onClick={() => {
                          setSelectedAcquisition(acquisition);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {canEdit(acquisition) && (
                        <button
                          className={darkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-900'}
                          title="Modifier"
                          onClick={() => {
                            setSelectedAcquisition(acquisition);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}

                      {canDelete(acquisition) && (
                        <button
                          className={darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}
                          title="Supprimer"
                          onClick={() => {
                            if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
                              handleDelete(acquisition.id);
                            }
                          }}
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      )}
                      
                      {user?.role === 'administrateur' && acquisition.status === 'En attente' && (
                        <>
                          <button 
                            className={darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'}
                            title="Approuver"
                            onClick={() => {
                              setSelectedAcquisition(acquisition);
                              setIsApproveModalOpen(true);
                            }}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button 
                            className={darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}
                            title="Rejeter"
                            onClick={() => {
                              setSelectedAcquisition(acquisition);
                              setIsRejectModalOpen(true);
                            }}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}