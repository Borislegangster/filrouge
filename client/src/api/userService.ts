import axios from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'administrateur' | 'gestionnaire' | 'formateur';
  is_active?: boolean;
}

export interface UserFilters {
  role?: string;
  is_active?: boolean;
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

export const fetchUsers = async (filters: UserFilters = {}): Promise<PaginatedResponse<User>> => {
  try {
    const response = await axios.get('/api/v1/users', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchActiveUsers = async (search?: string): Promise<User[]> => {
  try {
    const response = await axios.get('/api/v1/users', { 
      params: { 
        is_active: true,
        search,
        per_page: 100 // Limit to a reasonable number
      } 
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching active users:', error);
    throw error;
  }
};