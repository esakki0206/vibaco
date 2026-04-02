const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // For guest checkouts this may be null. For logged-in
    // users (retailers/customers) it will be populated.
    required: false
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'card', 'upi', 'netbanking', 'wallet', 'cod'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['initiated', 'pending', 'completed', 'failed', 'refunded', 'partial_refund'],
    default: 'initiated'
  },
  razorpayDetails: {
    orderId: String,
    paymentId: String,
    signature: String
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentDate: { type: Date, default: null },
  failureReason: String,
  refundDetails: {
    refundId: String,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    },
    refundedAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
