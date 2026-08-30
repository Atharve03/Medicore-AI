import apiClient from './client.js';

export const prescriptionsApi = {
  create: (payload) => apiClient.post('/prescriptions', payload),
  getById: (id) => apiClient.get(`/prescriptions/${id}`),
  listByPatient: (patientId, params) =>
    apiClient.get(`/prescriptions/patient/${patientId}`, { params }),
};
