import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import AutocompleteField from './AutocompleteField';
import providerApis from '../apis/providerApis';
import '../animation.css';
import { toast } from 'react-toastify';


const ProviderForm = ({
  provider,
  onSubmit,
  onCancel,   
  darkMode,
  services,
  setServices
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({...provider});
  const [errors, setErrors] = useState({});
  
  const isUpdateMode = provider.hasOwnProperty("id");
  // const [services, setServices] = useState([]);


  // Charger les Services
  // useEffect( () => {
  //   const loadServices = async () => {
  //     try {
  //       const response = await providerApis.getServices(); // api.get('/api/services');
  //       setServices(response);
        
  //     } catch (error) {
  //       console.error("Erreur lors du chargement des Services", error);
  //     }
  //   };
  //   loadServices();
  // }, []);

  // Initialiser le formulaire
  // useEffect(() => {
  //   if (provider) {
  //     setFormData({
  //       name: provider.name || formData.name,
  //       contactName: provider.contactName || formData.contactName,
  //       email: provider.email || formData.email,
  //       phone: provider.phone || formData.phone,
  //       phone2: provider.phone2 || formData.phone2,
  //       addresse: provider.address || formData.address,
  //       is_active: provider.is_active || formData.is_active,
  //       website: provider.website || formData.website,
  //       description: provider.description || formData.description,
  //       services: provider.services || formData.services
  //     });
  //   }
  // }, [provider]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email est requis';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!isUpdateMode && !formData.name) {
      newErrors.name = 'Nom est requis';
    }
    
    if (!isUpdateMode && !formData.address) {
      newErrors.address = 'Adresse est requise';
    }
    
    if (!formData.services || formData.services.length === 0 ) {
      newErrors.services = 'Services est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const prestataire = await providerApis.createProvider(formData);
        toast.success('Invitation envoyée avec succès');
        onSubmit(prestataire);
        onCancel();
      } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement du prestataire");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const removeService = (serviceName) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.name !== serviceName)
    }));
  }

  const handleServiceChange = (service) => {
    if (!formData.services.find(s => s.id === service.id)) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
    }
  };

  const addNewService = async (service) => {
    // Vérifier si le service existe déjà
    let elt = services.find(s => s.name.toLowerCase() === service.name.toLowerCase());
    
    if (!formData.services.find(s => s.id === service.id) && !elt) { 
      elt = await providerApis.createService({ ...service });
      setServices(prev => ([...prev, elt]));
    }
    if (!formData.services.find(s => s.id === service.id)) {  
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, elt]
      }));
    }
  };
  
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nom" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          Nom *
        </label>
        <input
          type="text"
          id="nom"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
          placeholder="Nom du prestataire"
        />
      </div>
      <div>
        <label htmlFor="contactName" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          Nom du contact
        </label>
        <input
          type="text"
          id="contactName"
          name="contact_name"
          value={formData.contact_name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
          placeholder="Nom de la presonne à contacter"
        />
      </div>
      <div>
        <label htmlFor="email" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
          placeholder="email@exemple.com"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Téléphone *
          </label>
          <input
            type="tel"
            required
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
            placeholder='+237 6 55 55 55 55'
          />
        </div>
        <div>
          <label htmlFor="phone2" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Téléphone 2 (optionel)
          </label>
          <input
            type="tel"
            id="Phone2"
            name="phone2"
            value={formData.phone2}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
            placeholder='+237 6 77 77 77 77'
          />
        </div>
      </div>
      <div>
        <label htmlFor="address" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          Adresse *
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
        />
      </div>  
      <div>
        <label htmlFor="description" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          Description (optionel)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
          placeholder='Donnez une brève description du prestataire'
        ></textarea>
      </div>
      <div>
        <label htmlFor="website" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          Website (optionel)
        </label>
        <input
          type="text"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
          placeholder='https://www.exemple.com'
        />
      </div>
      <div className='flex flex-row gap-4'>
        <div className="basis-2/3">
          <label htmlFor="role" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            services *  
          </label>
          <AutocompleteField 
            data={services} 
            onSelect={handleServiceChange}
            onNewEntry={addNewService}
            classes={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
          />
        </div>
        <div className="basis-1/3">
          <label htmlFor="isActive" className={`block mb-1 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Statut *
          </label>
          <select
            id="isActive"
            name="is_active"
            value={formData.is_active}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md text-xl mt-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
          >
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>
      </div>
      {/* // Affichage des services sélectionnés */}
      <div>
        <dl className="flex flex-start overflow-x-auto whitespace-nowrap scrollbar-hidden">
          {formData.services.map((item) => (
            <div
              key={item.name}
              className={`rounded-lg mr-2 sm:p-2 hover:ring-1 ${darkMode ? 'inset-ring inset-ring-white/10 bg-gray-700 border-gray-600 text-white' : 'bg-white text-gray-700 border-gray-300 shadow-sm '}`}
            >
              <div className={`flex flex-between truncate text-md font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {item.name}<span className="sr-only">Close</span>
                <XMarkIcon 
                  aria-hidden="true" 
                  alt="retirer" 
                  className="size-5 bg-amber-900/75 text-white mt-0.5 ml-1.5 rounded-xl cursor-pointer" 
                  onClick={() => removeService(item.name)}/>
              </div>
              {/* <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{item.stat}</dd> */}
            </div>
          ))}
        </dl>
      </div>

      {/* buttons annulation et soumission */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center min-w-[100px] ${isSubmitting ? 'opacity-75' : ''}`}
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin mr-2" size={16} />
              {isUpdateMode ? 'Mise à jour...' : 'Enregistrement...'}
            </>
          ) : (
            isUpdateMode ? 'Mettre à jour' : 'Ajouter'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProviderForm;