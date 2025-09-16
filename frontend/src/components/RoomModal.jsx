import { useEffect, useState } from 'react';
import api from '../apis';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

// interface RoomModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: () => void;
//   room: Room | null;
//   darkMode: boolean;
// }

// interface Room {
//   id?: number;
//   name: string;
//   building?: string;
//   floor?: string;
//   description?: string;
//   capacity?: number;
//   is_active: boolean;
// }

export default function RoomModal({ isOpen, onClose, onSave, room, darkMode }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: '',
    description: '',
    capacity: undefined,
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        building: room.building || '',
        floor: room.floor || '',
        description: room.description || '',
        capacity: room.capacity || undefined,
        is_active: room.is_active
      });
    } else {
      setFormData({
        name: '',
        building: '',
        floor: '',
        description: '',
        capacity: undefined,
        is_active: true
      });
    }
    setErrors({});
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || undefined : value
    }));
  };

  const handleToggle = (checked) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (room) {
        await api.put(`/api/rooms/${room.id}`, formData);
      } else {
        await api.post('/api/rooms', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error('Error saving room:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${darkMode ? 'bg-black/60' : 'bg-gray-800/40'}`}>
      <div className="absolute inset-0 bg-gray-500 opacity-75"
        // onClick={onClose}
      ></div>
      <div className="bg-white dark:bg-gray-800/95 rounded-lg shadow-lg p-6 w-3xl min-w-sm relative">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold mb-4">
            {room ? 'Modifier la salle' : 'Ajouter une nouvelle salle'}
          </h3>
          <button type="button" className={`rounded-md p-1 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'}`}
            onClick={onClose}
          > <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Nom de la salle */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Nom de la salle"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Bâtiment et étage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="building"
                placeholder="Bâtiment"
                value={formData.building}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded ${
                  errors.building ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.building && <p className="text-sm text-red-500">{errors.building}</p>}
            </div>
            <div>
              <input
                type="text"
                name="floor"
                placeholder="Étage"
                value={formData.floor}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded ${
                  errors.floor ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.floor && <p className="text-sm text-red-500">{errors.floor}</p>}
            </div>
          </div>

          {/* Capacité */}
          <div>
            <input
              type="number"
              name="capacity"
              placeholder="Capacité"
              value={formData.capacity || ''}
              onChange={handleChange}
              min={1}
              className={`w-full px-3 py-2 border rounded ${
                errors.capacity ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
          </div>

          {/* Description */}
          <div>
            <textarea
              name="description"
              placeholder="Description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Statut:</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.is_active}
                onChange={(e) => handleToggle(e.target.checked)}
                disabled={!(user?.role === 'Administrateur' || user?.role === 'Gestionnaire')}
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-full"></div>
            </label>
            <span className="ml-2 text-sm">{formData.is_active ? 'Active' : 'Inactive'}</span>
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
