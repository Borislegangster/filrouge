export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'administrateur' | 'gestionnaire' | 'formateur';
  status: 'Actif' | 'Inactif' | 'En attente';
  avatar_url?: string;
  phone?: string;
  address?: string;
}

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
  room?: Room;
  provider?: Provider;
}

export interface Room {
  id: number;
  name: string;
  building?: string;
  floor?: string;
  description?: string;
  capacity?: number;
  is_active: boolean;
  equipment?: Equipment[];
}

export interface Provider {
  id: number;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  services: string[];
  contract_end_date: string;
  is_active: boolean;
}