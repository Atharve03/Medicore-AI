import apiClient from './client.js';
export const analyticsApi = { get: (section, params) => apiClient.get(`/analytics/${section}`, { params }), usage:params=>apiClient.get('/analytics/ai-usage',{params}), report:range=>apiClient.post('/analytics/ai-report',{range}) };
