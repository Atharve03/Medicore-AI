import apiClient from './client.js';

export const notificationsApi = {
  listMine: (params) => apiClient.get('/notifications/mine', { params }),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
};
