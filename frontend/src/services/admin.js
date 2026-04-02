import api from './api';

// Admin API service
const adminApi = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Analytics
  getAnalyticsOverview: async (params = {}) => {
    const response = await api.get('/admin/analytics/overview', { params });
    return response.data;
  },

  getTopSellingProducts: async (params = {}) => {
    const response = await api.get('/admin/analytics/top-products', { params });
    return response.data;
  },

  getDiscountAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/discounts', { params });
    return response.data;
  },

  // Coupons
  createCoupon: async (couponData) => {
    const response = await api.post('/admin/coupons', couponData);
    return response.data;
  },

  getCoupons: async () => {
    const response = await api.get('/admin/coupons');
    return response.data;
  },

  deleteCoupon: async (couponId) => {
    const response = await api.delete(`/admin/coupons/${couponId}`);
    return response.data;
  },

  // Products
  getProducts: async (params = {}) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await api.put(`/admin/products/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  },

  updateProductDiscount: async (productId, discountData) => {
    const response = await api.put(`/admin/products/${productId}/discount`, discountData);
    return response.data;
  },

  // Stock Management
  getLowStockProducts: async (threshold = 10) => {
    const response = await api.get(`/admin/products/low-stock?threshold=${threshold}`);
    return response.data;
  },

  bulkUpdateStock: async (updates) => {
    const response = await api.put('/admin/products/stock', { updates });
    return response.data;
  },

  // Orders
  getOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  getOrderDetails: async (orderId) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, statusData) => {
    const response = await api.put(`/admin/orders/${orderId}/status`, statusData);
    return response.data;
  },

  resendOrderEmail: async (orderId, emailData) => {
    const response = await api.post(`/admin/orders/${orderId}/resend-email`, emailData);
    return response.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserStatus: async (userId, statusData) => {
    const response = await api.put(`/admin/users/${userId}/status`, statusData);
    return response.data;
  },

  // --- Reseller Management ---
  getResellers: async (params = {}) => {
    // GET /admin/resellers returns all resellers; optional ?status=pending|approved|rejected
    const response = await api.get('/admin/resellers', { params });
    return response.data;
  },

  updateResellerStatus: async (userId, status) => {
    // status: 'approved', 'rejected', etc.
    const response = await api.put(`/admin/resellers/${userId}/status`, { status });
    return response.data;
  },
  // -------------------------------

  // File Upload
  uploadImage: async (formData) => {
    const response = await api.post('/admin/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Export
  exportOrders: async (params = {}) => {
    const response = await api.get('/admin/orders/export', { params });
    return response.data;
  },

  // Activities
  getRecentActivities: async (limit = 20) => {
    const response = await api.get(`/admin/activities/recent?limit=${limit}`);
    return response.data;
  },

  // Legacy compatibility methods
  getSalesByDate: async (params = {}) => {
    const response = await api.get('/admin/analytics/sales-by-date', { params });
    return response.data;
  },

  getTopProducts: async (params = {}) => {
    const response = await api.get('/admin/analytics/top-products-legacy', { params });
    return response.data;
  },

  getLowStockAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/low-stock', { params });
    return response.data;
  },

  getOrderSummary: async (params = {}) => {
    const response = await api.get('/admin/analytics/orders', { params });
    return response.data;
  }
};

export { adminApi };