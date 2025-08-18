import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/api";
import { Lock, Loader2 } from 'lucide-react';

const VerifyCodePage = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("/api/verify-invitation", { code, token });
      navigate("/register", {
        state: { email: res.data.email, token: res.data.token },
      });
    } catch (err) {
      setError("Code invalide ou expiré.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center pt-8">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
            <img src="/inch2.png" alt="Logo" className="w-20 h-20 rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 dark:text-white">Vérification du code</h1>
        </div>

        <div className="p-8 dark:text-white">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-1">Entrez votre code d'invitation</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vérifiez votre email pour trouver le code à 6 chiffres
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md text-sm bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1 dark:text-gray-300">
                Code d'invitation
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="number"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123456"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
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
        </div>

        <div className="px-8 py-4 text-center text-xs bg-gray-50 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
          © {new Date().getFullYear()} Gestionnaire d'équipements. Tous droits réservés.
        </div>
      </div>
    </div>
  );
};

export default VerifyCodePage;