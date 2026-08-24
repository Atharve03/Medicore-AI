import apiClient from './client.js';

export const admissionsApi = {
  create: (payload) => apiClient.post('/admissions', payload),
  discharge: (id) => apiClient.patch(`/admissions/${id}/discharge`),
  listByPatient: (patientId, params) =>
    apiClient.get(`/admissions/patient/${patientId}`, { params }),
};
