import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  let token = Cookies.get('token')
  
  if (!token && typeof window !== 'undefined') {
    const path = window.location.pathname
    if (path.startsWith('/admin')) {
      token = Cookies.get('token_admin')
    } else if (path.startsWith('/customer')) {
      token = Cookies.get('token_customer')
    }
    
    if (token) {
      const role = path.startsWith('/admin') ? 'admin' : 'customer'
      Cookies.set('token', token, { expires: 7, path: '/' })
      Cookies.set('role', role, { expires: 7, path: '/' })
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        let roleToken = null
        let role = null
        
        if (path.startsWith('/admin')) {
          roleToken = Cookies.get('token_admin')
          role = 'admin'
        } else if (path.startsWith('/customer')) {
          roleToken = Cookies.get('token_customer')
          role = 'customer'
        }
        
        if (roleToken && role) {
          Cookies.set('token', roleToken, { expires: 7, path: '/' })
          Cookies.set('role', role, { expires: 7, path: '/' })
          return api.request(error.config)
        }
        
        Cookies.remove('token', { path: '/' })
        Cookies.remove('role', { path: '/' })
        window.location.href = path.startsWith('/admin') ? '/admin/login' : '/customer/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
}

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// Product APIs
export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
}

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data: any) => api.post('/cart', data),
  update: (id: string, data: any) => api.put(`/cart/${id}`, data),
  remove: (id: string) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
}

// Order APIs
export const orderAPI = {
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
}

// Complaint APIs
export const complaintAPI = {
  getAll: (params?: any) => api.get('/complaints', { params }),
  getById: (id: string) => api.get(`/complaints/${id}`),
  create: (data: any) => api.post('/complaints', data),
  updateStatus: (id: string, status: string, response?: string) =>
    api.put(`/complaints/${id}/status`, { status, response }),
}

// Customer APIs
export const customerAPI = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
}

// Transaction APIs
export const transactionAPI = {
  getAll: (params?: any) => api.get('/transactions', { params }),
  getByOrder: (orderId: string) => api.get(`/transactions/order/${orderId}`),
}

// Pricing APIs
export const pricingAPI = {
  getAll: () => api.get('/pricing'),
  update: (productId: string, price: number) =>
    api.put(`/pricing/${productId}`, { price }),
}

// Wallet APIs
export const walletAPI = {
  get: () => api.get('/wallet'),
  addMoney: (amount: number, paymentMethod: string) =>
    api.post('/wallet/add-money', { amount, payment_method: paymentMethod }),
  getTransactions: () => api.get('/wallet/transactions'),
}

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
}

