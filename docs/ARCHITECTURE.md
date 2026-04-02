# Architecture Documentation

## System Overview

The Saree E-Commerce Platform follows a modern microservices-inspired architecture with clear separation of concerns between frontend and backend.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Desktop  │  │  Mobile  │  │  Tablet  │              │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘              │
└────────┼────────────────┼────────────────┼──────────────────┘
         │                │                │
         └────────────────┴────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│              React.js SPA (Vite)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Components (Pages, Admin Panel)                │  │
│  │  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │   Context    │  │   Services   │              │  │
│  │  │   Providers  │  │   (API)     │              │  │
│  │  └──────────────┘  └──────────────┘              │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────┘
                                   │ HTTP/HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Web Server                           │
│                      Nginx                                │
│  ┌──────────────┐  ┌──────────────┐                      │
│  │  Static Files │  │  Reverse     │                      │
│  │  (Frontend)  │  │  Proxy       │                      │
│  │              │  │  (Backend)   │                      │
│  └──────────────┘  └──────┬───────┘                      │
└─────────────────────────────────┼──────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│                 Node.js + Express.js                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Middleware                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │  Auth    │  │  Error   │  │  CORS    │        │  │
│  │  └──────────┘  └──────────┘  └──────────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Controllers                           │  │
│  │  Auth | Product | Cart | Order | Payment | Admin     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Models                             │  │
│  │  User | Product | Cart | Order | Payment            │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                            │
│                    MongoDB Atlas                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Users   │  │ Products │  │ Orders   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Cart    │  │ Payments │  │          │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Razorpay │  │  Email   │  │  SMS     │              │
│  │ (Payment)│  │ Service  │  │ Service  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router DOM v6
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Styling:** CSS (custom)
- **Icons:** React Icons

### Directory Structure
```
src/
├── components/       # Reusable UI components
├── pages/           # Route components
├── admin/           # Admin-specific pages
├── services/        # API service layer
├── context/         # State management providers
└── styles/          # CSS stylesheets
```

### Key Patterns

#### 1. Component Architecture
- **Functional Components** with Hooks
- **Composition** for complex UIs
- **Controlled Components** for forms

#### 2. State Management
- **AuthContext:** User authentication state
- **CartContext:** Shopping cart state
- **Local State:** useState for component-specific state

#### 3. API Layer
```javascript
services/
├── api.js          # Axios instance with interceptors
├── auth.js         # Authentication API calls
├── products.js     # Product API calls
├── cart.js         # Cart API calls
├── orders.js       # Order API calls
└── payments.js     # Payment API calls
```

#### 4. Routing
```javascript
// Protected Routes
<Route element={<ProtectedRoute />}>
  <Route path="/checkout" element={<Checkout />} />
  <Route path="/orders" element={<OrderHistory />} />
</Route>

// Admin Routes
<Route element={<ProtectedRoute adminOnly />}>
  <Route path="/admin" element={<AdminDashboard />} />
</Route>
```

## Backend Architecture

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Payment:** Razorpay Integration
- **File Upload:** Multer
- **Validation:** express-validator

### Directory Structure
```
src/
├── models/          # Mongoose schemas
├── routes/          # Express route definitions
├── controllers/     # Business logic
├── middleware/      # Custom middleware
├── config/          # Configuration files
└── utils/           # Utility functions
```

### Design Patterns

#### 1. MVC Pattern
```
Routes (Incoming Requests)
    ↓
Middleware (Auth, Validation)
    ↓
Controllers (Business Logic)
    ↓
Models (Database Operations)
    ↓
Database (MongoDB)
```

#### 2. Middleware Stack
1. **CORS:** Cross-origin resource sharing
2. **Body Parser:** JSON/URL-encoded parsing
3. **Auth:** JWT verification
4. **Validation:** Input validation
5. **Error Handler:** Global error handling

#### 3. Controller Pattern
```javascript
exports.functionName = asyncHandler(async (req, res) => {
  // 1. Validate input
  // 2. Perform business logic
  // 3. Interact with models
  // 4. Return response
});
```

#### 4. Model Pattern
```javascript
const schema = new mongoose.Schema({
  // Schema definition
}, {
  timestamps: true,
  // Virtuals, methods, hooks
});
```

## Data Flow

### User Authentication Flow
```
1. User submits login form
   ↓
2. Frontend: POST /api/auth/login
   ↓
3. Backend: Validate credentials
   ↓
4. Backend: Generate JWT token
   ↓
5. Backend: Return token + user data
   ↓
6. Frontend: Store in localStorage
   ↓
7. Frontend: Include token in headers
   ↓
8. Backend: Verify token (middleware)
   ↓
9. Backend: Grant access to protected routes
```

### Product Browsing Flow
```
1. User navigates to products page
   ↓
2. Frontend: GET /api/products?page=1&limit=12
   ↓
3. Backend: Query MongoDB with filters
   ↓
4. Backend: Return paginated products
   ↓
5. Frontend: Display product grid
   ↓
6. User clicks product
   ↓
7. Frontend: GET /api/products/:id
   ↓
8. Backend: Fetch product details
   ↓
9. Frontend: Display product details page
```

### Order Placement Flow
```
1. User adds items to cart
   ↓
2. Cart stored in MongoDB cart collection
   ↓
3. User proceeds to checkout
   ↓
4. User selects address & payment method
   ↓
5. Frontend: POST /api/orders
   ↓
6. Backend: Create order record
   ↓
7. Backend: Update product stock
   ↓
8. Backend: Clear user cart
   ↓
9. If Razorpay: Create Razorpay order
   ↓
10. Frontend: Open Razorpay checkout
   ↓
11. User completes payment
   ↓
12. Frontend: POST /api/payments/verify
   ↓
13. Backend: Verify payment signature
   ↓
14. Backend: Update order payment status
   ↓
15. Frontend: Redirect to order confirmation
```

## Security Architecture

### Authentication & Authorization
```
┌─────────────────────────────────────────┐
│         Authentication Layer          │
│  - JWT Token-based                 │
│  - Password hashing (bcrypt)        │
│  - Token expiry (7 days)           │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Authorization Layer           │
│  - Role-based access (user/admin)   │
│  - Route protection middleware      │
│  - Ownership validation            │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Resource Protection           │
│  - CORS configuration             │
│  - Input validation               │
│  - SQL injection prevention        │
│  - XSS protection                │
└─────────────────────────────────────┘
```

### Data Security
- **Passwords:** Hashed with bcrypt (10 salt rounds)
- **JWT:** Signed with HS256 algorithm
- **Payment:** Handled via Razorpay (PCI compliant)
- **File Uploads:** Size limit (5MB), type validation

### API Security
- Rate limiting (per endpoint)
- Request validation (express-validator)
- Error handling (no sensitive data in errors)
- HTTPS enforced in production

## Scalability Considerations

### Horizontal Scaling
```
┌─────────────┐
│   Nginx     │
│ (Load Balancer)│
└──────┬──────┘
       │
   ┌───┴────┬────────┐
   ▼        ▼        ▼
┌────┐  ┌────┐  ┌────┐
│App1│  │App2│  │App3│
└─┬──┘  └─┬──┘  └─┬──┘
   │       │       │
   └───┬───┴───┘
       ▼
   ┌────────┐
   │ MongoDB│
   └────────┘
```

### Caching Strategy
- **Static Assets:** CDN (CloudFront/Cloudflare)
- **API Responses:** Redis (future enhancement)
- **Product Data:** Cache popular products
- **Images:** CDN + browser caching

### Database Scaling
- **Read Replicas:** For high read traffic
- **Sharding:** Split collections by category
- **Indexing:** Optimize query performance

## Performance Optimization

### Frontend
- **Code Splitting:** Lazy loading routes
- **Tree Shaking:** Remove unused code
- **Image Optimization:** WebP format, lazy loading
- **Minification:** CSS/JS minified
- **Browser Caching:** Cache headers

### Backend
- **Connection Pooling:** Mongoose connection pool
- **Query Optimization:** Indexes, projections
- **Compression:** Gzip compression
- **Response Caching:** Cache static responses

### Infrastructure
- **CDN:** Serve static assets
- **Database:** Atlas (auto-scaling)
- **Load Balancer:** Distribute traffic
- **PM2 Cluster Mode:** Multi-core utilization

## Error Handling

### Frontend
```javascript
try {
  const response = await api.getData()
} catch (error) {
  // Handle 401 (unauthorized)
  // Handle 404 (not found)
  // Handle 500 (server error)
  // Show user-friendly error message
}
```

### Backend
```javascript
// Global error handler
app.use(errorHandler)

// Custom error classes
class AppError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
  }
}

// Error response format
{
  success: false,
  message: "Error description"
}
```

## Monitoring & Logging

### Application Monitoring
- **PM2:** Process monitoring
- **Logs:** Winston or Morgan (future)
- **Health Checks:** `/health` endpoint
- **Error Tracking:** Sentry (future)

### Performance Monitoring
- **API Response Time:** Log execution time
- **Database Query Time:** Slow query logs
- **Memory Usage:** PM2 metrics
- **CPU Usage:** PM2 metrics

### Business Metrics
- Order count/time
- Revenue tracking
- User acquisition
- Cart abandonment rate

## Deployment Architecture

### Environments
```
Development (localhost)
    ↓
Staging (pre-production)
    ↓
Production (live)
```

### CI/CD Pipeline (Future)
```
Git Push
  ↓
Run Tests
  ↓
Build Frontend
  ↓
Build Backend
  ↓
Deploy to Staging
  ↓
Run Integration Tests
  ↓
Manual Approval
  ↓
Deploy to Production
```

### Deployment Strategy
- **Blue-Green Deployment:** Zero downtime
- **Rolling Updates:** Gradual deployment
- **Rollback:** Quick revert capability

## Technology Decisions

### Why React?
- Large ecosystem and community
- Component reusability
- Fast development with Vite
- SEO friendly (with SSR)

### Why Node.js/Express?
- JavaScript everywhere (frontend/backend)
- Fast I/O operations
- Large NPM ecosystem
- Easy to scale

### Why MongoDB?
- Flexible schema (for products)
- JSON-native
- Horizontal scaling
- Cloud solution (Atlas)

### Why Razorpay?
- Indian market leader
- Easy integration
- Supports multiple payment methods
- Reasonable transaction fees

## Future Enhancements

### Short Term
1. Redis caching layer
2. Email service integration
3. SMS notifications
4. Product recommendations
5. Search optimization (Elasticsearch)

### Long Term
1. Microservices architecture
2. GraphQL API
3. Real-time inventory (WebSocket)
4. Mobile app (React Native)
5. AI-powered recommendations

## Documentation Standards

### Code Comments
- **JSDoc:** For functions and methods
- **Inline:** For complex logic
- **README:** For module overview

### API Documentation
- **OpenAPI/Swagger:** API specification
- **Postman Collection:** For testing
- **Examples:** Usage examples

### Architecture Diagrams
- **Mermaid:** For diagrams in markdown
- **Draw.io:** For complex diagrams
- **Keep updated:** When architecture changes
