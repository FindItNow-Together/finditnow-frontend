import axios from 'axios';
import { Shop, ShopRequest } from '@/types/shop';
import { Product, ProductRequest } from '@/types/product';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Shop API - Functions for interacting with shop-related endpoints
export const shopApi = {
  // Register a new shop
  register: (data: ShopRequest) => api.post<Shop>('/api/v1/shops', data),

  // Get all shops owned by the current user (SHOP OWNER only)
  getMyShops: () => api.get<Shop[]>('/api/v1/shops/mine'),

  // Get ALL shops in the system (ADMIN only) ← THIS LINE IS MISSING!
  getAllShops: () => api.get<Shop[]>('/api/v1/shops'),

  // Get a specific shop by its ID
  getShop: (id: number) => api.get<Shop>(`/api/v1/shops/${id}`),

  // Delete a single shop by its ID
  delete: (id: number) => api.delete(`/api/v1/shops/${id}`),

  // Delete multiple shops at once (bulk delete)
  deleteMultiple: (shopIds: number[]) => api.delete('/api/v1/shops/bulk', { data: shopIds }),
};

// Product API
export const productApi = {
  add: (shopId: number, data: ProductRequest) =>
    api.post<Product>(`/api/v1/shops/${shopId}/products`, data),
  getByShop: (shopId: number) =>
    api.get<Product[]>(`/api/v1/shops/${shopId}/products`),
  update: (id: number, data: ProductRequest) =>
    api.put<Product>(`/api/v1/products/${id}`, data),
  delete: (id: number) => api.delete(`/api/v1/products/${id}`),
  deleteMultiple: (productIds: number[]) => api.delete('/api/v1/products/bulk', { data: productIds }),
};

export default api;
