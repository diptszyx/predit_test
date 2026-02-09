import axios from 'axios';

export const AUTH_TOKEN_STORAGE_KEY = 'deor.authToken';
const DEFAULT_API_BASE_URL = 'https://deor-be-production.up.railway.app/api/v1';

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  // withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const GEO_EXEMPT_PATHS = ['/restricted', '/privacy-policy', '/terms-of-service'];
    if (
      error.response?.data?.error === 'GEO_RESTRICTED' &&
      !GEO_EXEMPT_PATHS.includes(window.location.pathname)
    ) {
      window.location.href = '/restricted';
      return new Promise(() => {});
    }

    if (
      typeof window !== 'undefined' &&
      error?.response?.status === 401 &&
      window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    ) {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
