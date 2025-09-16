//*
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from '../apis';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/api/user');
          setUser(response.data);
        }
      } catch (err) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setError('Session expirée, veuillez vous reconnecter');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // const login = async (email, password, remember = false) => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.post('/api/login', { email, password, remember });
  //     const { access_token, user } = response.data;

  //     localStorage.setItem('token', access_token);
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  //     setUser(user);
  //     setError(undefined);
  //     navigate('/dashboard');
  //   } catch (err) {
  //     setError('Email ou mot de passe incorrect');
  //     throw err;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/login', { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(user);
      setError(null);
    } catch (error) {
      setError('Erreur d\'authentification');
    }
  };

  const logout = async () => {
    try {
      // Appel API pour déconnexion côté serveur
      await axios.post('/api/logout');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      // Nettoyage côté client quoi qu'il arrive
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}
// */
/*
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../apis';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/api/user');
          setUser(response.data);
        }
      } catch (error) {
        setError('Erreur d\'authentification');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/login', { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setUser(user);
      setError(null);
    } catch (error) {
      setError('Erreur d\'authentification');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// */

export const useAuth = () => {
  const context = useContext(AuthContext); 
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export default AuthProvider;