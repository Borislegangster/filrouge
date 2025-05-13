import axios from './api';

export interface Checkout {
  id: number;
  equipment: {
    id: number;
    name: string;
    status: string;
    serial_number?: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  checkedOutBy: {
    id: number;
    name: string;
  };
  checkedInBy?: {
    id: number;
    name: string;
  };
  checkout_date: string;
  expected_return_date: string;
  actual_return_date: string | null;
  purpose: string;
  status: 'En cours' | 'Retourné' | 'En retard';
  notes?: string;
}

export interface CheckoutStats {
  active: number;
  late: number;
  returnedToday: number;
  upcoming: number;
}

export interface CheckoutFilters {
  status?: string;
  equipment_id?: number;
  user_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CheckoutData {
  equipment_id: number;
  user_id: number;
  checkout_date: string;
  expected_return_date: string;
  purpose: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const fetchCheckouts = async (filters: CheckoutFilters = {}): Promise<PaginatedResponse<Checkout>> => {
  try {
    const response = await axios.get('/api/v1/checkouts', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching checkouts:', error);
    throw error;
  }
};

export const fetchCheckout = async (id: number): Promise<Checkout> => {
  try {
    const response = await axios.get(`/api/v1/checkouts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching checkout details:', error);
    throw error;
  }
};

export const createCheckout = async (data: CheckoutData): Promise<Checkout> => {
  try {
    const response = await axios.post('/api/v1/checkouts', data);
    return response.data;
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw error;
  }
};

export const returnEquipment = async (id: number, notes?: string): Promise<Checkout> => {
  try {
    const response = await axios.put(`/api/v1/checkouts/${id}`, {
      status: 'Retourné',
      actual_return_date: new Date().toISOString().split('T')[0],
      notes
    });
    return response.data;
  } catch (error) {
    console.error('Error returning equipment:', error);
    throw error;
  }
};

export const updateCheckout = async (id: number, data: Partial<CheckoutData>): Promise<Checkout> => {
  try {
    const response = await axios.put(`/api/v1/checkouts/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating checkout:', error);
    throw error;
  }
};

export const deleteCheckout = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/api/v1/checkouts/${id}`);
  } catch (error) {
    console.error('Error deleting checkout:', error);
    throw error;
  }
};

export const fetchCheckoutStatuses = async (): Promise<string[]> => {
  try {
    const response = await axios.get('/api/v1/checkouts/statuses');
    return response.data;
  } catch (error) {
    console.error('Error fetching checkout statuses:', error);
    throw error;
  }
};

export const fetchCheckoutStats = async (): Promise<CheckoutStats> => {
  try {
    const response = await axios.get('/api/v1/checkouts/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching checkout stats:', error);
    throw error;
  }
};

export const updateOverdueCheckouts = async (): Promise<{ message: string, updated_count: number }> => {
  try {
    const response = await axios.post('/api/v1/checkouts/update-overdue');
    return response.data;
  } catch (error) {
    console.error('Error updating overdue checkouts:', error);
    throw error;
  }
};