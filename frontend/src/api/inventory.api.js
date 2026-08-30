import apiClient from './client.js';

export const inventoryApi = {
  listItems: (params) => apiClient.get('/inventory/items', { params }),
  createItem: (payload) => apiClient.post('/inventory/items', payload),
  updateItem: (id, payload) => apiClient.patch(`/inventory/items/${id}`, payload),
};
