const nodemailer = require('nodemailer');

// --- Configuration ---
const emailConfig = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net', port: 587, secure: false,
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
    });
  }
  if (process.env.EMAIL_SERVICE === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
    });
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
  });
};

const transporter = createTransporter();
const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

// --- Helper: Generate Product Table HTML ---
const generateOrderTable = (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="font-weight: bold; color: #333;">${item.name}</div>
        <div style="font-size: 12px; color: #777;">
          ${item.selectedSize ? `Size: ${item.selectedSize}` : ''} 
          ${item.selectedColor ? `| Color: ${item.selectedColor}` : ''}
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  return `
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
      <thead>
        <tr style="background-color: #f8f9fa;">
          <th style="padding: 10px; text-align: left; color: #555;">Item</th>
          <th style="padding: 10px; text-align: center; color: #555;">Qty</th>
          <th style="padding: 10px; text-align: right; color: #555;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; color: #555;">Subtotal:</td>
          <td style="padding: 10px; text-align: right;">${formatCurrency(order.subtotal || order.totalAmount)}</td>
        </tr>
        ${order.shippingCost > 0 ? `
        <tr>
          <td colspan="2" style="padding: 5px 10px; text-align: right; color: #555;">Shipping:</td>
          <td style="padding: 5px 10px; text-align: right;">${formatCurrency(order.shippingCost)}</td>
        </tr>` : ''}
        <tr>
          <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px; color: #333; border-top: 2px solid #eee;">Total:</td>
          <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px; color: #333; border-top: 2px solid #eee;">${formatCurrency(order.totalAmount)}</td>
        </tr>
      </tfoot>
    </table>
  `;
};

// --- Templates ---

const emailTemplates = {

  // 1. Order Confirmation
  orderConfirmation: (order) => ({
    subject: `Order Confirmed: #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; background-color: #ffffff;">
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-family: serif; font-size: 24px;">Sri Sai Stores</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-top: 0;">Thank you for your order!</h2>
          <p style="color: #555; line-height: 1.6;">
            Hi <strong>${order.shippingAddress.name}</strong>,<br>
            We have received your order and are currently processing it. Here are the details:
          </p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #555;"><strong>Order ID:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0 0; font-size: 14px; color: #555;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Order Summary</h3>
          ${generateOrderTable(order)}

          <div style="margin-top: 30px;">
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Shipping Address</h3>
            <p style="color: #555; line-height: 1.5; font-size: 14px;">
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
              Phone: ${order.shippingAddress.phone}
            </p>
          </div>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} Sri Sai Stores Collections. All rights reserved.
        </div>
      </div>
    `
  }),

  // 2. Order Shipped (With Tracking Box)
  orderShipped: (order) => ({
    subject: `Your Order #${order.orderNumber} has Shipped!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; background-color: #ffffff;">
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-family: serif; font-size: 24px;">Sri Sai Stores</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-top: 0;">On its way! 🚚</h2>
          <p style="color: #555; line-height: 1.6;">
            Great news, <strong>${order.shippingAddress.name}</strong>! Your order has been dispatched and is making its way to you.
          </p>
          
          <div style="border: 1px solid #b3e5fc; background-color: #e1f5fe; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="font-size: 14px; color: #0277bd; padding-bottom: 5px;"><strong>Status:</strong> Shipped</td>
              </tr>
              ${order.trackingDetails && order.trackingDetails.courierName ? `
              <tr>
                <td style="font-size: 14px; color: #0277bd; padding-bottom: 5px;">
                  <strong>Courier:</strong> ${order.trackingDetails.courierName}
                </td>
              </tr>` : ''}
              ${order.trackingDetails && order.trackingDetails.trackingId ? `
              <tr>
                <td style="font-size: 14px; color: #0277bd; padding-top: 10px; border-top: 1px solid #b3e5fc;">
                  <strong>Tracking Number:</strong> <span style="font-family: monospace; font-size: 16px;">${order.trackingDetails.trackingId}</span>
                </td>
              </tr>` : ''}
            </table>
          </div>

          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Items in this Shipment</h3>
          ${generateOrderTable(order)}

          <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
            Please note: Tracking information may take up to 24 hours to update on the courier's website.
          </p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} Sri Sai Stores Collections.
        </div>
      </div>
    `
  }),

  // 3. Order Delivered
  orderDelivered: (order) => ({
    subject: `Delivered: Order #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; background-color: #ffffff;">
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-family: serif; font-size: 24px;">Sri Sai Stores</h1>
        </div>
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 40px;">🎉</span>
          </div>
          <h2 style="color: #333; margin-top: 0; text-align: center;">Your Order has Arrived!</h2>
          <p style="color: #555; line-height: 1.6;">
            Hi <strong>${order.shippingAddress.name}</strong>,<br>
            Your order <strong>${order.orderNumber}</strong> has been marked as delivered. We hope you love your purchase!
          </p>

          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333; margin-top: 30px;">Recap of your Order</h3>
          ${generateOrderTable(order)}

        </div>
      </div>
    `
  }),

  // 4. Order Cancelled
  orderCancelled: (order) => ({
    subject: `Order Cancelled: #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; background-color: #ffffff;">
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-family: serif; font-size: 24px;">Sri Sai Stores</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #d32f2f; margin-top: 0;">Order Cancelled</h2>
          <p style="color: #555; line-height: 1.6;">
            Hi <strong>${order.shippingAddress.name}</strong>,<br>
            As requested, your order <strong>${order.orderNumber}</strong> has been cancelled.
          </p>

          ${order.paymentStatus === 'completed' || order.paymentStatus === 'paid' ? `
          <div style="background-color: #fff3e0; border: 1px solid #ffe0b2; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #e65100; font-weight: bold;">Refund Initiated</p>
            <p style="margin: 5px 0 0; color: #555; font-size: 14px;">
              Since you have already paid, a refund of <strong>${formatCurrency(order.totalAmount)}</strong> has been initiated to your original payment method. It usually takes 5-7 business days to reflect.
            </p>
          </div>` : ''}

          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Cancelled Items</h3>
          ${generateOrderTable(order)}

          <p style="color: #555; margin-top: 20px;">
            We hope to serve you again in the future.
          </p>
        </div>
      </div>
    `
  }),

  // 5. Admin Notification (New Order Placed)
  adminNotification: (order) => ({
    subject: `🛒 [New Order] ${order.orderNumber} - ${formatCurrency(order.totalAmount)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; background-color: #ffffff;">
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-family: serif; font-size: 24px;">Sri Sai Stores — Admin</h1>
        </div>
        <div style="padding: 30px;">
          <div style="background-color: #e8f5e9; border: 1px solid #c8e6c9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2e7d32; margin: 0 0 5px;">🛒 New Order Received!</h2>
            <p style="margin: 0; color: #555; font-size: 14px;">A new order has been placed and is awaiting payment.</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0 0 5px; font-size: 14px;"><strong>Order ID:</strong> ${order.orderNumber}</p>
            <p style="margin: 0 0 5px; font-size: 14px;"><strong>Customer:</strong> ${order.user?.name || order.shippingAddress?.name || 'Guest'}</p>
            <p style="margin: 0 0 5px; font-size: 14px;"><strong>Email:</strong> ${order.user?.email || order.customerEmail}</p>
            <p style="margin: 0 0 5px; font-size: 14px;"><strong>Phone:</strong> ${order.customerPhone || order.shippingAddress?.phone || 'N/A'}</p>
            <p style="margin: 0 0 5px; font-size: 14px;"><strong>Payment Method:</strong> ${(order.paymentMethod || 'razorpay').toUpperCase()}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Payment Status:</strong> <span style="color: #e65100; font-weight: bold;">${(order.paymentStatus || 'pending').toUpperCase()}</span></p>
          </div>

          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Order Items</h3>
          ${generateOrderTable(order)}

          <div style="margin-top: 20px;">
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Shipping Address</h3>
            <p style="color: #555; line-height: 1.5; font-size: 14px;">
              ${order.shippingAddress?.name || 'N/A'}<br>
              ${order.shippingAddress?.address || ''}<br>
              ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}<br>
              Phone: ${order.shippingAddress?.phone || 'N/A'}
            </p>
          </div>

          <div style="margin-top: 25px; text-align: center;">
            <a href="${process.env.FRONTEND_URL}/admin/orders/${order._id}" style="background: #1a1a1a; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Order in Dashboard</a>
          </div>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} Sri Sai Stores — Admin Notification
        </div>
      </div>
    `
  }),

  // 6. Admin Payment Received Notification
  adminPaymentReceived: (order) => ({
    subject: `✅ [Payment Received] ${order.orderNumber} - ${formatCurrency(order.totalAmount)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; background-color: #ffffff;">
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-family: serif; font-size: 24px;">Sri Sai Stores — Admin</h1>
        </div>
        <div style="padding: 30px;">
          <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1565c0; margin: 0 0 5px;">✅ Payment Verified & Order Confirmed</h2>
            <p style="margin: 0; color: #555; font-size: 14px;">Payment has been successfully received. The order status has been automatically updated to <strong>Confirmed</strong>.</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p style="margin: 0 0 5px; font-size: 14px;"><strong>Order ID:</strong> ${order.orderNumber}</p>
            <p style="margin: 0 0 5px; font-size: 14px;"><strong>Customer:</strong> ${order.user?.name || order.shippingAddress?.name || 'Guest'}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Email:</strong> ${order.user?.email || order.customerEmail}</p>
          </div>

          <div style="background-color: #f1f8e9; border: 1px solid #dcedc8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px; font-size: 13px; font-weight: bold; color: #33691e; text-transform: uppercase;">Payment Details</p>
            <p style="margin: 0 0 5px; font-size: 14px;"><strong>Amount:</strong> ${formatCurrency(order.totalAmount)}</p>
            <p style="margin: 0 0 5px; font-size: 14px;"><strong>Gateway:</strong> Razorpay</p>
            ${order.paymentDetails?.razorpayPaymentId ? `<p style="margin: 0 0 5px; font-size: 14px;"><strong>Razorpay Payment ID:</strong> <code style="background: #eee; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${order.paymentDetails.razorpayPaymentId}</code></p>` : ''}
            ${order.paymentDetails?.razorpayOrderId ? `<p style="margin: 0 0 5px; font-size: 14px;"><strong>Razorpay Order ID:</strong> <code style="background: #eee; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${order.paymentDetails.razorpayOrderId}</code></p>` : ''}
            ${order.paymentDetails?.paymentDate ? `<p style="margin: 0; font-size: 14px;"><strong>Payment Date:</strong> ${new Date(order.paymentDetails.paymentDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>` : ''}
          </div>

          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Order Items</h3>
          ${generateOrderTable(order)}

          <div style="margin-top: 25px; text-align: center;">
            <a href="${process.env.FRONTEND_URL}/admin/orders/${order._id}" style="background: #1a1a1a; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Order in Dashboard</a>
          </div>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} Sri Sai Stores — Admin Notification
        </div>
      </div>
    `
  }),

  // 7. Payment Confirmed (User Receipt)
  paymentConfirmed: (order) => ({
    subject: `Payment Receipt - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Payment Confirmed</h2>
        <p>We have received a payment of <strong>${formatCurrency(order.totalAmount)}</strong> for order #${order.orderNumber}.</p>
      </div>
    `
  }),
};

// --- Sending Logic ---
const sendEmail = async (to, template, data) => {
  try {
    const emailData = emailTemplates[template](data);
    const mailOptions = {
      from: { name: process.env.EMAIL_FROM_NAME || 'Sri Sai Stores', address: process.env.EMAIL_USER },
      to,
      subject: emailData.subject,
      html: emailData.html
    };
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendOrderConfirmation: (order) => sendEmail(order.user?.email || order.customerEmail, 'orderConfirmation', order),
  sendPaymentConfirmed: (order) => sendEmail(order.user?.email || order.customerEmail, 'paymentConfirmed', order),
  sendOrderShipped: (order) => sendEmail(order.user?.email || order.customerEmail, 'orderShipped', order),
  sendOrderDelivered: (order) => sendEmail(order.user?.email || order.customerEmail, 'orderDelivered', order),
  sendOrderCancelled: (order) => sendEmail(order.user?.email || order.customerEmail, 'orderCancelled', order),
  sendAdminNotification: (order) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.DEFAULT_ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      console.error('❌ No admin email configured. Set ADMIN_EMAIL in .env');
      return { success: false, error: 'No admin email configured' };
    }
    return sendEmail(adminEmail, 'adminNotification', order);
  },
  sendAdminPaymentNotification: (order) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.DEFAULT_ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      console.error('❌ No admin email configured. Set ADMIN_EMAIL in .env');
      return { success: false, error: 'No admin email configured' };
    }
    return sendEmail(adminEmail, 'adminPaymentReceived', order);
  }
};