# SareeWeb E-Commerce Platform

A full-stack e-commerce platform for selling traditional Indian sarees, built with modern web technologies and comprehensive admin functionality.

## ✨ New Features Added

### 🛡️ Complete Admin Dashboard
- **Product Management**: Full CRUD operations with discount management
- **Sales & Analytics**: Comprehensive analytics with revenue tracking
- **Order Management**: Complete order lifecycle management with status updates
- **Customer Management**: User administration and insights
- **Stock Control**: Inventory management with low stock alerts

### 📧 Email Notification System
- **Order Confirmations**: Automatic emails on successful orders
- **Status Updates**: Shipped and delivered notifications
- **Admin Notifications**: Real-time order alerts for administrators
- **Multiple Email Providers**: Gmail, SendGrid, and custom SMTP support

### 💰 Advanced Discount System
- **Product Discounts**: Percentage-based discounts with date ranges
- **Bulk Operations**: Apply discounts to multiple products
- **Analytics**: Track discount impact on sales
- **Real-time Calculations**: Dynamic pricing with discount previews

### 📊 Comprehensive Analytics
- **Revenue Tracking**: Growth analysis with period comparisons
- **Order Analytics**: Status distribution and trends
- **Customer Insights**: New customer acquisition metrics
- **Product Performance**: Top-selling products analysis
- **Discount Impact**: Revenue impact of promotional pricing

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication and authorization
- **Razorpay** for payment processing
- **NodeMailer** for email notifications
- **Multer** for file uploads

### Frontend
- **React 18** with Vite build tool
- **React Router** for client-side routing
- **Context API** for state management
- **Axios** for API communication
- **Material Icons** for UI components

### Email Service Integration
- **NodeMailer** with multiple provider support:
  - Gmail (with App Password)
  - SendGrid API
  - Custom SMTP servers

## Project Structure

```
SareeWeb/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── utils/           # Email service, helpers
│   │   └── config/          # Database, constants
├── frontend/                # React.js frontend application
│   ├── src/
│   │   ├── admin/           # Admin dashboard components
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   ├── context/         # React Context providers
│   │   ├── services/        # API service functions
│   │   └── styles/          # CSS stylesheets
├── docs/                    # Documentation
├── nginx/                   # Production configuration
└── README.md
```

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Razorpay account (for payments)
- Email service account (Gmail, SendGrid, etc.)

### 1. Clone and Install

```bash
git clone <repository-url>
cd sareeweb
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Update `.env` with your configuration:
```env
# Core Settings
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sareeweb
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# Payment
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Email Service (Choose one)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# OR for SendGrid:
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=your-sendgrid-key

# OR for Custom SMTP:
# EMAIL_SERVICE=smtp
# SMTP_HOST=smtp.your-provider.com
# SMTP_PORT=587
# SMTP_SECURE=false
# EMAIL_USER=your-smtp-user
# EMAIL_PASSWORD=your-smtp-password

# Application
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@sareeweb.com
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Update `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SareeWeb
VITE_RAZORPAY_KEY=rzp_test_xxxxx
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- Admin Panel: http://localhost:5173/admin

## Email Service Setup

### Gmail Setup
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password for your email
3. Use the App Password in `EMAIL_PASSWORD`
4. Set `EMAIL_SERVICE=gmail`

### SendGrid Setup
1. Create SendGrid account and verify sender identity
2. Generate API key with Mail Send permissions
3. Set `EMAIL_SERVICE=sendgrid` and `SENDGRID_API_KEY=your-key`

### Custom SMTP
1. Obtain SMTP credentials from your email provider
2. Configure `SMTP_HOST`, `SMTP_PORT`, and credentials
3. Set `EMAIL_SERVICE=smtp`

## API Endpoints

### Admin Routes
```
GET    /api/admin/analytics/overview     # Dashboard analytics
GET    /api/admin/analytics/top-products # Best selling products
GET    /api/admin/analytics/discounts    # Discount analytics
POST   /api/admin/products              # Create product
PUT    /api/admin/products/:id          # Update product
PUT    /api/admin/products/:id/discount # Update discount
GET    /api/admin/orders                # List orders
PUT    /api/admin/orders/:id/status     # Update order status
POST   /api/admin/orders/:id/resend-email # Resend notifications
```

### Customer Routes
```
POST   /api/orders/create               # Place order
GET    /api/orders                      # User orders
GET    /api/orders/:id                  # Order details
PUT    /api/orders/:id/status           # Update status (admin)
POST   /api/orders/:id/resend-email     # Resend email (admin)
```

## Admin Dashboard Features

### 📦 Product Management
- **Add Products**: Complete form with images, pricing, inventory
- **Edit Products**: Update any field including discount percentages
- **Discount Management**: Set percentage discounts with date ranges
- **Bulk Operations**: Apply discounts to multiple products
- **Stock Tracking**: Real-time inventory levels with low stock alerts
- **Search & Filter**: Find products by name, category, discount status

### 📊 Sales & Analytics Dashboard
- **Revenue Metrics**: Total revenue with growth percentages
- **Order Analytics**: Order volume and status distribution
- **Customer Insights**: New customer acquisition tracking
- **Product Performance**: Top-selling products analysis
- **Interactive Charts**: Visual data representation
- **Export Features**: Download reports in CSV format

### 📋 Order Management
- **Order Listing**: Paginated list with search and filters
- **Status Updates**: Change order status with automatic notifications
- **Customer Details**: Complete customer and shipping information
- **Email Resending**: Manually resend confirmation/status emails
- **Order Timeline**: Track order progress through status history

### 👥 Customer Management
- **User Directory**: List all registered customers
- **Customer Analytics**: Purchase history and behavior
- **Account Management**: Activate/deactivate user accounts

## Database Models

### Product Schema
```javascript
{
  name: String,
  description: String,
  price: Number,
  discountPercentage: Number,        // NEW
  discountStartDate: Date,         // NEW
  discountEndDate: Date,           // NEW
  category: String,
  stock: Number,
  images: [Object],
  // ... additional fields
}
```

### Order Schema
```javascript
{
  user: ObjectId,
  customerEmail: String,           // NEW
  customerPhone: String,           // NEW
  orderNumber: String,
  items: [Object],
  shippingAddress: Object,
  totalAmount: Number,
  discount: Number,                // Enhanced
  discountDetails: Object,         // NEW
  status: String,
  emailNotifications: Object,      // NEW
  statusHistory: [Object],
  // ... additional fields
}
```

## Development Scripts

### Backend
```bash
npm run dev      # Development with nodemon
npm start        # Production server
```

### Frontend
```bash
npm run dev      # Vite development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Configure Nginx
See `nginx/` directory for production configuration examples.

### Environment Variables
Ensure all production environment variables are set:
- Database connection strings
- JWT secrets
- Payment gateway credentials
- Email service configuration
- Admin email addresses

## Features Roadmap

### Completed ✅
- [x] Complete admin dashboard
- [x] Email notification system
- [x] Product discount management
- [x] Comprehensive analytics
- [x] Order management system
- [x] Customer insights
- [x] Stock control
- [x] Export functionality

### Future Enhancements
- [ ] Advanced reporting with PDF generation
- [ ] Inventory forecasting
- [ ] Customer segmentation
- [ ] Marketing campaign management
- [ ] Multi-store support
- [ ] Mobile app integration
- [ ] Advanced search with Elasticsearch
- [ ] Real-time notifications with WebSocket

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@sareeweb.com
- Documentation: `/docs` directory

## Changelog

### v2.0.0 - Complete Admin Platform
- Added comprehensive admin dashboard
- Implemented email notification system
- Added discount management system
- Enhanced analytics with growth tracking
- Improved order management workflow
- Added customer insights
- Enhanced security and error handling

### v1.0.0 - Initial Release
- Basic e-commerce functionality
- User authentication
- Product catalog
- Shopping cart
- Order processing
- Payment integration
