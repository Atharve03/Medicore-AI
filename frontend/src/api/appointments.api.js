import apiClient from './client.js';

export const appointmentsApi = {
  create: (payload) => apiClient.post('/appointments', payload),
  listMine: (params) => apiClient.get('/appointments/mine', { params }),
  listAll: (params) => apiClient.get('/appointments', { params }),
  updateStatus: (id, status) =>
    apiClient.patch(`/appointments/${id}/status`, { status }),
  cancel: (id) => apiClient.delete(`/appointments/${id}`),
};
