import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stocksense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('stocksense_token');
      localStorage.removeItem('stocksense_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Centralized API functions
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
};

export const dashboardApi = {
  getDashboard: () => api.get('/dashboard'),
};

export const productApi = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const inventoryApi = {
  list: () => api.get('/inventory'),
};

export const receiptApi = {
  list: (params) => api.get('/receipts', { params }),
  get: (id) => api.get(`/receipts/${id}`),
  create: (data) => api.post('/receipts', data),
  validate: (id) => api.post(`/receipts/${id}/validate`),
};

export const deliveryApi = {
  list: (params) => api.get('/deliveries', { params }),
  get: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  validate: (id) => api.post(`/deliveries/${id}/validate`),
};

export const transferApi = {
  list: (params) => api.get('/transfers', { params }),
  get: (id) => api.get(`/transfers/${id}`),
  create: (data) => api.post('/transfers', data),
  complete: (id) => api.post(`/transfers/${id}/complete`),
};

export const adjustmentApi = {
  list: (params) => api.get('/adjustments', { params }),
  get: (id) => api.get(`/adjustments/${id}`),
  create: (data) => api.post('/adjustments', data),
  apply: (id) => api.post(`/adjustments/${id}/apply`),
};

export const ledgerApi = {
  list: (params) => api.get('/stock-ledger', { params }),
};

export const referenceApi = {
  getWarehouses: () => api.get('/warehouses'),
  getLocations: () => api.get('/locations'),
  getLocationsByWarehouse: (whId) => api.get(`/warehouses/${whId}/locations`),
  getCategories: () => api.get('/categories'),
  getSuppliers: () => api.get('/suppliers'),
};

export default api;
