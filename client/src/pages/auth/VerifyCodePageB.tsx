import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../../api/api';

interface VerifyCodePageProps {
  darkMode: boolean;
}

export default function VerifyCodePageB({ darkMode }: VerifyCodePageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes en secondes

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/api/verify-code', { email, code });
      setSuccess(response.data.message);
      navigate('/reset-password', { 
        state: { 
          email,
          token: response.data.reset_token 
        } 
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col items-center pt-8">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
            <img src="/inch2.png" alt="Logo" className="w-20 h-20 rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 dark:text-white">Vérification du code</h1>
        </div>

        <div className={`p-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-1">Entrez votre code de vérification</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Un code à 6 chiffres a été envoyé à {email}
            </p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              Temps restant: {formatTime(timeLeft)}
            </p>
          </div>

          {error && (
            <div className={`mb-4 p-3 rounded-md text-sm ${darkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'}`}>
              {error}
            </div>
          )}

          {success && (
            <div className={`mb-4 p-3 rounded-md text-sm ${darkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800'}`}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="code" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Code de vérification
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                }}
                className={`w-full px-3 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'} text-center text-xl tracking-widest`}
                placeholder="123456"
                required
                maxLength={6}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || timeLeft <= 0}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${darkMode ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${isLoading || timeLeft <= 0 ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Vérification...
                  </>
                ) : 'Vérifier le code'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => navigate('/forgot-password', { state: { email } })}
              className={`font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            >
              Renvoyer le code
            </button>
          </div>
        </div>

        <div className={`px-8 py-4 text-center text-xs ${darkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
          © {new Date().getFullYear()} Gestionnaire d'équipements. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}