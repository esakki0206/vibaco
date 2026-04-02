export const API_ENDPOINTS = {
  AUTH: '/auth',
  PRODUCTS: '/products',
  CART: '/cart',
  ORDERS: '/orders',
  PAYMENTS: '/payments',
  ADMIN: '/admin'
};

export const PRODUCT_CATEGORIES = [
  'Birthday Gifts',
  'Anniversary Gifts',
  'Wedding Gifts',
  'Personalized Gifts',
  'Kids Gifts',
  'Luxury Gifts',
  'Gift Hampers',
  'Festival Gifts'
];

export const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Festival', 'Corporate'];

export const FABRICS = ['Silk', 'Cotton', 'Chiffon', 'Georgette', 'Handloom'];

export const PRICE_RANGES = [
  { label: 'Under $5,000', min: 0, max: 5000 },
  { label: '$5,000 - $10,000', min: 5000, max: 10000 },
  { label: '$10,000 - $20,000', min: 10000, max: 20000 },
  { label: '$20,000+', min: 20000, max: Infinity }
];

export const PAYMENT_METHODS = {
  RAZORPAY: 'Razorpay',
  COD: 'COD'
};

export const ORDER_STATUS_LABELS = {
  'Pending': 'Order Placed',
  'Confirmed': 'Order Confirmed',
  'Processing': 'Processing',
  'Packed': 'Packed',
  'Shipped': 'Shipped',
  'Delivered': 'Delivered',
  'Cancelled': 'Cancelled',
  'Returned': 'Returned'
};
