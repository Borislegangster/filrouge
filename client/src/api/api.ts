import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
});

// Intercepteur spécial pour FormData
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }
  return config;
});

// Nouvel intercepteur unifié
api.interceptors.request.use(async (config) => {
  // Ajout du token d'authentification si disponible
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Gestion CSRF (sauf pour la route csrf-cookie elle-même)
  if (!config.url?.includes('/sanctum/csrf-cookie')) {
    // Vérifier et obtenir le cookie CSRF si nécessaire
    if (!document.cookie.includes('XSRF-TOKEN')) {
      try {
        await axios.get(
          (import.meta.env.VITE_API_URL || 'http://localhost:8001') + '/sanctum/csrf-cookie',
          { 
            withCredentials: true,
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          }
        );
        
        // Extraire le token du cookie
        const xsrfToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1];
        
        if (xsrfToken) {
          config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
        }
      } catch (error) {
        console.error('CSRF token fetch failed:', error);
        throw error;
      }
    } else {
      // Utiliser le token existant
      const xsrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      if (xsrfToken) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
      }
    }
  }

  return config;
});

// Intercepteur de réponse amélioré
api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    if (!response) {
      console.error('Network error:', error);
      return Promise.reject(error);
    }

    switch (response.status) {
      case 401:
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        console.error('Forbidden:', response.data);
        break;
      case 404:
        console.error('Not found:', response.config.url);
        break;
      case 419:
        console.warn('CSRF token mismatch, retrying...');
        // Nouvelle tentative automatique
        return api(error.config);
      case 422:
        console.error('Validation errors:', response.data.errors);
        break;
      default:
        console.error('Server error:', response.status, response.data);
    }

    return Promise.reject(error);
  }
);

export default api;