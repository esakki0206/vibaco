# Saree E-Commerce - Backend

Express.js REST API for the Saree E-Commerce Platform.

## Overview

This backend provides a complete REST API for managing users, products, cart, orders, and payments.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Razorpay** - Payment gateway
- **Multer** - File upload handling

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Configure environment variables:
   - `PORT` - Server port (default: 5000)
   - `NODE_ENV` - Environment (development/production)
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret for JWT tokens
   - `RAZORPAY_KEY_ID` - Razorpay API key
   - `RAZORPAY_KEY_SECRET` - Razorpay API secret
   - `FRONTEND_URL` - Frontend URL for CORS
   - `ADMIN_EMAIL` - Admin email for setup

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Structure

### Routes

- `/api/auth` - Authentication (register, login, logout)
- `/api/products` - Product management
- `/api/cart` - Shopping cart operations
- `/api/orders` - Order management
- `/api/payments` - Payment processing with Razorpay
- `/api/admin` - Admin operations

### Controllers

- `authController` - User authentication logic
- `productController` - Product CRUD operations
- `cartController` - Cart management logic
- `orderController` - Order processing logic
- `paymentController` - Payment integration
- `adminController` - Admin-specific operations

### Models

- `User` - User schema
- `Product` - Product schema
- `Cart` - Shopping cart schema
- `Order` - Order schema
- `Payment` - Payment transaction schema

### Middleware

- `auth` - JWT authentication middleware
- `errorHandler` - Global error handling

## Database Connection

Database connection is configured in `src/config/database.js`. The application uses Mongoose to connect to MongoDB.

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS configuration
- Input validation with express-validator
- Environment-based configuration

## Development Notes

- The server listens on the port specified in `.env`
- API responses are in JSON format
- All protected routes require a valid JWT token
- File uploads are handled by Multer (max size: 5MB)
