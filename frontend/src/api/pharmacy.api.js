import apiClient from './client.js';

export const pharmacyApi = {
  listMedicines: (params) => apiClient.get('/pharmacy/medicines', { params }),
  createMedicine: (payload) => apiClient.post('/pharmacy/medicines', payload),
  updateMedicine: (id, payload) => apiClient.patch(`/pharmacy/medicines/${id}`, payload),
  dispense: (payload) => apiClient.post('/pharmacy/dispense', payload),
  listOrders: (params) => apiClient.get('/pharmacy/orders', { params }),
};
