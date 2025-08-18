import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

interface EquipmentOption {
  id: number;
  name: string;
}

interface EditAcquisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  acquisition: any;
  darkMode: boolean;
  canEditEquipment: boolean;
}

interface EquipmentOption {
  id: number;
  name: string;
}

interface ProviderOption {
  id: number;
  name: string;
}


export default function EditAcquisitionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  acquisition, 
  darkMode,
  canEditEquipment
}: EditAcquisitionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    provider_id: '',
    amount: '',
    urgency: 'Normale',
    equipment: [] as Array<{ id: string, quantity: string }>,
    request_date: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentOption[]>([]);
  const [availableProviders, setAvailableProviders] = useState<ProviderOption[]>([]);

  useEffect(() => {
    if (isOpen && acquisition) {
      // Charger les équipements
      const fetchData = async () => {
        try {
          const [equipResponse, providersResponse] = await Promise.all([
            api.get('/api/equipment'),
            api.get('/api/providers')
          ]);
          setAvailableEquipment(equipResponse.data.data);
          setAvailableProviders(providersResponse.data.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
  }, [isOpen, acquisition]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && acquisition) {
      setFormData({
        title: acquisition.title,
        description: acquisition.description,
        provider_id: acquisition.provider_id || '',
        amount: acquisition.amount || '',
        urgency: acquisition.urgency,
        equipment: acquisition.equipment.map((e: any) => ({
          id: e.id.toString(),
          quantity: e.quantity.toString()
        })),
        request_date: acquisition.request_date.split('T')[0]
      });

      if (canEditEquipment) {
        const fetchEquipment = async () => {
          try {
            const response = await api.get('/api/equipment');
            setAvailableEquipment(response.data.data);
          } catch (error) {
            console.error('Error fetching equipment:', error);
          }
        };
        fetchEquipment();
      }
    }
  }, [isOpen, acquisition, canEditEquipment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEquipmentChange = (index: number, field: string, value: string) => {
    const newEquipment = [...formData.equipment];
    newEquipment[index] = {
      ...newEquipment[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      equipment: newEquipment
    }));
  };

  const addEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, { id: '', quantity: '1' }]
    }));
  };

  const removeEquipment = (index: number) => {
    const newEquipment = [...formData.equipment];
    newEquipment.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      equipment: newEquipment
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.request_date) newErrors.request_date = 'La date est requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
  
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        equipment: canEditEquipment 
          ? formData.equipment.map(item => ({
              id: parseInt(item.id),
              quantity: parseInt(item.quantity)
            })).filter(item => !isNaN(item.id))
          : undefined // Envoyer undefined plutôt qu'un tableau vide
      };
  
      await onSubmit(dataToSend);
      onClose();
    } catch (error) {
      console.error('Error updating acquisition:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${darkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className={`absolute inset-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`} onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`px-4 py-5 sm:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Modifier la demande d'acquisition
            </h3>
            <form onSubmit={handleSubmit} className="mt-5">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Titre *
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} sm:text-sm ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label htmlFor="urgency" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Urgence *
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} sm:text-sm`}
                  >
                    <option value="Haute">Haute</option>
                    <option value="Normale">Normale</option>
                    <option value="Basse">Basse</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} sm:text-sm`}
                  />
                </div>

                <div>
                  <label htmlFor="request_date" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date de demande *
                  </label>
                  <input
                    type="date"
                    name="request_date"
                    id="request_date"
                    value={formData.request_date}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} sm:text-sm ${errors.request_date ? 'border-red-500' : ''}`}
                  />
                  {errors.request_date && <p className="mt-2 text-sm text-red-600">{errors.request_date}</p>}
                </div>

                <div>
                  <label htmlFor="amount" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Montant estimé (XAF)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`mt-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} sm:text-sm`}
                  />
                </div>
              </div>

              {canEditEquipment && (
                <div className="mt-6">
                  <div className="flex justify-between items-center">
                    <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Équipements
                    </h4>
                    <button
                      type="button"
                      onClick={addEquipment}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none`}
                    >
                      Ajouter un équipement
                    </button>
                  </div>

                  {formData.equipment.map((item, index) => (
                    <div key={index} className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-12">
                      <div className="sm:col-span-6">
                        <select
                          value={item.id}
                          onChange={(e) => handleEquipmentChange(index, 'id', e.target.value)}
                          className={`block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} sm:text-sm`}
                        >
                          <option value="">Sélectionnez un équipement</option>
                          {availableEquipment.map(equip => (
                            <option key={equip.id} value={equip.id}>{equip.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleEquipmentChange(index, 'quantity', e.target.value)}
                          className={`block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} sm:text-sm`}
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <select
                          value={item.provider_id || ''}
                          onChange={(e) => handleEquipmentChange(index, 'provider_id', e.target.value)}
                          className={`block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} sm:text-sm`}
                        >
                          <option value="">Sélectionnez un fournisseur</option>
                          {availableProviders.map(provider => (
                            <option key={provider.id} value={provider.id}>{provider.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={() => removeEquipment(index)}
                          className={`inline-flex items-center justify-center w-full px-3 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none`}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'} border ${darkMode ? 'border-gray-500' : 'border-gray-300'}`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}