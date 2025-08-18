import { useState } from 'react';
import { Plus, CircleAlert, Settings, House, Clock, CircleCheckBig, MoveRight, X } from 'lucide-react';

interface DashboardProps {
  darkMode: boolean;
}

export default function Dashboard({ darkMode }: DashboardProps) {
  const [quickAccessOpen, setQuickAccessOpen] = useState(false);

  const statsCards = [
    {
      title: 'Total Equipements',
      value: '248',
      icon: Settings,
      color: 'bg-blue-500',
      iconBg: 'bg-blue-600'
    },
    {
      title: 'Salles Équipées',
      value: '248',
      icon: House,
      color: 'bg-green-500',
      iconBg: 'bg-green-500'
    },
    {
      title: 'Pannes Signalées',
      value: '248',
      icon: CircleAlert,
      color: 'bg-red-500',
      iconBg: 'bg-red-500'
    },
    {
      title: 'Acquisition en Attente',
      value: '248',
      icon: Clock,
      color: 'bg-amber-500',
      iconBg: 'bg-amber-500'
    },
  ];

  const quickActions = [
    { icon: Plus, text: 'Ajouter un équipement', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: CircleAlert, text: 'Signaler une panne', color: 'bg-red-500 hover:bg-red-600' },
    { icon: House, text: 'Gérer les salles', color: 'bg-green-500 hover:bg-green-600' },
    { icon: Clock, text: 'Demande d\'acquisition', color: 'bg-amber-500 hover:bg-amber-600' },
  ];

  const equipmentStatus = [
    { status: 'Disponible', count: 186, color: 'bg-green-500', percentage: 50 },
    { status: 'Occupée', count: 186, color: 'bg-blue-500', percentage: 30 },
    { status: 'En maintenance', count: 186, color: 'bg-amber-500', percentage: 10 },
    { status: 'Hors service', count: 186, color: 'bg-red-500', percentage: 10 },
  ];

  const recentEquipment = [
    { name: 'Projecteur Dell XPS 15', category: 'Audiovisuel', location: 'Aucun', status: 'Fonctionnel', lastMaintenance: 'Aucune' },
    { name: 'Ecran', category: 'Informatique', location: 'Salle 102', status: 'En panne', lastMaintenance: '2024-01-10' },
    { name: 'Filtre à eau', category: 'Cuisine', location: 'Salle 103', status: 'En maintenance', lastMaintenance: '2024-05-12' },
    { name: 'Tableau', category: 'Catégorie', location: 'Salle 200', status: 'Fonctionnel', lastMaintenance: 'Aucune' },
    { name: 'Box WIFI', category: 'Internet', location: 'Salle 200', status: 'En maintenance', lastMaintenance: '2024-06-26' },
    { name: 'Projecteur Epson EB-L200F', category: 'Audiovisuel', location: 'Salle 202', status: 'Fonctionnel', lastMaintenance: 'Aucune' },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Fonctionnel':
        return darkMode ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-800';
      case 'En panne':
        return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'En maintenance':
        return darkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-100 text-amber-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  // Overlay pour le modal d'accès rapide sur mobile
  const QuickAccessModal = () => (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center opacity-50 transition-opacity ${
        quickAccessOpen ? 'opacity-100' : 'hidden opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`mx-4 max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-lg p-4 shadow-xl transition-transform ${
          quickAccessOpen ? 'scale-100' : 'scale-95'
        } ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Accès rapides
          </h3>
          <button
            onClick={() => setQuickAccessOpen(false)}
            className={`rounded-full p-2 cursor-pointer ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-label="Fermer les accès rapides"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col space-y-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`flex items-center space-x-3 rounded-md px-4 py-3 text-white cursor-pointer ${action.color}`}
            >
              <action.icon className="h-5 w-5" />
              <span>{action.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className="flex flex-row items-center justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
            <h1 className="text-xl font-bold md:text-2xl">Tableau de bord</h1>

            {/* Bouton d'accès rapide sur mobile */}
            <div className="sm:hidden">
              <button
                  onClick={() => setQuickAccessOpen(true)}
                  className={`flex items-center space-x-2 rounded-md px-4 py-2 text-white cursor-pointer ${
                  darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                  <Plus className="h-4 w-4" />
                  <span>Accès rapide</span>
              </button>
            </div>

            {/* Liens d'accès rapide sur desktop */}
            <div className="hidden flex-wrap gap-2 sm:flex sm:flex-nowrap sm:space-x-3">
                {quickActions.map((action, index) => (
                    <button key={index} className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-white cursor-pointer ${action.color} md:px-4 md:text-base`}>
                      <action.icon className="h-6 w-6" />
                      <span>{action.text}</span>
                    </button>
                ))}
            </div>
        </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <div
            key={card.title}
            className={`rounded-lg p-4 shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{card.title}</p>
                <p className="mt-1 text-2xl font-bold md:text-3xl">{card.value}</p>
              </div>
              <div className={`rounded-full ${card.iconBg} p-3 text-white`}>
                <card.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* État des équipements et Activité récente sur la même ligne */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* État des équipements */}
        <div className={`space-y-4 rounded-lg p-4 shadow-md md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold md:text-lg">État des équipements</h2>
            <a
              href="/equipements"
              className={`text-xs md:text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:underline'}`}
            >
              Voir tous les équipements
            </a>
          </div>

          <div className="flex h-5 w-full overflow-hidden rounded-full md:h-10">
            {equipmentStatus.map((status) => (
              <div
                key={status.status}
                className={`flex-grow ${status.color}`}
                style={{ width: `${status.percentage}%` }}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-4">
            {equipmentStatus.map((status) => (
              <div key={status.status} className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${status.color}`} />
                <div>
                  <p className="text-xs font-medium md:text-sm">{status.status} ({status.count})</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className={`space-y-4 rounded-lg p-4 shadow-md md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold md:text-lg">Activité récente</h2>
            <a
              href="/historique"
              className={`text-xs md:text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:underline'}`}
            >
              Voir tous l'historique
            </a>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col text-green-600">
                <div className="flex items-center flex-row">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                        <CircleCheckBig className="h-3 w-3" />
                    </div>
                    <p className={`ml-2 text-xs md:text-sm ${darkMode ? 'text-green-400' : ''}`}>Vidéoprojecteur reparer en salle A 101</p>
                </div>
              <p className={`mt-1 text-xs mx-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>il y a 2 heures</p>
            </div>

            <div className="flex flex-col text-blue-600">
                <div className="flex flex-row items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                        <MoveRight className="h-3 w-3" />
                    </div>
                    <p className={`ml-2 text-xs md:text-sm ${darkMode ? 'text-blue-400' : ''}`}>3 micros occupée par monsieur Boris en salle A 101</p>     
                </div>
                <p className={`mt-1 text-xs mx-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>il y a 2 heures</p>
            </div>

            <div className="flex flex-col text-red-600">
                <div className="flex flex-row items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${darkMode ? 'bg-red-900' : 'bg-red-100'}`}>
                        <CircleAlert className="h-3 w-3" />
                    </div>
                    <p className={`ml-2 text-xs md:text-sm ${darkMode ? 'text-red-400' : ''}`}>Nouvelle panne signalée vidéoprojecteur en salle A 101 par monsieur Boris</p>        
                </div>
                <p className={`mt-1 text-xs mx-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>il y a 2 jours</p>
            </div>

            <div className="flex flex-col text-green-600">
                <div className="flex flex-row items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                        <Plus className="h-3 w-3" />
                    </div>
                    <p className={`ml-2 text-xs md:text-sm ${darkMode ? 'text-green-400' : ''}`}>Nouveau matériel ajouter - Ecran moniteur</p>     
                </div>
                <p className={`mt-1 text-xs mx-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>il y a 2 heures</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu des équipements récents */}
      <div className={`space-y-4 overflow-x-auto rounded-lg p-4 shadow-md md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold md:text-lg">Aperçu des équipements récents</h2>
          <a
            href="/equipements/recents"
            className={`text-xs md:text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:underline'}`}
          >
            Voir plus
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wider md:px-6 md:py-3 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Nom
                </th>
                <th className={`whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wider md:px-6 md:py-3 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Catégorie
                </th>
                <th className={`whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wider md:px-6 md:py-3 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Emplacement
                </th>
                <th className={`whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wider md:px-6 md:py-3 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  État
                </th>
                <th className={`whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wider md:px-6 md:py-3 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Dernière Maintenance
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {recentEquipment.map((item, index) => (
                <tr key={`${item.name}-${index}`} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className={`whitespace-nowrap px-3 py-2 text-xs font-medium md:px-6 md:py-4 md:text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </td>
                  <td className={`whitespace-nowrap px-3 py-2 text-xs md:px-6 md:py-4 md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {item.category}
                  </td>
                  <td className={`whitespace-nowrap px-3 py-2 text-xs md:px-6 md:py-4 md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {item.location}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs md:px-6 md:py-4 md:text-sm">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap px-3 py-2 text-xs md:px-6 md:py-4 md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {item.lastMaintenance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal pour accès rapide mobile */}
      <QuickAccessModal />
    </div>
  );
}
