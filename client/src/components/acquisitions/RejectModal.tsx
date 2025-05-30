import { useState } from 'react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (id: number, reason: string) => void;
  acquisition: {
    id: number;
    title: string;
  };
  darkMode: boolean;
}

export default function RejectModal({ isOpen, onClose, onReject, acquisition, darkMode }: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(acquisition.id, reason);
      onClose();
    } catch (error) {
      console.error('Error rejecting acquisition:', error);
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
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`px-4 py-5 sm:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Rejeter la demande
            </h3>
            <div className="mt-2">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Vous êtes sur le point de rejeter la demande suivante : <strong>{acquisition.title}</strong>
              </p>
            </div>

            <div className="mt-4">
              <label htmlFor="reason" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Raison du rejet *
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} sm:text-sm`}
                required
              />
            </div>

            <div className="mt-5 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'} border ${darkMode ? 'border-gray-500' : 'border-gray-300'}`}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={loading || !reason.trim()}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi en cours...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}