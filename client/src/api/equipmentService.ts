import axios from './api';

export interface Equipment {
  id: number;
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

export interface EquipmentFilters {
  type?: string;
  status?: string;
  room_id?: number;
  provider_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const fetchEquipment = async (filters: EquipmentFilters = {}): Promise<PaginatedResponse<Equipment>> => {
  try {
    const response = await axios.get('/api/v1/equipment', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw error;
  }
};

export const fetchAvailableEquipment = async (search?: string): Promise<Equipment[]> => {
  try {
    const response = await axios.get('/api/v1/equipment', { 
      params: { 
        status: 'Fonctionnel',
        search,
        per_page: 100 // Limit to a reasonable number
      } 
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching available equipment:', error);
    throw error;
  }
};

export const fetchEquipmentStatuses = async (): Promise<string[]> => {
  // You might need to create this endpoint in your backend
  // This is just an example of how you would call it
  try {
    const statuses = [
      'Fonctionnel',
      'En panne',
      'En maintenance',
      'Réservé'
    ];
    return statuses;
  } catch (error) {
    console.error('Error fetching equipment statuses:', error);
    throw error;
  }
};