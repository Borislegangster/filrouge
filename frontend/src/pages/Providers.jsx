import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Globe,
  Building,
  HardHat,
  CheckCircle,
  Video,
  Wrench,
  CircleUserRound,
} from "lucide-react";
import Modal from "../components/Modal";
import ProviderForm from "../components/ProviderForm";
import providerApis from "../apis/providerApis";


// interface ProvidersProps {
//   darkMode: boolean;
// }

export default function Providers({ darkMode }) {
  const providerModel = {
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    phone2: "",
    address: "",
    website: "",
    description: "",
    is_active: true,
    services: [],
  };
  const [providers, setProviders] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(providerModel);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [sortConfig, setSortConfig] = useState(null);
  const [paginationData, setPaginationData] = useState({ meta: {}, links: {} });
  const [services, setServices] = useState(null);


  const getPageData = async (url) => {
    url = new URL(url);
    const params = new URLSearchParams(url.search);
    loadProviders(params);
  };

  const loadProviders = async (params = {}) => {
    try {
      const response = await providerApis.getProviders(params);
      setPaginationData({ meta: response.meta, links: response.links });
      setProviders(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des prestataires: ", error);
    }
  };
  
  // Charger les prestatires
  useEffect(() => {
    loadProviders();
  }, []);

  //Reinitialise les termes de recherche
  useEffect(() => {
    if (searchTerm === "") {
      loadProviders();
    }
  }, [searchTerm]);

  // Effectue la recherche sous statut ou service
  useEffect(() => {
    handleSearch();
  }, [statusFilter, serviceFilter]);

  const loadServices = async () => {
    try {
      const response = await providerApis.getServices();
      setServices(response);
    } catch (error) {
      console.error("Erreur lors du chargement des Services", error);
    }
  };

  // Charger les Services
  useEffect(() => {
    loadServices();
  }, []);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key)
      return <ChevronDown className="w-4 h-4 opacity-0" />;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Actif":
        return darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800";
      case "Inactif":
        return darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800";
      default:
        return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800";
    }
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case "Maintenance":
        return <HardHat className="w-4 h-4 mr-1" />;
      case "Fourniture matériel":
        return <Building className="w-4 h-4 mr-1" />;
      case "Audiovisuel":
        return <Video className="w-4 h-4 mr-1" />;
      case "Installation":
        return <Wrench className="w-4 h-4 mr-1" />;
      default:
        return <CheckCircle className="w-4 h-4 mr-1" />;
    }
  };
  
  // No more Used but Useful function
  const allServices = providers && Array.from(
    new Set(
      providers
        .flatMap((p) => p.services)
        .map(({ id, name }) => JSON.stringify({ id: id, name: name }))
    )
  ).map((str) => JSON.parse(str));

  // console.log('providers: ',providers);
  // console.log('allServices: ',allServices);

  // const filteredProviders = providers.filter((provider) => {
    // const matchesSearch =
    //   provider.name.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    //   provider.contact.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    //   provider.email.toLowerCase().includes(searchTerm?.toLowerCase());

    // const matchesStatus = statusFilter ? provider.status === statusFilter : true;
    // const matchesService = serviceFilter ? provider.services.includes(serviceFilter) : true;

    // return matchesSearch && matchesStatus && matchesService;
  // });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter) params.append("status", statusFilter);
    if (serviceFilter) params.append("service", serviceFilter);
    loadProviders(params);
  };

  // const sortedProviders = [...filteredProviders];
  const sortedProviders = [...providers || []];
  if (sortConfig !== null) {
    sortedProviders.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  const addOrEditProvider = async (newProvider) => {
    setIsModalOpen(false);
    if (currentProvider.hasOwnProperty("id")) {
      try {
        await providerApis.updateProvider(currentProvider.id, newProvider);
        setProviders(providers.map((p) => (p.id === currentProvider.id ? newProvider : p)));
        setCurrentProvider(providerModel);
      } catch (error) {
        console.log("Erreur lors de la mise à jour du prestataire: ", error);        
      }
    } else {
      setProviders([...providers, newProvider]);
      setPaginationData({ ...paginationData, meta: { ...paginationData.meta, total: paginationData.meta.total + 1, to: paginationData.meta.to + 1} })
    }
  };

  const deleteProvider = async (provider) => {
    try {
      await providerApis.deleteProvider(provider.id);
      setProviders(providers.filter((p) => p.id !== provider.id));
      setPaginationData({ ...paginationData, meta: { ...paginationData.meta, total: paginationData.meta.total - 1, to: paginationData.meta.to - 1} })
    } catch (error) {
      console.error("Erreur lors de la suppression du prestataire: ", error);
    }
  };
  
  return (
    <div className={`space-y-6 ${darkMode ? "text-white" : "text-gray-800"}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold md:text-2xl">Gestion des Prestataires</h1>
        <button
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          onClick={() => {
            setCurrentProvider(providerModel);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Prestataire
        </button>
      </div>

      {/* Filtres et Recherche */}
      <div
        className={`rounded-lg shadow-md p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un prestataire..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                } focus:outline-none focus:ring-2 ${
                  darkMode ? "focus:ring-blue-500" : "focus:ring-blue-300"
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={(e) => e.key === "Enter" ? handleSearch() : null}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
            <select
              className={`p-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              } focus:outline-none focus:ring-2 ${
                darkMode ? "focus:ring-blue-500" : "focus:ring-blue-300"
              }`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Statuts</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
            <select
              className={`max-w-[103px] p-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              } focus:outline-none focus:ring-2 ${
                darkMode ? "focus:ring-blue-500" : "focus:ring-blue-300"
              }`}
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="">Services</option>
              {services && services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                  {/* {service.name.charAt(0).toUpperCase()} */}
                </option>
              ))}
            </select>
            <button
              className={`flex items-center p-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              onClick={handleSearch}
            >
              <Search className="w-5 h-5 mr-2" />
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* Liste des prestataires */}
      <div
        className={`rounded-lg shadow-md overflow-hidden ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("name")}
                >
                  <div className="flex items-center">
                    <span>Nom</span>
                    {getSortIcon("name")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Services
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center">
                    <span>Statut</span>
                    {getSortIcon("status")}
                  </div>
                </th>
                {/* <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('contractEndDate')}
                >
                  <div className="flex items-center">
                    <span>Fin de contrat</span>
                    {getSortIcon('contractEndDate')}
                  </div>
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              {sortedProviders.map((provider) => (
                <tr
                  key={provider.id}
                  className={darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {provider.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <CircleUserRound
                          className={`w-4 h-4 mr-2 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {provider.contact_name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone
                          className={`w-4 h-4 mr-2 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {provider.phone}{" "}
                          {provider.phone2 ? ` / ${provider.phone2}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail
                          className={`w-4 h-4 mr-2 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {provider.email}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Globe
                          className={`w-4 h-4 mr-2 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {provider.website}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {provider.services.map((service) => (
                        <span
                          key={service.id}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            darkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {/* {getServiceIcon(service)} */}
                          {service.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        provider.is_active ? "Actif" : "Inactif"
                      )}`}
                    >
                      {provider.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  {/* <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {provider.contractEndDate}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      <button
                        className={
                          darkMode
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-600 hover:text-blue-800"
                        }
                        title="Modifier"
                        onClick={() => {
                          setCurrentProvider(provider);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className={
                          darkMode
                            ? "text-red-400 hover:text-red-300"
                            : "text-red-600 hover:text-red-800"
                        }
                        title="Supprimer"
                        onClick={()=>deleteProvider(provider)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              className={`px-4 py-2 border text-sm font-medium rounded-md ${
                darkMode
                  ? "border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Précédent
            </button>
            <button
              className={`ml-3 px-4 py-2 border text-sm font-medium rounded-md ${
                darkMode
                  ? "border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Affichage de{" "}
                <span className="font-medium">{paginationData.meta.from}</span> à{" "}
                <span className="font-medium">{paginationData.meta.to}</span> sur{" "}
                <span className="font-medium">{paginationData.meta.total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {paginationData.meta.links &&
                  paginationData.meta.links.map(({ url, label, page, active }) => {
                    let classes = `relative inline-flex items-center px-2 py-2 border text-sm font-medium`;
                    if (label.includes("Previous")) {
                      classes += " rounded-l-md";
                      label = "Précédent";
                    }
                    if (label.includes("Next")) {
                      classes += " rounded-r-md";
                      label = "Suivant";
                    }
                    if (active) {
                      classes += " z-10 ring-2 ring-gray-500";
                    }
                    if (page === null) {
                      classes += " disabled cursor-not-allowed opacity-30 bg-gray-600";
                    } else {
                      classes += ` cursor-pointer ${
                        darkMode
                          ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                          : " border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
                      }`;
                    }

                    return (
                      <span
                        className={classes}
                        key={label}
                        onClick={() => {
                          getPageData(url);
                        }}
                      >
                        {label.replace(/&laquo;|&raquo;/g, "").trim()}
                      </span>
                    );
                  })}
                {/* <button 
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'}`}
                >
                  Précédent
                </button>
                <button 
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                >
                  1
                </button>
                <button 
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                >
                  2
                </button>
                <button 
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'}`}
                >
                  Suivant
                </button> */}
              </nav>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un Prestataire"
        size="lg"
        darkMode={darkMode}
      >
        <ProviderForm
          provider={currentProvider}
          services={services}
          setServices={setServices}
          onSubmit={addOrEditProvider}
          onCancel={() => setIsModalOpen(false)}
          darkMode={darkMode}
        />
      </Modal>
    </div>
  );
}
