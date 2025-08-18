import { 
  LayoutDashboard, 
  MonitorSmartphone, 
  ShoppingCart, 
  House, 
  Users, 
  TriangleAlert, 
  ArrowRightLeft, 
  Contact, 
  History,
  LogOut, 
  X 
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  closeSidebar: () => void;
  darkMode: boolean;
}

export default function Sidebar({ closeSidebar, darkMode }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: LayoutDashboard, text: 'Tableau de bord', path: '/dashboard' },
    { icon: MonitorSmartphone, text: 'Equipements', path: '/equipments' },
    { icon: House, text: 'Salles', path: '/rooms' },
    { icon: ShoppingCart, text: 'Acquisitions', path: '/acquisitions' },
    // Ces deux éléments sont affichés uniquement si l'utilisateur n'est pas un formateur
    ...(user?.role !== 'formateur'
      ? [
          { icon: Users, text: 'Utilisateurs', path: '/users' },
        ]
      : []),
    { icon: TriangleAlert, text: 'Pannes', path: '/issues' },
    { icon: ArrowRightLeft, text: 'Sorties / Retours', path: '/checkout-return' },
    ...(user?.role !== 'formateur'
      ? [
          { icon: Contact, text: 'Prestataires', path: '/providers' },
        ]
      : []),
    { icon: History, text: 'Historiques et Alertes', path: '/notifications' },
  ];

  return (
    <div className={`flex h-svh w-60 flex-col shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      {/* Mobile close button */}
      <button
        className={`absolute right-4 top-4 rounded-full p-1 lg:hidden ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}
        onClick={closeSidebar}
        aria-label="Fermer le menu"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Logo */}
      <div className="flex items-center justify-center py-2 mb-2">
        <NavLink to="/" className="flex items-center">
          <img src="/inch2.png" alt="LOGO-InchClass" className='h-20' />
        </NavLink>
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-row cursor-pointer items-center space-x-3 py-3 px-3 rounded-xl ${
                isActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-blue-50'
              }`
            }
            onClick={closeSidebar}
          >
            <item.icon className="text-[20px] rounded-md" />
            <span>{item.text}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className={`border-t p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              navigate('/profile');
              closeSidebar();
            }}
          >
          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-300">
            <img
              src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random&color=fff&length=2&bold=true`}
              className="h-full w-full object-cover"
              alt={`Avatar de ${user?.name}`}
            />
          </div>
          <div>
            <p className="font-semibold capitalize">{user?.role}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Connecté</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className={`cursor-pointer p-4 text-red-500 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'}`} onClick={logout}>
        <div className="flex items-center space-x-3">
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </div>
      </div>
    </div>
  );
}
