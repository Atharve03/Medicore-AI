import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Lazily imported to avoid a circular import between the store and the
// client (the store needs the client for API calls; the client needs the
// store for the token and to react to a failed refresh).
let authStoreRef = null;
export function attachAuthStore(store) {
  authStoreRef = store;
}

apiClient.interceptors.request.use((config) => {
  const token = authStoreRef?.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = config?.url?.startsWith('/auth/');

    if (response?.status !== 401 || isAuthEndpoint || config._retried) {
      return Promise.reject(error);
    }
    config._retried = true;

    const store = authStoreRef?.getState();
    if (!store?.refreshToken) {
      store?.logout();
      return Promise.reject(error);
    }

    try {
      // Multiple concurrent 401s share a single in-flight refresh call
      // instead of each firing their own /auth/refresh request.
      refreshPromise =
        refreshPromise ||
        apiClient
          .post('/auth/refresh', { refreshToken: store.refreshToken })
          .finally(() => {
            refreshPromise = null;
          });

      const { data } = await refreshPromise;
      store.setTokens(data.data.accessToken, data.data.refreshToken);

      config.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return apiClient(config);
    } catch (refreshError) {
      store.logout();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
