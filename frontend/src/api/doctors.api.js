import apiClient from './client.js';

export const doctorsApi = {
  getMe: () => apiClient.get('/doctors/me'),
  updateMe: (payload) => apiClient.patch('/doctors/me', payload),
  list: (params) => apiClient.get('/doctors', { params }),
  getById: (id) => apiClient.get(`/doctors/${id}`),
};
