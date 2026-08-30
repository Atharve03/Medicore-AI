import apiClient from './client.js';

export const adminApi = {
  getOverview: () => apiClient.get('/admin/overview'),
  listUsers: (params) => apiClient.get('/admin/users', { params }),
  createUser: (payload) => apiClient.post('/admin/users', payload),
  updateUser: (id, payload) => apiClient.patch(`/admin/users/${id}`, payload),
  deactivateUser: (id) => apiClient.delete(`/admin/users/${id}`),
};
