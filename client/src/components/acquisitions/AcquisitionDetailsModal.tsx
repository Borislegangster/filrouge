import { Equipment } from '../../pages/Acquisitions';

interface Provider {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface AcquisitionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  acquisition: {
    id: number;
    title: string;
    description: string;
    provider?: Provider;
    amount: number | null;
    status: string;
    request_date: string;
    approval_date: string | null;
    delivery_date: string | null;
    requester?: User;
    approver?: User;
    urgency: string;
    equipment: Equipment[];
  };
  darkMode: boolean;
}

export default function AcquisitionDetailsModal({ isOpen, onClose, acquisition, darkMode }: AcquisitionDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${darkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className={`absolute inset-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`} onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`px-4 py-5 sm:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {acquisition.title}
                </h3>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Demandé le {new Date(acquisition.request_date).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                acquisition.status === 'En attente' ? 
                  darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800' :
                acquisition.status === 'Validée' ? 
                  darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' :
                acquisition.status === 'Rejetée' ? 
                  darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800' :
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
              }`}>
                {acquisition.status}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Demandeur
                </h4>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {acquisition.requester?.name || 'Inconnu'}
                </p>
              </div>

              <div>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Urgence
                </h4>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {acquisition.urgency}
                </p>
              </div>

              {/* <div>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fournisseur
                </h4>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {acquisition.provider?.name || 'Non spécifié'}
                </p>
              </div> */}

              <div>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Montant
                </h4>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {acquisition.amount ? `${acquisition.amount.toLocaleString()}XAF` : 'Non spécifié'}
                </p>
              </div>

              {acquisition.approval_date && (
                <div>
                  <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date d'approbation
                  </h4>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(acquisition.approval_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {acquisition.approver && (
                <div>
                  <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Approuvé par
                  </h4>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {acquisition.approver.name}
                  </p>
                </div>
              )}

              {acquisition.delivery_date && (
                <div>
                  <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date de livraison
                  </h4>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(acquisition.delivery_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </h4>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {acquisition.description || 'Aucune description fournie'}
              </p>
            </div>

            <div className="mt-6">
              <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Équipements demandés
              </h4>
              <div className="mt-2 overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Équipement
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Quantité
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Fournisseur
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    {acquisition.equipment.map((item: any, index: number) => (
                      <tr key={index} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {item.name}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {item.pivot.quantity}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {item.pivot.provider_id 
                            ? availableProviders.find(p => p.id === item.pivot.provider_id)?.name 
                            : 'Non spécifié'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'} border ${darkMode ? 'border-gray-500' : 'border-gray-300'}`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}