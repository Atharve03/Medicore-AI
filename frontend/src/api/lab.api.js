import apiClient from './client.js';

export const labApi = {
  createOrder: (payload) => apiClient.post('/lab/orders', payload),
  submitResults: (id, formData) =>
    apiClient.patch(`/lab/orders/${id}/results`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  listReportsByPatient: (patientId, params) =>
    apiClient.get(`/lab/reports/patient/${patientId}`, { params }),
};
