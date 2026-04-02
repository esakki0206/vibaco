# API Documentation

## Base URL
```
Production: https://api.sareestore.com/api
Development: http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]  // Optional, for validation errors
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+919876543210"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Logout (Protected)
```http
POST /auth/logout
Authorization: Bearer <token>
```

#### Get Current User (Protected)
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Update Profile (Protected)
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+919876543210"
}
```

#### Change Password (Protected)
```http
PUT /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Products

#### Get All Products
```http
GET /products?page=1&limit=10&category=silk&minPrice=500&maxPrice=5000&sort=price-asc&search=saree
```

Query Parameters:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10, max: 100)
- `category` (string): Filter by category
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `inStock` (boolean): Filter in stock items only
- `sort` (string): Sort by 'price-asc', 'price-desc', 'newest', 'popular'
- `search` (string): Search query

#### Get Featured Products
```http
GET /products/featured?limit=10
```

#### Get Product by ID
```http
GET /products/:id
```

#### Search Products
```http
GET /products/search/:query?page=1
```

#### Get Products by Category
```http
GET /products/category/:category?page=1
```

#### Create Product (Admin, Protected)
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Beautiful Silk Saree",
  "description": "Product description",
  "price": 2500,
  "discountedPrice": 1999,
  "category": "silk",
  "brand": "Brand Name",
  "colors": ["red", "blue"],
  "sizes": ["S", "M", "L", "Free Size"],
  "images": [
    { "url": "https://...", "alt": "Description" }
  ],
  "stock": 50,
  "featured": true,
  "specifications": {
    "fabric": "Pure Silk",
    "length": "6.3 meters",
    "work": "Zari Work"
  },
  "tags": ["wedding", "festive"]
}
```

#### Update Product (Admin, Protected)
```http
PUT /products/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Product (Admin, Protected)
```http
DELETE /products/:id
Authorization: Bearer <token>
```

### Cart

#### Get User's Cart (Protected)
```http
GET /cart
Authorization: Bearer <token>
```

#### Add Item to Cart (Protected)
```http
POST /cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "product": "product_id",
  "quantity": 2,
  "selectedSize": "M",
  "selectedColor": "red"
}
```

#### Update Cart Item (Protected)
```http
PUT /cart/item/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Update Cart Item Details (Protected)
```http
PUT /cart/item/:itemId/details
Authorization: Bearer <token>
Content-Type: application/json

{
  "selectedSize": "L",
  "selectedColor": "blue"
}
```

#### Remove Item from Cart (Protected)
```http
DELETE /cart/item/:itemId
Authorization: Bearer <token>
```

#### Clear Cart (Protected)
```http
DELETE /cart/clear
Authorization: Bearer <token>
```

#### Merge Guest Cart (Protected)
```http
POST /cart/merge
Authorization: Bearer <token>
Content-Type: application/json

{
  "guestCartItems": [ ... ]
}
```

### Orders

#### Create Order (Protected)
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id",
      "quantity": 2,
      "price": 2500,
      "selectedSize": "M",
      "selectedColor": "red"
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+919876543210",
    "address": "123 Street Name",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "paymentMethod": "razorpay"
}
```

#### Get User's Orders (Protected)
```http
GET /orders?page=1&status=delivered
Authorization: Bearer <token>
```

#### Get Order by ID (Protected)
```http
GET /orders/:id
Authorization: Bearer <token>
```

#### Cancel Order (Protected)
```http
PUT /orders/:id/cancel
Authorization: Bearer <token>
```

#### Track Order (Protected)
```http
GET /orders/:id/tracking
Authorization: Bearer <token>
```

#### Update Order Status (Admin, Protected)
```http
PUT /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped",
  "note": "Order shipped via courier"
}
```

### Payments

#### Create Razorpay Order (Protected)
```http
POST /payments/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 2500,
  "currency": "INR"
}
```

Response:
```json
{
  "success": true,
  "order": {
    "id": "order_xxx",
    "amount": 250000,
    "currency": "INR",
    "receipt": "receipt_xxx"
  }
}
```

#### Verify Payment (Protected)
```http
POST /payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx",
  "orderId": "order_id"
}
```

#### Handle Payment Failure (Protected)
```http
POST /payments/failed
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id",
  "razorpayOrderId": "order_xxx",
  "error": { ... }
}
```

#### Initiate Refund (Admin, Protected)
```http
POST /payments/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentId": "payment_id",
  "amount": 2500,
  "reason": "Customer request"
}
```

#### Get Payment Status (Protected)
```http
GET /payments/status/:paymentId
Authorization: Bearer <token>
```

### Admin

#### Get Dashboard Statistics (Admin, Protected)
```http
GET /admin/dashboard
Authorization: Bearer <token>
```

#### Get All Users (Admin, Protected)
```http
GET /admin/users?page=1&search=john
Authorization: Bearer <token>
```

#### Get User Details (Admin, Protected)
```http
GET /admin/users/:userId
Authorization: Bearer <token>
```

#### Update User Status (Admin, Protected)
```http
PUT /admin/users/:userId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "blocked"
}
```

#### Get All Orders (Admin, Protected)
```http
GET /admin/orders?page=1&status=pending&dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
```

#### Get Sales Analytics (Admin, Protected)
```http
GET /admin/analytics/sales?period=month
Authorization: Bearer <token>
```

#### Get Product Analytics (Admin, Protected)
```http
GET /admin/analytics/products
Authorization: Bearer <token>
```

#### Get Low Stock Products (Admin, Protected)
```http
GET /admin/products/low-stock?threshold=10
Authorization: Bearer <token>
```

#### Bulk Update Products (Admin, Protected)
```http
PUT /admin/products/bulk-update
Authorization: Bearer <token>
Content-Type: application/json

{
  "productIds": ["id1", "id2"],
  "action": "increase",
  "value": 10
}
```

#### Export Orders (Admin, Protected)
```http
GET /admin/orders/export?format=csv&dateFrom=2024-01-01
Authorization: Bearer <token>
```

#### Get Recent Activities (Admin, Protected)
```http
GET /admin/activities/recent?limit=20
Authorization: Bearer <token>
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

## Rate Limiting

API endpoints are rate limited:
- Public endpoints: 100 requests per 15 minutes
- Authenticated endpoints: 1000 requests per 15 minutes
- Admin endpoints: 2000 requests per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```
