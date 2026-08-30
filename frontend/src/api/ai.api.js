import apiClient from './client.js';

export const aiApi = {
  chat: (message) => apiClient.post('/ai/chat', { message }),
  clear: () => apiClient.delete('/ai/conversation'),
};
