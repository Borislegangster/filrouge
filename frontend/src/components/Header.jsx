import { Search, Moon, Sun, Bell, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';

export default function Header({ openSidebar, darkMode, toggleDarkMode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className={`flex h-16 items-center justify-between px-4 md:px-6 ${darkMode ? 'bg-gray-800' : 'bg-blue-600'}`}>
      <div className="flex items-center">
        {/* Menu burger pour mobiles - Tablettes*/}
        <button
          className={`mr-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-700 hover:bg-blue-800'} lg:hidden`}
          onClick={openSidebar}
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-8 w-8" strokeWidth={3} />
        </button>

        <div className="text-[18px] font-bold text-white md:text-2xl">
          Gestionnaire d'équipement
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Search bar */}
        <div className="relative hidden sm:block">
            <input
                type="text"
                placeholder="Rechercher un materiel..."
                className={`w-50 rounded-lg border-none py-2 text-sm focus:outline-none focus:ring-2 pr-10 md:w-90 pl-1 ${
                darkMode
                    ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500'
                    : 'bg-white text-gray-800 focus:ring-blue-300'
                }`}
             />
                  
            <button className={`absolute right-0 top-1/2 -translate-y-1/2 flex h-9 w-8 md:w-9 items-center justify-center rounded-r-lg text-white transition ${ darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-700 hover:bg-blue-800' }`}>
                <Search className="h-3 w-3 text-white md:left-3 md:h-5 md:w-5" strokeWidth={3} />
            </button>
        </div>

        {/* Dark mode toggle */}
        <button
          className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-700 hover:bg-blue-800'
          }`}
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
        >
          {darkMode ? <Sun className="h-5 w-5" strokeWidth={3} /> : <Moon className="h-5 w-5" strokeWidth={3} />}
        </button>

        {/* Notifications */}
        <button
          className={`relative flex h-8 w-8 items-center justify-center rounded-full text-white transition ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-700 hover:bg-blue-800'
          }`}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" strokeWidth={3} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            3
          </span>
        </button>

        {/* User profile */}
        <button
          onClick={() => navigate('/profile')}
          className={`flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-300 cursor-pointer ${
            darkMode ? 'bg-gray-200 text-gray-800' : 'bg-white text-blue-600'
          }`}
          aria-label="Profil utilisateur"
        >
          <img
              src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random&color=fff&length=2&bold=true`}
              className="h-full w-full object-cover rounded-full"
              alt={`Avatar de ${user?.name}`}
            />
        </button>
      </div>
    </header>
  );
}