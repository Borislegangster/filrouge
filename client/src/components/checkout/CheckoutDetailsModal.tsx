import React from 'react';
import { X, Package, User, Calendar, Clock, MapPin, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Checkout } from '../../api/checkoutService';

interface CheckoutDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkout: Checkout | null;
  darkMode: boolean;
}

export default function CheckoutDetailsModal({ isOpen, onClose, checkout, darkMode }: CheckoutDetailsModalProps) {
  if (!isOpen || !checkout) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'En cours':
        return darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'En retard':
        return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'Retourné':
        return darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'En cours':
        return <Clock className="w-5 h-5" />;
      case 'En retard':
        return <AlertTriangle className="w-5 h-5" />;
      case 'Retourné':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative w-full max-w-2xl p-6 mx-auto rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Détails du Prêt</h2>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Équipement</h3>
            <div className="flex items-center">
              <Package className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span>{checkout.equipment.name}</span>
              {checkout.equipment.serial_number && (
                <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({checkout.equipment.serial_number})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className={`flex items-center px-3 py-1 rounded-full ${getStatusBadgeClass(checkout.status)}`}>
              {getStatusIcon(checkout.status)}
              <span className="ml-2 font-medium">{checkout.status}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-2">Informations</h3>
            <div className={`p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Emprunteur</span>
                </div>
                <p>{checkout.user.name}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {checkout.user.email}
                </p>
              </div>
              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Motif / Destination</span>
                </div>
                <p>{checkout.purpose}</p>
              </div>
              {checkout.notes && (
                <div>
                  <div className="flex items-center mb-1">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Notes</span>
                  </div>
                  <p className="text-sm">{checkout.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Dates</h3>
            <div className={`p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Date de sortie</span>
                </div>
                <p>{formatDate(checkout.checkout_date)}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Par: {checkout.checkedOutBy.name}
                </p>
              </div>

              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Date de retour prévue</span>
                </div>
                <p>{formatDate(checkout.expected_return_date)}</p>
              </div>

              {checkout.actual_return_date && (
                <div>
                  <div className="flex items-center mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Date de retour effective</span>
                  </div>
                  <p>{formatDate(checkout.actual_return_date)}</p>
                  {checkout.checkedInBy && (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Par: {checkout.checkedInBy.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md ${darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}