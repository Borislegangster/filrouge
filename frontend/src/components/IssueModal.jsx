import { useState, useEffect } from 'react';
import axios from '../apis';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

// interface Equipment {
//   id: number;
//   name: string;
// }

// interface IssueModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: () => void;
//   issue: any;
//   darkMode: boolean;
// }

export default function IssueModal({ isOpen, onClose, onSave, issue, darkMode }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [priority, setPriority] = useState('Moyenne');
  const [equipments, setEquipments] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchEquipments();
      fetchPriorities().then(() => {
        // Initialiser la priorité seulement après le chargement
        if (issue) {
          setPriority(issue.priority);
        }
      });
      
      if (issue) {
        setTitle(issue.title);
        setDescription(issue.description);
        setEquipmentId(issue.equipment.id);
        // setPriority sera géré après le chargement
      } else {
        resetForm();
      }
    }
  }, [isOpen, issue]);

  const fetchEquipments = async () => {
    try {
      const response = await axios.get('/api/equipment');
      setEquipments(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des équipements:', err);
    }
  };

  const fetchPriorities = async () => {
    try {
      const response = await axios.get('/api/issues/priorities');
      setPriorities(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des priorités:', err);
      setPriorities(['Basse', 'Moyenne', 'Haute', 'Critique']);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEquipmentId('');
    setPriority('Moyenne');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = {
        title,
        description,
        equipment_id: equipmentId,
        priority
      };

      if (issue) {
        await axios.put(`/api/issues/${issue.id}`, data);
      } else {
        await axios.post('/api/issues', data);
      }

      onSave();
      onClose();
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${darkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* <div className="relative inset-0 transition-opacity" onClick={onClose}> */}
          <div className={`absolute inset-0 bg-gray-500 opacity-75`} onClick={onClose}>

          </div>
        {/* </div> */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${darkMode ? 'bg-gray-100' : 'bg-white'} relative`}>
          <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-start">
              <h3 className={`text-xl leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {issue ? 'Modifier le signalement' : 'Signaler une panne'}
              </h3>
              <button type="button" className={`rounded-md p-1 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'}`}
                onClick={onClose}
              > <X className="h-6 w-6" />
              </button>
            </div>
            {error && (
              <div className={`mt-2 p-2 rounded ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="title" className={`block text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Titre
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`mt-1 p-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              <div>
                <label htmlFor="description" className={`block text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`mt-1 p-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              <div>
                <label htmlFor="equipment" className={`block text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Équipement
                </label>
                <select
                  id="equipment"
                  required
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  className={`mt-1 p-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  <option value="">Sélectionnez un équipement</option>
                  {equipments.map((equipment) => (
                    <option key={equipment.id} value={equipment.id}>
                      {equipment.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="priority" className={`block text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Priorité
                </label>
                <select
                  id="priority"
                  required
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={`mt-1 p-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}