const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  createGuestOrder,
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder,
  cancelPendingOrder,
  resendOrderEmail
} = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { validateOrderInput } = require('../middleware/validation');

// Customer routes (protected – for logged-in users, e.g. retailers/customers)
router.post('/create', verifyToken, validateOrderInput, createOrder);  // POST /api/orders/create
router.get('/', verifyToken, getOrders);  // GET /api/orders
router.get('/:id', verifyToken, getOrderById);  // GET /api/orders/:id
router.post('/:id/cancel', verifyToken, cancelOrder);  // POST /api/orders/:id/cancel

// Guest customer checkout (no login required)
router.post('/guest-create', validateOrderInput, createGuestOrder);  // POST /api/orders/guest-create

// Cancel pending-unpaid order (no auth – for guests and logged-in alike)
router.post('/cancel-pending/:orderId', cancelPendingOrder);  // POST /api/orders/cancel-pending/:orderId

// Admin routes (protected + admin)
router.put('/:id/status', verifyToken, verifyAdmin, updateOrderStatus);  // PUT /api/orders/:id/status
router.post('/:id/resend-email', verifyToken, verifyAdmin, resendOrderEmail);  // POST /api/orders/:id/resend-email

module.exports = router;
