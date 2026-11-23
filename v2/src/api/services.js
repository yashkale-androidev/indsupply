// The full REST contract the frontend expects from your backend. See README.md for payload shapes.
import { http } from './http.js';

export const authApi = {
  register: (b) => http.post('/auth/register', b),            // {name, company, mobile, email, password} -> {token, user}
  login: (b) => http.post('/auth/login', b),                  // {identifier, password} -> {token, user}
  requestOtp: (b) => http.post('/auth/otp/request', b),       // {identifier} -> {sent: true}
  verifyOtp: (b) => http.post('/auth/otp/verify', b),         // {identifier, otp} -> {token, user}
  forgotPassword: (b) => http.post('/auth/forgot-password', b),
  logout: () => http.post('/auth/logout'),
  me: () => http.get('/auth/me'),                             // -> user
};

export const categoryApi = { list: () => http.get('/categories') };

export const productApi = {
  list: (params) => http.get('/products', params),            // q, category, brand, minPrice, maxPrice, inStock, sort, page, pageSize, featured
  get: (id) => http.get(`/products/${id}`),
};

export const cartApi = {
  get: () => http.get('/cart'),                               // -> {items, summary, count}
  add: (productId, qty) => http.post('/cart/items', { productId, qty }),
  update: (productId, qty) => http.patch(`/cart/items/${productId}`, { qty }),
  remove: (productId) => http.delete(`/cart/items/${productId}`),
};

export const orderApi = {
  create: (b) => http.post('/orders', b),                     // {address, paymentMethod} -> order
  list: (params) => http.get('/orders', params),              // status
  get: (id) => http.get(`/orders/${id}`),
  cancel: (id) => http.post(`/orders/${id}/cancel`),
};

export const paymentApi = {
  create: (orderId) => http.post('/payments/create', { orderId }),   // -> {gatewayOrderId, amount, ...}
  verify: (b) => http.post('/payments/verify', b),                    // {orderId, gatewayPaymentId, signature?}
};

export const customerApi = {
  getProfile: () => http.get('/customers/me'),
  updateProfile: (b) => http.put('/customers/me', b),
};

export const supportApi = { send: (b) => http.post('/support', b) };

export const adminApi = {
  dashboard: () => http.get('/admin/dashboard'),
  products: (params) => http.get('/admin/products', params),
  createProduct: (b) => http.post('/admin/products', b),
  updateProduct: (id, b) => http.put(`/admin/products/${id}`, b),
  deleteProduct: (id) => http.delete(`/admin/products/${id}`),
  createCategory: (b) => http.post('/admin/categories', b),
  updateCategory: (slug, b) => http.put(`/admin/categories/${slug}`, b),
  deleteCategory: (slug) => http.delete(`/admin/categories/${slug}`),
  orders: (params) => http.get('/admin/orders', params),
  updateOrderStatus: (id, status) => http.patch(`/admin/orders/${id}/status`, { status }),
  customers: (params) => http.get('/admin/customers', params),
};
