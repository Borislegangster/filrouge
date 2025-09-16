import api from '.';

// export interface User {
//   id?: number;
//   name: string;
//   email: string;
//   role: string;
//   status?: string;
//   is_active?: boolean;
//   last_login?: string;
//   avatarUrl?: string;
// }

// interface InvitationData {
//   email: string;
//   role: string;
// }

export const getAll = async () => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    throw new Error('Impossible de charger les utilisateurs');
  }
};

export const update = async (id, user) => {
  try {
    const response = await api.put(`/api/users/${id}`, user);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update user');
  }
};

export const activateUser = async (id) => {
  try {
    const response = await api.put(`/api/users/${id}/activate`);
    return response.data;
  } catch (error) {
    throw new Error('Erreur d\'activation/désactivation');
  }
};

export const deleteUser = async (id) => {
  try {
    await api.delete(`/api/users/${id}`);
  } catch (error) {
    throw new Error('Erreur lors de la suppression');
  }
};

export const sendInvitation = async (data) => {
  try {
    await api.post('/api/invitations', data);
  } catch (error) {
    throw new Error('Failed to send invitation');
  }
};

export const getRoles = async () => {
  return ['Administrateur', 'Manager', 'Gestionnaire', 'Utilisateur'];
};

export default {
  getAll,
  update,
  activateUser,
  deleteUser,
  sendInvitation,
  getRoles,
};