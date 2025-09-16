import { useState, useEffect } from 'react';
import { 
  HardDrive,
  Monitor,
  Video,
  Wifi,
  Server,
  X,
  Save
} from 'lucide-react';
import api from '../apis'; 

// interface EquipmentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: any) => void;
//   equipment: any;
//   types: string[];
//   statuses: string[];
//   darkMode: boolean;
// }

export default function EquipmentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  equipment, 
  types, 
  statuses,
  darkMode 
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: '',
    serial_number: '',
    description: '',
    purchase_date: '',
    last_maintenance: '',
    next_maintenance: '',
    room_id: '',
    provider_id: ''
  });

  const [rooms, setRooms] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [roomsResponse, providersResponse] = await Promise.all([
        api.get('/api/rooms'),
        api.get('/api/providers')
      ]);
      setRooms(roomsResponse.data.data || roomsResponse.data);
      setProviders(providersResponse.data.data || providersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        type: equipment.type || '',
        status: equipment.status || '',
        serial_number: equipment.serial_number || '',
        description: equipment.description || '',
        purchase_date: equipment.purchase_date || '',
        last_maintenance: equipment.last_maintenance || '',
        next_maintenance: equipment.next_maintenance || '',
        room_id: equipment.room_id || '',
        provider_id: equipment.provider_id || ''
      });
    } else {
      setFormData({
        name: '',
        type: '',
        status: '',
        serial_number: '',
        description: '',
        purchase_date: '',
        last_maintenance: '',
        next_maintenance: '',
        room_id: '',
        provider_id: ''
      });
    }
  }, [equipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTypeIcon = (type) => {
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

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${darkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div 
            className="absolute inset-0 bg-gray-500 opacity-75"
            // onClick={onClose}
          ></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`relative px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-start">
              <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {equipment ? 'Modifier un équipement' : 'Ajouter un nouvel équipement'}
              </h3>
              <button
                type="button"
                className={`rounded-md p-1 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'}`}
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nom de l'équipement
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Type
                </label>
                <div className="relative">
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                    required
                  >
                    <option value="">Sélectionnez un type</option>
                    {types.map(type => (
                      <option key={type} value={type}>
                        {/* <div className="flex items-center"> */}
                          {/* {getTypeIcon(type)} */}
                          {type}
                        {/* </div> */}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="status" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  État
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                  required
                >
                  <option value="">Sélectionnez un état</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="serial_number" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Numéro de série
                </label>
                <input
                  type="text"
                  id="serial_number"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                />
              </div>

              <div>
                <label htmlFor="description" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="purchase_date" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date d'achat
                  </label>
                  <input
                    type="date"
                    id="purchase_date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                  />
                </div>
                <div>
                  <label htmlFor="last_maintenance" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Dernière maintenance
                  </label>
                  <input
                    type="date"
                    id="last_maintenance"
                    name="last_maintenance"
                    value={formData.last_maintenance}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                  />
                </div>
                <div>
                  <label htmlFor="next_maintenance" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Prochaine maintenance
                  </label>
                  <input
                    type="date"
                    id="next_maintenance"
                    name="next_maintenance"
                    value={formData.next_maintenance}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="room_id" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Salle
                    </label>
                    {loadingData ? (
                        <div className={`px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                            Chargement...
                        </div>
                    ) : (
                        <select
                            id="room_id"
                            name="room_id"
                            value={formData.room_id}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                        >
                            <option value="">Sélectionnez une salle</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div>
                    <label htmlFor="provider_id" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Fournisseur
                    </label>
                    {loadingData ? (
                        <div className={`px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                            Chargement...
                        </div>
                    ) : (
                        <select
                            id="provider_id"
                            name="provider_id"
                            value={formData.provider_id}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                        >
                            <option value="">Sélectionnez un fournisseur</option>
                            {providers.map(provider => (
                                <option key={provider.id} value={provider.id}>{provider.name}</option>
                            ))}
                        </select>
                    )}
                </div>
              </div>

              <div className={`mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense ${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 py-3 sm:px-6`}>
                <button
                  type="submit"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm`}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {equipment ? 'Mettre à jour' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  className={`mt-3 w-full inline-flex justify-center rounded-md border ${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'} sm:mt-0 sm:col-start-1 sm:text-sm`}
                  onClick={onClose}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}