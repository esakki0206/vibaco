const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendPaymentConfirmed, sendOrderConfirmation, sendAdminNotification, sendAdminPaymentNotification } = require('../utils/emailService');

// Initialize Razorpay
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn("WARNING: Razorpay keys are missing in environment variables.");
}

// @desc    Create Razorpay Order (Secure)
// @route   POST /api/payments/create-order
// @route   POST /api/payments/guest/create-order
// @access  Private (for /create-order), Public (for /guest/create-order)
exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  if (!razorpay) throw new AppError(500, 'Payment gateway not configured');

  const { orderId } = req.body;
  if (!orderId) throw new AppError(400, 'Order ID is required');

  // 1. Fetch Order from DB to ensure amount is correct (Security)
  const order = await Order.findById(orderId);
  if (!order) throw new AppError(404, 'Order not found');

  // 2. Create Razorpay Order
  const options = {
    amount: Math.round(order.totalAmount * 100), // Amount in smallest currency unit (paise)
    currency: 'INR',
    receipt: `receipt_${order.orderNumber}`,
    payment_capture: 1 // Auto capture
  };

  try {
    const response = await razorpay.orders.create(options);

    res.json({
      success: true,
      id: response.id,
      currency: response.currency,
      amount: response.amount,
      key: process.env.RAZORPAY_KEY_ID // Send key to frontend safely
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    throw new AppError(502, 'Failed to create payment order with gateway');
  }
});

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @route   POST /api/payments/guest/verify
// @access  Private (for /verify), Public (for /guest/verify)
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = req.body;

  // 1. Basic Validation
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    throw new AppError(400, 'Missing payment verification details');
  }

  const order = await Order.findById(orderId).populate('user', 'name email');
  if (!order) throw new AppError(404, 'Order not found');

  // 2. Verify Signature (HMAC SHA256)
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    const paidAt = new Date();

    // 3. Save Payment Record
    // Check if payment already exists to prevent duplicates
    let payment = await Payment.findOne({ transactionId: razorpay_payment_id });

    if (!payment) {
      const userId = req.user?._id || order.user || null;
      payment = await Payment.create({
        order: order._id,
        user: userId,
        amount: order.totalAmount,
        paymentMethod: 'razorpay',
        paymentStatus: 'completed',
        razorpayDetails: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature
        },
        transactionId: razorpay_payment_id,
        paymentDate: paidAt
      });
    }

    // 4. Update Order Status & payment details
    order.paymentStatus = 'completed';
    // Status stays 'pending' — admin will manually confirm
    order.paymentDetails = {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      transactionId: razorpay_payment_id,
      paymentDate: paidAt,
      gatewayName: 'Razorpay',
      amount: order.totalAmount,
      currency: 'INR'
    };

    // ✅ Add status history entry
    order.statusHistory.push({
      status: 'pending',
      note: `Payment verified via Razorpay (${razorpay_payment_id}). Awaiting admin confirmation.`
    });

    await order.save();

    // 5. Send Emails (All wrapped in try/catch — never block the payment response)

    // 5a. Send order confirmation email to the CUSTOMER
    try {
      if (!order.emailNotifications?.confirmationSent) {
        console.log(`📧 Sending order confirmation email to customer for order ${order.orderNumber}...`);
        const confirmResult = await sendOrderConfirmation(order);
        if (confirmResult?.success) {
          order.emailNotifications.confirmationSent = true;
          order.emailNotifications.confirmationSentAt = new Date();
          console.log(`✅ Order confirmation email sent for ${order.orderNumber}`);
        }
      }
    } catch (emailErr) {
      console.error(`❌ Failed to send confirmation email for ${order.orderNumber}:`, emailErr.message);
    }

    // 5b. Send payment receipt email to the CUSTOMER
    try {
      console.log(`📧 Sending payment receipt email for order ${order.orderNumber}...`);
      await sendPaymentConfirmed(order);
    } catch (emailErr) {
      console.error(`❌ Failed to send payment receipt for ${order.orderNumber}:`, emailErr.message);
    }

    // 5c. Send payment notification to ADMIN with Razorpay details
    try {
      if (!order.emailNotifications?.adminPaymentNotificationSent) {
        console.log(`📧 Sending admin payment notification for order ${order.orderNumber}...`);
        const adminResult = await sendAdminPaymentNotification(order);
        if (adminResult?.success) {
          order.emailNotifications.adminPaymentNotificationSent = true;
          order.emailNotifications.adminPaymentNotificationSentAt = new Date();
          console.log(`✅ Admin payment notification sent for ${order.orderNumber}`);
        }
      }
    } catch (emailErr) {
      console.error(`❌ Failed to send admin payment notification for ${order.orderNumber}:`, emailErr.message);
    }

    // Save email tracking updates
    try {
      await order.save();
    } catch (saveErr) {
      console.error(`❌ Failed to save email tracking for ${order.orderNumber}:`, saveErr.message);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully. Awaiting admin confirmation.',
      paymentId: payment._id
    });
  } else {
    // Log failure
    const userId = req.user?._id || order.user || null;

    await Payment.create({
      order: order._id,
      user: userId,
      amount: order.totalAmount,
      paymentMethod: 'razorpay',
      paymentStatus: 'failed',
      failureReason: 'Invalid Signature',
      razorpayDetails: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature
      }
    });

    // Update order payment status to failed
    order.paymentStatus = 'failed';
    order.statusHistory.push({
      status: 'pending',
      note: 'Payment verification failed: Invalid Signature'
    });
    await order.save();

    throw new AppError(400, 'Payment verification failed: Invalid Signature');
  }
});
// @desc    Initiate Cash on Delivery
// @route   POST /api/payments/cod
// @access  Private
exports.initiateCoD = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw new AppError(400, 'Order ID is required');

  const order = await Order.findById(orderId);
  if (!order) throw new AppError(404, 'Order not found');

  // Just record the intent, actual payment happens on delivery
  await Payment.create({
    order: orderId,
    user: req.user._id,
    amount: order.totalAmount,
    paymentMethod: 'cod',
    paymentStatus: 'pending'
  });

  // Status stays 'pending' — admin will manually confirm
  await order.save();

  res.json({ success: true, message: 'Order placed with Cash on Delivery' });
});

exports.getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ order: req.params.orderId });
  res.json({ success: true, payment });
});