import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
// Import des pages
import Acquisitions from './pages/Acquisitions';
import CheckoutReturn from './pages/CheckoutReturn';
import Equipment from './pages/Equipment';
import Issues from './pages/Issues';
import Notifications from './pages/Notifications';
import Providers from './pages/Providers';
import Rooms from './pages/Rooms';
import Users from './pages/Users';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyCodePage from './pages/auth/VerifyCodePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
// import VerifyCodePageB from './pages/auth/VerifyCodePageB';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import TestPage from './pages/TestPage';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  return (
    <Router>
      <AuthProvider>
        <div className={`flex h-screen w-full transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
          {/* Routes publiques (auth) */}
          <Routes>
            <Route path="/test" element={<TestPage />} />
            <Route path="/login" element={<AuthLayout><LoginPage darkMode={darkMode} /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><RegisterPage darkMode={darkMode} /></AuthLayout>} />
            <Route path="/forgot-password" element={<AuthLayout><ForgotPasswordPage darkMode={darkMode} /></AuthLayout>} />
            {/* <Route path="/verify-code" element={<AuthLayout><VerifyCodePage darkMode={darkMode} /></AuthLayout>} /> */}
            <Route path="/verify-code" element={<AuthLayout><VerifyCodePage darkMode={darkMode} /></AuthLayout>} />
            {/* <Route path="/verifyCode" element={<AuthLayout><VerifyCodePageB darkMode={darkMode} /></AuthLayout>} /> */}
            <Route path="/verifyCode" element={<AuthLayout><VerifyCodePage darkMode={darkMode} /></AuthLayout>} />
            <Route path="/reset-password" element={<AuthLayout><ResetPasswordPage darkMode={darkMode} /></AuthLayout>} />
            
            {/* Routes privées */}
            <Route path="/*" element={
              <PrivateRoute>
                <AppLayout 
                  sidebarOpen={sidebarOpen} 
                  setSidebarOpen={setSidebarOpen}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

// Layout pour les pages d'authentification
function AuthLayout({ children }) {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      {children}
    </div>
  );
}

// Layout pour l'application principale
function AppLayout({ sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode }) {
  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar closeSidebar={() => setSidebarOpen(false)} darkMode={darkMode} />
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex w-full flex-1 flex-col">
        <Header
          openSidebar={() => setSidebarOpen(true)}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Dashboard darkMode={darkMode} />} />
            <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />} />
            <Route path="/equipments" element={<Equipment darkMode={darkMode} />} />
            <Route path="/rooms" element={<Rooms darkMode={darkMode} />} />
            <Route path="/acquisitions" element={<Acquisitions darkMode={darkMode} />} />
            {/* Protéger la route users avec un rôle requis */}
            <Route path="/users" element={
              <PrivateRoute allowedRoles={['Administrateur', 'Gestionnaire']}>
                <Users darkMode={darkMode} />
              </PrivateRoute>
            } />
            <Route path="/issues" element={<Issues darkMode={darkMode} />} />
            <Route path="/checkout-return" element={<CheckoutReturn darkMode={darkMode} />} />
            <Route path="/providers" element={
              <PrivateRoute allowedRoles={['Administrateur', 'Gestionnaire']}>
                <Providers darkMode={darkMode} />
              </PrivateRoute>
              } />
            <Route path="/notifications" element={<Notifications darkMode={darkMode} />} />
            <Route path="/profile" element={<ProfilePage darkMode={darkMode} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

// Composant pour protéger les routes privées - MAJ avec le contexte d'authentification
function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth(); // Utilisez le contexte d'authentification
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification des rôles si spécifiés
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}