import axios from 'axios';

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

/**
 * Axios Client Configuration
 * Cliente HTTP configurado con interceptors para manejo de errores y autenticación
 */

const apiUrl: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
// eslint-disable-next-line @typescript-eslint/no-inferrable-types -- Required by typedef rule
const MAX_RETRIES: number = 3;
// eslint-disable-next-line @typescript-eslint/no-inferrable-types -- Required by typedef rule
const RETRY_DELAY: number = 1000; // 1 segundo

// Storage keys
// eslint-disable-next-line @typescript-eslint/no-inferrable-types -- Required by typedef rule
const AUTH_TOKEN_KEY: string = 'auth_token';

// Extended config with retry count
interface ConfigWithRetry extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Sleep helper for retry delays
 */
async function sleep(ms: number): Promise<void> {
  await new Promise<void>((resolve: () => void) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Handle retry logic with exponential backoff
 */
async function handleRetry(config: ConfigWithRetry, statusCode?: number): Promise<AxiosResponse> {
  const retryCount: number = config._retryCount ?? 0;

  if (retryCount >= MAX_RETRIES) {
    const statusMsg: string = statusCode !== undefined ? String(statusCode) : 'Timeout';
    console.error(`[HTTP ${statusMsg}] Max retries reached`);
    throw new Error(`Max retries reached for ${config.url ?? 'unknown'}`);
  }

  // Incrementar contador de reintentos
  config._retryCount = retryCount + 1;

  const statusMsg: string = statusCode !== undefined ? String(statusCode) : 'Timeout';
  console.warn(
    `[HTTP ${statusMsg}] Retrying request (${String(retryCount + 1)}/${String(MAX_RETRIES)})...`
  );

  // Esperar antes de reintentar (exponential backoff)
  const delay: number = RETRY_DELAY * 2 ** retryCount;
  await sleep(delay);

  // Reintentar la petición
  return await axiosClient.request(config);
}

/**
 * Handle HTTP error responses
 */
async function handleHttpError(
  status: number,
  config: ConfigWithRetry | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Response data can be any type
  responseData: any
): Promise<AxiosResponse> {
  switch (status) {
    case 401:
      // Unauthorized - Limpiar token y redirigir a login
      console.error('[HTTP 401] Unauthorized - Sesión expirada');
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.dispatchEvent(new Event('auth:unauthorized'));
      break;

    case 403:
      // Forbidden - No tiene permisos
      console.error('[HTTP 403] Forbidden - Acceso denegado');
      break;

    case 404:
      // Not Found - Recurso no existe (se maneja en cada repositorio)
      if (import.meta.env.DEV) {
        console.warn(`[HTTP 404] Not Found - ${config?.url ?? 'unknown'}`);
      }
      break;

    case 408:
    case 429:
    case 500:
    case 502:
    case 503:
    case 504:
      // Errores recuperables - Intentar retry
      if (config !== undefined) {
        return await handleRetry(config, status);
      }
      break;

    default:
      console.error('[HTTP Error]', String(status), responseData);
  }

  throw new Error(`HTTP Error ${String(status)}`);
}

export const axiosClient: AxiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Agregar token de autenticación si existe
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Agregar token de autenticación si existe
    const token: string | null = getAuthToken();
    if (token !== null) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log de requests en development
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- Development logging
      console.log(`[HTTP Request] ${config.method?.toUpperCase() ?? 'GET'} ${config.url ?? ''}`);
    }

    return config;
  },
  // eslint-disable-next-line promise/prefer-await-to-callbacks -- Axios error handler requires callback
  async (error: unknown): Promise<never> => {
    console.error('[HTTP Request Error]', error);
    // eslint-disable-next-line promise/no-promise-in-callback -- Axios requires promise rejection
    return await Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

// Response Interceptor - Manejo centralizado de errores con retry logic
axiosClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log de responses exitosas en development
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- Development logging
      console.log('[HTTP Response]', response.status, response.config.url);
    }
    return response;
  },
  // eslint-disable-next-line promise/prefer-await-to-callbacks -- Axios error handler requires callback
  async (error: unknown): Promise<AxiosResponse> => {
    if (!axios.isAxiosError(error)) {
      // eslint-disable-next-line promise/no-promise-in-callback -- Axios requires promise rejection
      return await Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }

    const { config }: { config?: InternalAxiosRequestConfig } = error;
    const configWithRetry: ConfigWithRetry | undefined = config;

    // Manejo de errores HTTP
    if (error.response !== undefined) {
      const { status }: { status: number } = error.response;
      return await handleHttpError(status, configWithRetry, error.response.data);
    }

    // Request enviado pero sin respuesta (timeout, network error)
    if (error.request !== undefined) {
      console.error('[HTTP Error] No response from server - Network or timeout error');
      if (configWithRetry !== undefined) {
        return await handleRetry(configWithRetry);
      }
    } else {
      // Error en configuración de la petición
      console.error('[HTTP Config Error]:', error.message);
    }

    // eslint-disable-next-line promise/no-promise-in-callback -- Axios requires promise rejection
    return await Promise.reject(error);
  }
);

/**
 * Type-safe HTTP client methods
 */
export const httpClient: {
  readonly get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  readonly post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  readonly put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  readonly patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  readonly delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
} = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await axiosClient.get<T>(url, config);
    return response.data;
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await axiosClient.post<T>(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await axiosClient.put<T>(url, data, config);
    return response.data;
  },

  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await axiosClient.patch<T>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await axiosClient.delete<T>(url, config);
    return response.data;
  },
};
