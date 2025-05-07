import React, { useState, useEffect } from 'react';
import { X, CalendarIcon, Info } from 'lucide-react';
import { formatISO } from 'date-fns';
import { createCheckout, CheckoutData } from '../../api/checkoutService';
import { fetchAvailableEquipment, Equipment } from '../../api/equipmentService';
import { fetchActiveUsers, User } from '../../api/userService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

interface NewCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  darkMode: boolean;
}

export default function NewCheckoutModal({ isOpen, onClose, onSuccess, darkMode }: NewCheckoutModalProps) {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<CheckoutData>({
    equipment_id: '',
    user_id: '',
    checkout_date: formatISO(new Date(), { representation: 'date' }),
    expected_return_date: '',
    purpose: '',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [equipmentData, userData] = await Promise.all([
          fetchAvailableEquipment(),
          fetchActiveUsers()
        ]);
        setEquipment(equipmentData);
        setUsers(userData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEquipmentSearch = async () => {
    try {
      setLoading(true);
      const data = await fetchAvailableEquipment(searchTerm);
      setEquipment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async () => {
    try {
      setLoading(true);
      const data = await fetchActiveUsers(userSearchTerm);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    // Validation
    if (!formData.equipment_id || !formData.user_id || !formData.checkout_date || !formData.expected_return_date || !formData.purpose) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
  
    if (new Date(formData.expected_return_date) <= new Date(formData.checkout_date)) {
      setError('La date de retour doit être postérieure à la date de sortie');
      return;
    }
  
    try {
      setLoading(true);
      await createCheckout({
        equipment_id: Number(formData.equipment_id),
        user_id: Number(formData.user_id),
        checkout_date: formData.checkout_date,
        expected_return_date: formData.expected_return_date,
        purpose: formData.purpose,
        notes: formData.notes || undefined
      });
      onSuccess();
      onClose();
      toast.success('Sortie enregistrée avec succès');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'enregistrement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative w-full max-w-2xl p-6 mx-auto rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Nouvelle Sortie d'Équipement</h2>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className={`p-3 mb-4 rounded-md ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
            <div className="flex items-center">
              <Info className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
            {/* Équipement */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Équipement *
              </label>
              <div className="flex gap-2">
                <select
                  name="equipment_id"
                  value={formData.equipment_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 ${darkMode 
                    ? 'focus:ring-blue-500' 
                    : 'focus:ring-blue-300'}`}
                  disabled={loading}
                  required
                >
                  <option value="">Sélectionnez un équipement</option>
                  {equipment.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} {item.serial_number ? `(${item.serial_number})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center mt-2 gap-2">
                <input 
                  type="text" 
                  placeholder="Rechercher un équipement..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 px-3 py-1 text-sm border rounded-md ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'}`}
                />
                <button 
                  type="button" 
                  onClick={handleEquipmentSearch}
                  className={`px-3 py-1 text-sm rounded-md ${darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Rechercher
                </button>
              </div>
            </div>

            {/* Utilisateur */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Emprunteur *
              </label>
              <div className="flex gap-2">
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 ${darkMode 
                    ? 'focus:ring-blue-500' 
                    : 'focus:ring-blue-300'}`}
                  disabled={loading}
                  required
                >
                  <option value="">Sélectionnez un utilisateur</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center mt-2 gap-2">
                <input 
                  type="text" 
                  placeholder="Rechercher un utilisateur..." 
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className={`flex-1 px-3 py-1 text-sm border rounded-md ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'}`}
                />
                <button 
                  type="button" 
                  onClick={handleUserSearch}
                  className={`px-3 py-1 text-sm rounded-md ${darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Rechercher
                </button>
              </div>
            </div>

            {/* Date de sortie */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Date de sortie *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="checkout_date"
                  value={formData.checkout_date}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 ${darkMode 
                    ? 'focus:ring-blue-500' 
                    : 'focus:ring-blue-300'}`}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Date de retour prévue */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Date de retour prévue *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="expected_return_date"
                  value={formData.expected_return_date}
                  onChange={handleInputChange}
                  min={formData.checkout_date}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 ${darkMode 
                    ? 'focus:ring-blue-500' 
                    : 'focus:ring-blue-300'}`}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          {/* Motif */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">
              Motif / Destination *
            </label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Exemple: Formation Excel - Site Client"
              className={`w-full px-3 py-2 border rounded-md ${darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 ${darkMode 
                ? 'focus:ring-blue-500' 
                : 'focus:ring-blue-300'}`}
              disabled={loading}
              required
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium">
              Notes (facultatif)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Informations complémentaires..."
              className={`w-full px-3 py-2 border rounded-md ${darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 ${darkMode 
                ? 'focus:ring-blue-500' 
                : 'focus:ring-blue-300'}`}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md ${
                loading 
                  ? `${darkMode ? 'bg-blue-800' : 'bg-blue-400'} cursor-not-allowed` 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}