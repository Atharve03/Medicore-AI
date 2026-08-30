import apiClient from './client.js';

export const billingApi = {
  createInvoice: (payload) => apiClient.post('/billing/invoices', payload),
  listByPatient: (patientId, params) =>
    apiClient.get(`/billing/invoices/patient/${patientId}`, { params }),
  pay: (id, amount) => apiClient.patch(`/billing/invoices/${id}/pay`, { amount }),
};
