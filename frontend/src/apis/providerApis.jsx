import api from ".";

export const getProviders = async (params = {}) => {
  const response = await api.get('/api/providers', { params });  
  return response.data;
};

export const getServices = async (params = {}) => {
  const response = await api.get('/api/services', { params });
  return response.data;
};

export const getProviderStatuses = async () => {
  const response = await api.get('/api/providers/status');
  return response.data;
};

export const createProvider = async (data) => {
  const response = await api.post('/api/providers', {
      ...data,
  });
  return response.data;
};

export const createService = async (data) => {
  const response = await api.post('/api/services', {
      ...data,
  });
  return response.data;
};

export const addProviderService = async (id, data) => {
  const response = await api.post(`/api/providers/${id}/services}`, {
      ...data,
  });
  return response.data;
};

export const updateProvider = async (id, data) => {
  const response = await api.put(`/api/providers/${id}`, {
      ...data,
  });
  return response.data;
};

export const deleteProvider = async (id) => {
  await api.delete(`/api/providers/${id}`);
};

export const deleteService = async (id) => {
  await api.delete(`/api/services/${id}`);
};

export const deleteProviderService = async (idProvider, idService) => {
  await api.delete(`/api/providers/${idProvider}/services/${idService}`);
};

export default {
  createService,
  getServices,
  deleteService,
  createProvider,
  getProviders,
  updateProvider,
  deleteProvider,
  getProviderStatuses,
  addProviderService,
  deleteProviderService
};