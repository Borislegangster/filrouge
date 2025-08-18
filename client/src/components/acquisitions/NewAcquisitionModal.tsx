import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

interface NewAcquisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  darkMode: boolean;
}

export default function NewAcquisitionModal({ isOpen, onClose, onSubmit, darkMode }: NewAcquisitionModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    provider_id: '',
    amount: '',
    urgency: 'Normale',
    request_date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        status: 'En attente'
      };

      await onSubmit(dataToSend);
      onClose();
    } catch (error) {
      console.error('Error submitting acquisition:', error);
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
              Nouvelle demande d'acquisition
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
                  {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}