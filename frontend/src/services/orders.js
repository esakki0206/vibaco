import api from './api';

export const createOrder = async (orderData) => {
  const response = await api.post('/orders/create', orderData);
  return response.data;
};

// Guest checkout – does not require auth token
export const createGuestOrder = async (orderData) => {
  const response = await api.post('/orders/guest-create', orderData);
  return response.data;
};

export const getUserOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId, reason) => {
  const response = await api.post(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};

// Cancel a pending-unpaid order (no auth required – works for guests)
export const cancelPendingOrder = async (orderId) => {
  const response = await api.post(`/orders/cancel-pending/${orderId}`);
  return response.data;
};

export const orderApi = {
  createOrder,
  createGuestOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  cancelPendingOrder
};

export default orderApi;
