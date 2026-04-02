// services/cart.js
import api from './api';

// Get current user's cart
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

// ✅ FIX: Changed endpoint from /cart to /cart/add
export const addToCart = async (item, quantity = 1) => {
  const response = await api.post('/cart/add', {
    ...item,
    quantity
  });
  return response.data;
};

// Update item quantity
// ✅ Uses PUT /cart/:itemId (can be line item _id or product _id)
export const updateCartItem = async (cartItemId, quantity) => {
  const response = await api.put(`/cart/${cartItemId}`, { quantity });
  return response.data;
};


// ✅ Remove single item (by line item _id)
export const removeFromCart = async (itemId) => {
  const response = await api.delete(`/cart/${itemId}`);
  return response.data;
};

// Clear entire cart
export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

// Merge guest cart on login
export const mergeCart = async (guestCartItems) => {
  const response = await api.post('/cart/merge', { guestCartItems });
  return response.data;
};

// Validate Coupon Code
export const validateCoupon = async (couponData) => {
  const response = await api.post('/cart/validate-coupon', couponData);
  return response.data;
};

export const cartApi = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
  validateCoupon
};

export default cartApi;