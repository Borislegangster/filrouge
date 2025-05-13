import axios from './api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'Maintenance' | 'Retard' | 'Problème' | 'Acquisition';
  is_read: boolean;
  user_id: number;
  related_type?: string;
  related_id?: number;
  created_at: string;
}

export interface NotificationFilters {
  type?: string;
  is_read?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface NotificationStats {
  unread_count: number;
}

export const fetchNotifications = async (filters: NotificationFilters = {}) => {
  try {
    const response = await axios.get('/api/v1/notifications', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markAsRead = async (id: number) => {
  try {
    const response = await axios.put(`/api/v1/notifications/${id}`, {
      is_read: true
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await axios.post('/api/v1/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (id: number) => {
  try {
    await axios.delete(`/api/v1/notifications/${id}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const getUnreadCount = async (): Promise<NotificationStats> => {
  try {
    const response = await axios.get('/api/v1/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

export const getNotificationTypes = async (): Promise<string[]> => {
  try {
    const response = await axios.get('/api/v1/notifications/types');
    return response.data;
  } catch (error) {
    console.error('Error getting notification types:', error);
    throw error;
  }
};