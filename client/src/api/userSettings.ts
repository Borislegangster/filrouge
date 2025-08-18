import api from './api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
  avatar_url?: string;
}

interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_picture?: File | null;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

export const getProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get('/api/user-profile');
    return response.data.user;
  } catch (error) {
    throw new Error('Failed to load profile');
  }
};

export const updateProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  try {
    const formData = new FormData();
    
    // Append all fields to FormData
    formData.append('name', data.name);
    formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', data.address);
    if (data.profile_picture) formData.append('profile_picture', data.profile_picture);
    if (data.new_password) {
      formData.append('current_password', data.current_password || '');
      formData.append('new_password', data.new_password);
      formData.append('new_password_confirmation', data.new_password_confirmation || '');
    }

    const response = await api.put('/api/user-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.user;
  } catch (error: any) {
    if (error.response?.data?.errors) {
      throw error.response.data.errors;
    }
    throw new Error('Failed to update profile');
  }
};

export default {
  getProfile,
  updateProfile,
};