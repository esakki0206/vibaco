import api from './api';

export const paymentApi = {
  
  // ✅ SECURE: Send only orderId. Backend calculates amount.
  // If isReseller is true, hits authenticated route; otherwise uses guest route.
  createRazorpayOrder: async ({ orderId, isReseller = false }) => {
    const url = isReseller ? '/payments/create-order' : '/payments/guest/create-order';
    const response = await api.post(url, { orderId });
    return response.data;
  },

  // ✅ Verify Signature
  // verificationData = { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
  verifyPayment: async (verificationData, isReseller = false) => {
    const url = isReseller ? '/payments/verify' : '/payments/guest/verify';
    const response = await api.post(url, verificationData);
    return response.data;
  },

  // ✅ Cash on Delivery (kept for authenticated flows like retailers/admin)
  initiateCoD: async ({ orderId }) => {
    const response = await api.post('/payments/cod', { orderId });
    return response.data;
  },

  // ✅ Get Status (Used in Admin/Order Details – remains authenticated)
  getPaymentStatus: async (orderId) => {
    const response = await api.get(`/payments/${orderId}`);
    return response.data;
  }
};

export default paymentApi;