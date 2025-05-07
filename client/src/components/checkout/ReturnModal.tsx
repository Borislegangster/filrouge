import React, { useState } from 'react';
import { X, Info, CalendarIcon, Package, User, ArrowLeftRight } from 'lucide-react';
import { returnEquipment, Checkout } from '../../api/checkoutService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  checkout: Checkout | null;
  darkMode: boolean;
}

export default function ReturnModal({ isOpen, onClose, onSuccess, checkout, darkMode }: ReturnModalProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkout) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await returnEquipment(checkout.id, notes);
      onSuccess();
      onClose();
      setNotes('');
      toast.success('Retour enregistré avec succès');
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Une erreur est survenue lors de l\'enregistrement du retour');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !checkout) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative w-full max-w-md p-6 mx-auto rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Enregistrer un Retour</h2>
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

        <div className={`p-4 mb-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center mb-2">
            <Package className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className="font-medium">{checkout.equipment.name}</span>
          </div>
          <div className="flex items-center mb-2">
            <User className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span>Emprunté par: {checkout.user.name}</span>
          </div>
          <div className="flex items-center">
            <ArrowLeftRight className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span>Motif: {checkout.purpose}</span>
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-600">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Sortie</div>
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {formatDate(checkout.checkout_date)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Retour prévu</div>
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {formatDate(checkout.expected_return_date)}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleReturn}>
          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium">
              Notes de retour (facultatif)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="État de l'équipement, observations..."
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
              className={`px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Confirmer le retour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}