import apiClient from './client.js';

export const authApi = {
  register: (payload) => apiClient.post('/auth/register', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  verifyOtp: (payload) => apiClient.post('/auth/verify-otp', payload),
  resendOtp: (payload) => apiClient.post('/auth/resend-otp', payload),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  verifyForgotPasswordOtp: (email, otp) =>
    apiClient.post('/auth/verify-forgot-password-otp', { email, otp }),
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload),
  changePassword: (payload) => apiClient.post('/auth/change-password', payload),
};
