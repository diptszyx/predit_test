import axios from 'axios';
import { generateClientToken } from './clientToken';

export const AUTH_TOKEN_STORAGE_KEY = 'deor.authToken';
const DEFAULT_API_BASE_URL = 'https://deor-be-production.up.railway.app/api/v1';

const CLIENT_TOKEN_PATHS = ['/auth/register', '/auth/verify'];

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  // withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  const url = config.url ?? '';
  if (CLIENT_TOKEN_PATHS.some((p) => url.startsWith(p))) {
    try {
      const clientToken = await generateClientToken();
      config.headers = config.headers ?? {};
      config.headers['x-client-token'] = clientToken;
    } catch {
      // Non-fatal: let the request proceed; BE guard will reject if required
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const GEO_EXEMPT_PATHS = [
      '/restricted',
      '/privacy-policy',
      '/terms-of-service',
    ];
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
