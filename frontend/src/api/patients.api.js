import apiClient from './client.js';

export const patientsApi = {
  getMe: () => apiClient.get('/patients/me'),
  updateMe: (payload) => apiClient.patch('/patients/me', payload),
  list: (params) => apiClient.get('/patients', { params }),
  getById: (id) => apiClient.get(`/patients/${id}`),
};
