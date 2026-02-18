import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const apiRequests = {
  get: <T = any>(url: string, params?: any) => api.get<T>(url, { params }),
  post: <T = any>(url: string, data?: any) => api.post<T>(url, data),
  put: <T = any>(url: string, data?: any) => api.put<T>(url, data),
  patch: <T = any>(url: string, data?: any) => api.patch<T>(url, data),
  delete: (url: string) => api.delete(url),
};

export default api;
