/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable promise/no-promise-in-callback */

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

export const axiosClient: AxiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Agregar token de autenticación si existe
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig =>
    // Aquí puedes agregar tokens de autenticación
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    config,
  async (error: unknown): Promise<never> =>
    await Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

// Response Interceptor - Manejo centralizado de errores
axiosClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: unknown): Promise<never> => {
    if (axios.isAxiosError(error)) {
      // Manejo de errores HTTP
      if (error.response !== undefined) {
        switch (error.response.status) {
          case 401:
            // Unauthorized - Redirigir a login
            console.error('No autorizado');
            break;
          case 403:
            // Forbidden
            console.error('Acceso prohibido');
            break;
          case 404:
            // Not Found
            console.error('Recurso no encontrado');
            break;
          case 500:
            // Internal Server Error
            console.error('Error del servidor');
            break;
          default:
            console.error('Error HTTP:', error.response.status);
        }
      } else if (error.request !== undefined) {
        // Request enviado pero sin respuesta
        console.error('Sin respuesta del servidor');
      }
    }

    return await Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

/**
 * Type-safe HTTP client methods
 */
export const httpClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.get<T>(url, config);
    return response.data;
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.post<T>(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.put<T>(url, data, config);
    return response.data;
  },

  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.patch<T>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.delete<T>(url, config);
    return response.data;
  },
};
