const express = require('express');
const router = express.Router();
const { 
  createRazorpayOrder, // Updated Function Name
  verifyPayment, 
  initiateCoD, 
  getPaymentStatus 
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

// Authenticated payment routes (for logged-in users / retailers)
router.post('/create-order', verifyToken, createRazorpayOrder); // Matches Frontend (authenticated)
router.post('/verify', verifyToken, verifyPayment);
router.post('/cod', verifyToken, initiateCoD);
router.get('/:orderId', verifyToken, getPaymentStatus);

// Guest payment routes (no login required, used for guest checkout)
router.post('/guest/create-order', createRazorpayOrder);
router.post('/guest/verify', verifyPayment);

module.exports = router;