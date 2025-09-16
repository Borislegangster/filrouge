import { useState } from 'react';
import { 
  Bell, 
  Check, 
  X, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// interface Notification {
//   id: number;
//   title: string;
//   description: string;
//   time: string;
//   type: 'request' | 'issue' | 'success' | 'warning';
//   read: boolean;
//   category?: 'equipment' | 'acquisition' | 'maintenance' | 'reservation';
// }

// interface NotificationsProps {
//   darkMode: boolean;
// }

export default function Notifications({ darkMode }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nouvelle demande de projecteur',
      description: 'Salle 102 - Formation Excel Avancé',
      time: 'Il y a 10 minutes',
      type: 'request',
      read: false,
      category: 'reservation'
    },
    {
      id: 2,
      title: 'Panne signalée: PC Salle 103',
      description: "Écran qui ne s'allume pas",
      time: 'Il y a 45 minutes',
      type: 'issue',
      read: false,
      category: 'maintenance'
    },
    {
      id: 3,
      title: 'Acquisition validée',
      description: '10 nouveaux ordinateurs portables',
      time: 'Il y a 2 heures',
      type: 'success',
      read: true,
      category: 'acquisition'
    },
    {
      id: 4,
      title: 'Retour de matériel en retard',
      description: 'Projecteur - Formation externe',
      time: 'Il y a 1 jour',
      type: 'warning',
      read: true,
      category: 'equipment'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState(null);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-0" />;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'request':
        return <Bell className="w-5 h-5" />;
      case 'issue':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <Clock className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'request':
        return darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'issue':
        return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'success':
        return darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      case 'warning':
        return darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'request':
        return 'border-blue-500';
      case 'issue':
        return 'border-red-500';
      case 'success':
        return 'border-green-500';
      case 'warning':
        return 'border-yellow-500';
      default:
        return 'border-gray-500';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.category === filter;
  });

  const sortedNotifications = [...filteredNotifications];
  if (sortConfig !== null) {
    sortedNotifications.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold md:text-2xl">Centre de Notifications</h1>
        <div className="flex items-center gap-4">
          <select
            className={`px-3 py-1 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="equipment">Équipements</option>
            <option value="acquisition">Acquisitions</option>
            <option value="maintenance">Maintenance</option>
            <option value="reservation">Réservations</option>
          </select>
          <button 
            onClick={markAllAsRead}
            className={`text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
          >
            Marquer tout comme lu
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedNotifications.length === 0 ? (
          <div className={`p-8 text-center rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aucune notification</p>
          </div>
        ) : (
          sortedNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`rounded-lg shadow-md p-4 border-l-4 ${getBorderColor(notification.type)} ${darkMode ? 'bg-gray-800' : 'bg-white'} ${!notification.read ? darkMode ? 'bg-blue-900/20' : 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`rounded-full p-2 ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h3>
                      <span className={`text-xs ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {notification.time}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {notification.description}
                    </p>
                    {notification.category && (
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {notification.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      title="Marquer comme lu"
                    >
                      <Check className="w-5 h-5 text-green-500" />
                    </button>
                  )}
                  <button 
                    onClick={() => removeNotification(notification.id)}
                    className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    title="Supprimer"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}