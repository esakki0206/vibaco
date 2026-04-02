const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { validationResult } = require('express-validator');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendOrderConfirmation, sendOrderShipped, sendOrderDelivered, sendAdminNotification } = require('../utils/emailService');

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SR${timestamp}${random}`;
};

// @desc    Create new order (logged-in users: retailers/customers)
// @route   POST /api/orders/create
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const { items, shippingAddress, paymentMethod, couponCode } = req.body;
  const userRole = req.user.role;

  // ✅ STRICT VALIDATION: Block COD
  if (paymentMethod === 'cod') {
    throw new AppError(400, 'Cash on Delivery is currently unavailable. Please use online payment.');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, 'Order items are required');
  }

  const orderItems = [];
  let subtotal = 0;
  let totalShipping = 0;
  let totalTax = 0;

  // 1. Process Items (Calculate Costs & Deduct Stock)
  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) throw new AppError(404, `Product not found: ${item.product}`);
    if (product.stock < item.quantity) throw new AppError(400, `Insufficient stock for ${product.name}`);

    // ✅ FIX: Use same discount logic as cartController to avoid price mismatch
    let unitPrice;
    if (userRole === 'reseller') {
      unitPrice = product.wholesalePrice > 0 ? product.wholesalePrice : product.price;
    } else {
      // Apply discount if a discountPercentage is set (mirrors cart logic)
      const hasDiscount = product.discountPercentage > 0;
      unitPrice = hasDiscount
        ? Math.round(product.price * (1 - product.discountPercentage / 100))
        : product.price;
    }

    const lineTotal = unitPrice * item.quantity;

    // Shipping
    const shippingRate = userRole === 'reseller'
      ? (product.wholesale?.shippingCost || 0)
      : (product.retail?.shippingCost || 0);
    const itemShipping = shippingRate * item.quantity;

    // Tax
    const taxRate = userRole === 'reseller'
      ? (product.wholesale?.taxPercentage || 0)
      : (product.retail?.taxPercentage || 0);
    const itemTax = (lineTotal * taxRate) / 100;

    // Stock Management
    product.stock -= item.quantity;
    await product.save();

    // Image Handling
    let productImage = '';

    // Fallback to the main product image
    if (product.images && product.images.length > 0) {
      const firstImg = product.images[0];
      if (firstImg.url && typeof firstImg.url === 'string') {
        productImage = firstImg.url;
      } else if (firstImg.imageId) {
        productImage = firstImg.imageId.toString();
      }
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: productImage,
      quantity: item.quantity,
      price: unitPrice,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      taxAmount: Math.round(itemTax * 100) / 100,
      shippingAmount: itemShipping
    });

    subtotal += lineTotal;
    totalShipping += itemShipping;
    totalTax += itemTax;
  }

  totalTax = Math.round(totalTax * 100) / 100;

  // 2. Handle Coupons
  let couponDiscount = 0;
  let couponDetails = null;

  if (couponCode && userRole !== 'reseller') {
    // ✅ FIX: Use correct Coupon model fields (expirationDate, not startDate/endDate)
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      expirationDate: { $gte: new Date() }
    });

    const orderTotal = subtotal + totalShipping + totalTax;

    if (coupon && orderTotal >= coupon.minOrderValue) {
      // ✅ FIX: Use discountPercentage (not discountValue/discountType)
      if (coupon.scope === 'all') {
        // Apply to total order amount (matches validateCoupon logic)
        couponDiscount = (orderTotal * coupon.discountPercentage) / 100;
      } else if (coupon.scope === 'specific' && coupon.applicableProducts?.length > 0) {
        // Apply only to eligible product line totals
        const applicableIds = coupon.applicableProducts.map(id => id.toString());
        let eligibleTotal = 0;
        orderItems.forEach(item => {
          if (applicableIds.includes(item.product.toString())) {
            eligibleTotal += item.price * item.quantity;
          }
        });
        if (eligibleTotal > 0) {
          couponDiscount = (eligibleTotal * coupon.discountPercentage) / 100;
        }
      }

      // Clamp: coupon discount can never exceed the order total
      couponDiscount = Math.min(Math.round(couponDiscount), orderTotal);

      if (couponDiscount > 0) {
        couponDetails = {
          code: coupon.code,
          discountAmount: couponDiscount,
          percentage: coupon.discountPercentage
        };
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  // 3. Final Total (Subtotal + Shipping + Tax - Coupon)
  const totalAmount = Math.round((subtotal + totalShipping + totalTax - couponDiscount) * 100) / 100;

  // 4. Create Order (Status: Pending Payment)
  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    customerEmail: req.user.email,
    customerPhone: shippingAddress.phone,
    items: orderItems,
    shippingAddress,
    paymentMethod: 'razorpay', // ✅ Enforce Razorpay
    subtotal,
    shippingCost: totalShipping,
    tax: totalTax,
    couponDiscount,
    couponDetails,
    totalAmount,
    status: 'pending',
    paymentStatus: 'pending' // Waits for Payment Controller to verify
  });

  await Cart.findOneAndDelete({ user: req.user._id });

  // ✅ Send admin notification email (non-blocking)
  try {
    console.log(`📧 Sending admin notification for new order ${order.orderNumber}...`);
    const adminResult = await sendAdminNotification(order);
    if (adminResult?.success) {
      order.emailNotifications = order.emailNotifications || {};
      order.emailNotifications.adminNotificationSent = true;
      order.emailNotifications.adminNotificationSentAt = new Date();
      await order.save();
      console.log(`✅ Admin notification sent for order ${order.orderNumber}`);
    }
  } catch (emailErr) {
    console.error(`❌ Failed to send admin notification for ${order.orderNumber}:`, emailErr.message);
  }

  res.status(201).json({
    success: true,
    message: 'Order created, awaiting payment',
    order
  });
});

// @desc    Create new order (guest customers – no login required)
// @route   POST /api/orders/guest-create
// @access  Public
exports.createGuestOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const { items, shippingAddress, paymentMethod, couponCode, customerEmail } = req.body;

  // Basic checks for required guest info
  if (!customerEmail) {
    throw new AppError(400, 'Customer email is required');
  }

  // Treat guest customers as normal retail customers for pricing/shipping
  const userRole = 'customer';

  // Block COD for guests too (only online)
  if (paymentMethod === 'cod') {
    throw new AppError(400, 'Cash on Delivery is currently unavailable. Please use online payment.');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, 'Order items are required');
  }

  const orderItems = [];
  let subtotal = 0;
  let totalShipping = 0;
  let totalTax = 0;

  // Process Items (same logic as logged-in flow)
  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) throw new AppError(404, `Product not found: ${item.product}`);
    if (product.stock < item.quantity) throw new AppError(400, `Insufficient stock for ${product.name}`);

    // ✅ FIX: Use same discount logic as cartController to avoid price mismatch
    let unitPrice;
    if (userRole === 'reseller') {
      unitPrice = product.wholesalePrice > 0 ? product.wholesalePrice : product.price;
    } else {
      const hasDiscount = product.discountPercentage > 0;
      unitPrice = hasDiscount
        ? Math.round(product.price * (1 - product.discountPercentage / 100))
        : product.price;
    }

    const lineTotal = unitPrice * item.quantity;

    const shippingRate = userRole === 'reseller'
      ? (product.wholesale?.shippingCost || 0)
      : (product.retail?.shippingCost || 0);
    const itemShipping = shippingRate * item.quantity;

    const taxRate = userRole === 'reseller'
      ? (product.wholesale?.taxPercentage || 0)
      : (product.retail?.taxPercentage || 0);
    const itemTax = (lineTotal * taxRate) / 100;

    // Stock Management
    product.stock -= item.quantity;
    await product.save();

    // Image Handling
    let productImage = '';

    // Fallback to the main product image
    if (product.images && product.images.length > 0) {
      const firstImg = product.images[0];
      if (firstImg.url && typeof firstImg.url === 'string') {
        productImage = firstImg.url;
      } else if (firstImg.imageId) {
        productImage = firstImg.imageId.toString();
      }
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: productImage,
      quantity: item.quantity,
      price: unitPrice,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      taxAmount: Math.round(itemTax * 100) / 100,
      shippingAmount: itemShipping
    });

    subtotal += lineTotal;
    totalShipping += itemShipping;
    totalTax += itemTax;
  }

  totalTax = Math.round(totalTax * 100) / 100;

  // Coupons for guests – same behaviour as regular customers
  let couponDiscount = 0;
  let couponDetails = null;

  if (couponCode) {
    // ✅ FIX: Use correct Coupon model fields (expirationDate, not startDate/endDate)
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      expirationDate: { $gte: new Date() }
    });

    const orderTotal = subtotal + totalShipping + totalTax;

    if (coupon && orderTotal >= coupon.minOrderValue) {
      // ✅ FIX: Use discountPercentage and scope (matches validateCoupon logic)
      if (coupon.scope === 'all') {
        couponDiscount = (orderTotal * coupon.discountPercentage) / 100;
      } else if (coupon.scope === 'specific' && coupon.applicableProducts?.length > 0) {
        const applicableIds = coupon.applicableProducts.map(id => id.toString());
        let eligibleTotal = 0;
        orderItems.forEach(item => {
          if (applicableIds.includes(item.product.toString())) {
            eligibleTotal += item.price * item.quantity;
          }
        });
        if (eligibleTotal > 0) {
          couponDiscount = (eligibleTotal * coupon.discountPercentage) / 100;
        }
      }

      // Clamp: coupon discount can never exceed the order total
      couponDiscount = Math.min(Math.round(couponDiscount), orderTotal);

      if (couponDiscount > 0) {
        couponDetails = {
          code: coupon.code,
          discountAmount: couponDiscount,
          percentage: coupon.discountPercentage
        };
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  const totalAmount = Math.round((subtotal + totalShipping + totalTax - couponDiscount) * 100) / 100;

  // Create guest order (no user reference, but full contact details)
  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: null,
    customerEmail,
    customerPhone: shippingAddress.phone,
    items: orderItems,
    shippingAddress,
    paymentMethod: 'razorpay',
    subtotal,
    shippingCost: totalShipping,
    tax: totalTax,
    couponDiscount,
    couponDetails,
    totalAmount,
    status: 'pending',
    paymentStatus: 'pending'
  });

  // ✅ Send admin notification email for guest order (non-blocking)
  try {
    console.log(`📧 Sending admin notification for new guest order ${order.orderNumber}...`);
    const adminResult = await sendAdminNotification(order);
    if (adminResult?.success) {
      order.emailNotifications = order.emailNotifications || {};
      order.emailNotifications.adminNotificationSent = true;
      order.emailNotifications.adminNotificationSentAt = new Date();
      await order.save();
      console.log(`✅ Admin notification sent for guest order ${order.orderNumber}`);
    }
  } catch (emailErr) {
    console.error(`❌ Failed to send admin notification for guest order ${order.orderNumber}:`, emailErr.message);
  }

  res.status(201).json({
    success: true,
    message: 'Order created, awaiting payment',
    order
  });
});

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, courierName, trackingId } = req.body;

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new AppError(404, 'Order not found');

  // Validate required fields for shipped status
  if (status === 'shipped') {
    if (!courierName || !courierName.trim()) {
      throw new AppError(400, 'Courier name is required when marking order as shipped');
    }
    if (!trackingId || !trackingId.trim()) {
      throw new AppError(400, 'Tracking ID is required when marking order as shipped');
    }
  }

  // Store old status for logging
  const oldStatus = order.status;

  order.status = status;
  let statusNote = note || `Status updated to ${status}`;

  if (status === 'shipped') {
    statusNote = `Shipped via ${courierName} (Tracking: ${trackingId})`;

    order.trackingDetails = {
      courierName: courierName.trim(),
      trackingId: trackingId.trim(),
      shippedDate: new Date()
    };
  }

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = 'completed'; // Double check payment confirmed on delivery
  }

  order.statusHistory.push({ status, note: statusNote });
  await order.save();

  // ✅ SEND EMAILS - Always attempt to send based on status
  let emailSent = false;
  let emailError = null;

  try {
    console.log(`📧 Sending email for order ${order.orderNumber}, status: ${status}`);

    if (status === 'shipped') {
      console.log(`📧 Attempting to send SHIPPED email for order ${order.orderNumber}...`);
      const result = await sendOrderShipped(order);

      if (result && result.success) {
        order.emailNotifications.shippedSent = true;
        order.emailNotifications.shippedSentAt = new Date();
        emailSent = true;
        console.log(`✅ Shipped email sent successfully for order ${order.orderNumber}`);
      } else {
        emailError = result?.error || 'Unknown error';
        console.error(`❌ Failed to send shipped email for order ${order.orderNumber}:`, emailError);
      }

    } else if (status === 'delivered') {
      console.log(`📧 Attempting to send DELIVERED email for order ${order.orderNumber}...`);
      const result = await sendOrderDelivered(order);

      if (result && result.success) {
        order.emailNotifications.deliveredSent = true;
        order.emailNotifications.deliveredSentAt = new Date();
        emailSent = true;
        console.log(`✅ Delivered email sent successfully for order ${order.orderNumber}`);
      } else {
        emailError = result?.error || 'Unknown error';
        console.error(`❌ Failed to send delivered email for order ${order.orderNumber}:`, emailError);
      }

    } else if (status === 'confirmed' || status === 'processing') {
      // Send confirmation email when confirming order
      if (!order.emailNotifications.confirmationSent) {
        console.log(`📧 Attempting to send CONFIRMATION email for order ${order.orderNumber}...`);
        const result = await sendOrderConfirmation(order);

        if (result && result.success) {
          order.emailNotifications.confirmationSent = true;
          order.emailNotifications.confirmationSentAt = new Date();
          emailSent = true;
          console.log(`✅ Confirmation email sent successfully for order ${order.orderNumber}`);
        } else {
          emailError = result?.error || 'Unknown error';
          console.error(`❌ Failed to send confirmation email for order ${order.orderNumber}:`, emailError);
        }
      }
    }

    // Save email notification updates
    if (emailSent) {
      await order.save();
    }

  } catch (emailException) {
    // Log but don't fail the status update
    console.error(`❌ Email sending exception for order ${order.orderNumber}:`, emailException);
    emailError = emailException.message;
  }

  // Return response with email status
  res.json({
    success: true,
    message: `Order status updated from ${oldStatus} to ${status}${emailSent ? ' and email sent' : ''}`,
    emailStatus: emailSent ? 'sent' : 'failed',
    emailError: emailError || undefined,
    order
  });
});

exports.getUserOrders = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { user: req.user._id };

  if (req.query.status) {
    query.status = req.query.status;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.product', 'name images colorImages colors');

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    count: orders.length,
    total,
    orders
  });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images colorImages colors specifications');

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  // Allow admin; for others require order to belong to user (handle guest: order.user may be null)
  const isAdmin = req.user.role === 'admin';
  const isOwner = order.user && order.user._id && order.user._id.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) {
    throw new AppError(403, 'Not authorized to access this order');
  }

  res.json({
    success: true,
    order
  });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError(403, 'Not authorized to cancel this order');
  }

  if (['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.status)) {
    throw new AppError(400, 'Order cannot be cancelled');
  }

  order.status = 'cancelled';
  order.statusHistory.push({
    status: 'cancelled',
    note: 'Order cancelled by user'
  });
  await order.save();

  for (const item of order.items) {
    const product = await Product.findById(item.product);

    product.stock += item.quantity;
    await product.save();
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    order
  });
});

exports.trackOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError(403, 'Not authorized to access this order');
  }

  res.json({
    success: true,
    tracking: {
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: order.statusHistory,
      trackingDetails: order.trackingDetails,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt
    }
  });
});

exports.addOrderNote = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const { note } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  order.notes = note;
  await order.save();

  res.json({
    success: true,
    message: 'Note added successfully',
    order
  });
});

exports.getOrders = exports.getUserOrders;

// @desc    Cancel a pending-unpaid order and restore stock (works for guests too)
// @route   POST /api/orders/cancel-pending/:orderId
// @access  Public (order must still be in pending+unpaid state)
exports.cancelPendingOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) throw new AppError(404, 'Order not found');

  // Only allow cancellation of orders that are still pending payment
  if (order.status !== 'pending' || order.paymentStatus !== 'pending') {
    throw new AppError(400, 'Only pending-unpaid orders can be cancelled this way');
  }

  // Restore stock for each item
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    product.stock += item.quantity;
    await product.save();
  }

  order.status = 'cancelled';
  order.paymentStatus = 'failed';
  order.statusHistory.push({
    status: 'cancelled',
    note: 'Order cancelled – payment was not completed (user closed payment window)'
  });
  await order.save();

  res.json({ success: true, message: 'Order cancelled and stock restored.' });
});

// @desc    Resend order email (Admin)
// @route   POST /api/admin/orders/:id/resend-email
// @access  Private (Admin)
exports.resendOrderEmail = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const { emailType } = req.body;

  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  console.log(`📧 Attempting to resend ${emailType} email for order ${order.orderNumber}...`);

  let emailResult;

  try {
    switch (emailType) {
      case 'confirmation':
        emailResult = await sendOrderConfirmation(order);
        if (emailResult && emailResult.success) {
          order.emailNotifications.confirmationSent = true;
          order.emailNotifications.confirmationSentAt = new Date();
          console.log(`✅ Confirmation email resent successfully for order ${order.orderNumber}`);
        }
        break;

      case 'shipped':
        emailResult = await sendOrderShipped(order);
        if (emailResult && emailResult.success) {
          order.emailNotifications.shippedSent = true;
          order.emailNotifications.shippedSentAt = new Date();
          console.log(`✅ Shipped email resent successfully for order ${order.orderNumber}`);
        }
        break;

      case 'delivered':
        emailResult = await sendOrderDelivered(order);
        if (emailResult && emailResult.success) {
          order.emailNotifications.deliveredSent = true;
          order.emailNotifications.deliveredSentAt = new Date();
          console.log(`✅ Delivered email resent successfully for order ${order.orderNumber}`);
        }
        break;

      default:
        throw new AppError(400, 'Invalid email type');
    }

    // Check if email was successful
    if (!emailResult || !emailResult.success) {
      const errorMsg = emailResult?.error || 'Email service returned failure';
      console.error(`❌ Failed to send ${emailType} email:`, errorMsg);
      throw new AppError(500, `Failed to send ${emailType} email: ${errorMsg}`);
    }

    await order.save();

    res.json({
      success: true,
      message: `${emailType} email sent successfully to ${order.customerEmail}`,
      result: emailResult
    });

  } catch (emailError) {
    console.error(`❌ Failed to send ${emailType} email:`, emailError);

    // If it's already an AppError, rethrow it
    if (emailError instanceof AppError) {
      throw emailError;
    }

    // Otherwise create a new AppError with the details
    throw new AppError(500, `Failed to send ${emailType} email: ${emailError.message}`);
  }
});