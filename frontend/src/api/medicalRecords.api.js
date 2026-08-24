import apiClient from './client.js';

export const medicalRecordsApi = {
  create: (formData) =>
    apiClient.post('/medical-records', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getById: (id) => apiClient.get(`/medical-records/${id}`),
  listByPatient: (patientId, params) =>
    apiClient.get(`/medical-records/patient/${patientId}`, { params }),
};
