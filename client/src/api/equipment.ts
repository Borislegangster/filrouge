import api from './api';

interface Equipment {
  id?: number;
  name: string;
  type: string;
  status: string;
  serial_number?: string;
  description?: string;
  purchase_date?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  room_id?: number;
  provider_id?: number;
  room?: {
    id: number;
    name: string;
  };
  provider?: {
    id: number;
    name: string;
  };
}

interface PaginatedResponse {
  data: Equipment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const getEquipment = async (params: any = {}): Promise<PaginatedResponse> => {
  const response = await api.get('/api/equipment', { params });
  return response.data;
};

export const getEquipmentTypes = async (): Promise<string[]> => {
  const response = await api.get('/api/equipment/types');
  return response.data;
};

export const getEquipmentStatuses = async (): Promise<string[]> => {
  const response = await api.get('/api/equipment/statuses');
  return response.data;
};

export const createEquipment = async (data: Equipment): Promise<Equipment> => {
  const response = await api.post('/api/equipment', {
      ...data,
      room_id: data.room_id || null,
      provider_id: data.provider_id || null
  });
  return response.data;
};

export const updateEquipment = async (id: number, data: Equipment): Promise<Equipment> => {
  const response = await api.put(`/api/equipment/${id}`, {
      ...data,
      room_id: data.room_id || null,
      provider_id: data.provider_id || null
  });
  return response.data;
};

export const deleteEquipment = async (id: number): Promise<void> => {
  await api.delete(`/api/equipment/${id}`);
};

export default {
  getEquipment,
  getEquipmentTypes,
  getEquipmentStatuses,
  createEquipment,
  updateEquipment,
  deleteEquipment
};