# Database Schema

This document describes the MongoDB schema for the Saree E-Commerce Platform.

## Overview

The database uses MongoDB with Mongoose ODM. All schemas include timestamps (`createdAt`, `updatedAt`) automatically.

## Collections

### Users Collection

**Schema:** User

**Fields:**
```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt),
  phone: String (optional),
  role: String (enum: ['user', 'admin'], default: 'user'),
  addresses: [{
    _id: ObjectId,
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean (default: false)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)
- `role` (for admin queries)

**Methods:**
- `comparePassword(candidatePassword)` - Compare plain password with hashed password
- `toJSON()` - Returns user object without password field

**Validation:**
- Email format validation
- Password minimum length: 6 characters
- Phone number format (if provided)

---

### Products Collection

**Schema:** Product

**Fields:**
```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  description: String (required),
  price: Number (required, min: 0),
  discountedPrice: Number (optional, < price),
  category: String (enum: [
    'silk', 'cotton', 'chiffon', 'georgette',
    'crepe', 'banarasi', 'kanchipuram', 'other'
  ], required),
  brand: String (optional),
  colors: [String] (e.g., ['red', 'blue']),
  sizes: [String] (enum: ['S', 'M', 'L', 'XL', 'XXL', 'Free Size']),
  images: [{
    url: String,
    alt: String
  }],
  stock: Number (required, min: 0, default: 0),
  featured: Boolean (default: false),
  ratings: {
    average: Number (default: 0, min: 0, max: 5),
    count: Number (default: 0)
  },
  specifications: {
    fabric: String,
    length: String,
    work: String,
    blousePiece: Boolean (default: true)
  },
  tags: [String] (e.g., ['wedding', 'festive', 'casual']),
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Text search index on `name`, `description`, `tags`
- Compound index on `category` and `createdAt`
- Index on `featured`
- Index on `stock` (for low stock queries)

**Relationships:**
- `createdBy` → Users collection (admin who created the product)

---

### Cart Collection

**Schema:** Cart

**Fields:**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required, unique),
  items: [{
    _id: ObjectId,
    product: ObjectId (ref: Product, required),
    quantity: Number (required, min: 1, default: 1),
    price: Number (required, snapshot at time of adding),
    selectedSize: String,
    selectedColor: String
  }],
  totalAmount: Number (calculated),
  totalItems: Number (calculated),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `user` (unique)

**Relationships:**
- `user` → Users collection
- `items.product` → Products collection (populated)

**Pre-save Hook:**
- Calculates `totalAmount` and `totalItems` before saving

---

### Orders Collection

**Schema:** Order

**Fields:**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  orderNumber: String (unique, auto-generated),
  items: [{
    _id: ObjectId,
    product: ObjectId (ref: Product, required),
    name: String (snapshot),
    image: String (snapshot),
    quantity: Number (required),
    price: Number (required, snapshot),
    selectedSize: String,
    selectedColor: String
  }],
  shippingAddress: {
    name: String (required),
    phone: String (required),
    address: String (required),
    city: String (required),
    state: String (required),
    pincode: String (required)
  },
  paymentMethod: String (enum: ['cod', 'razorpay', 'card'], required),
  paymentStatus: String (enum: [
    'pending', 'completed', 'failed', 'refunded'
  ], default: 'pending'),
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    transactionId: String
  },
  subtotal: Number (required),
  shippingCost: Number (default: 0),
  tax: Number (default: 0),
  discount: Number (default: 0),
  totalAmount: Number (required),
  status: String (enum: [
    'pending', 'confirmed', 'processing',
    'shipped', 'delivered', 'cancelled', 'refunded'
  ], default: 'pending'),
  statusHistory: [{
    status: String,
    timestamp: Date (default: Date.now),
    note: String
  }],
  estimatedDelivery: Date,
  deliveredAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `orderNumber` (unique)
- `user` + `createdAt` (for user order history)
- `status` (for filtering)
- `createdAt` (for sorting)

**Relationships:**
- `user` → Users collection
- `items.product` → Products collection (populated)

**Pre-save Hook:**
- Auto-generates `orderNumber` if new document
- Format: `SR{timestamp}{random}`

---

### Payments Collection

**Schema:** Payment

**Fields:**
```javascript
{
  _id: ObjectId,
  order: ObjectId (ref: Order, required),
  user: ObjectId (ref: User, required),
  amount: Number (required),
  currency: String (default: 'INR'),
  paymentMethod: String (enum: [
    'razorpay', 'card', 'upi', 'netbanking', 'wallet', 'cod'
  ], required),
  paymentStatus: String (enum: [
    'initiated', 'pending', 'completed', 'failed', 'refunded', 'partial_refund'
  ], default: 'initiated'),
  razorpayDetails: {
    orderId: String,
    paymentId: String,
    signature: String
  },
  transactionId: String (unique, sparse),
  failureReason: String,
  refundDetails: {
    refundId: String,
    amount: Number,
    status: String (enum: ['pending', 'processed', 'failed'], default: 'pending'),
    refundedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `order` (unique)
- `transactionId` (unique, sparse)
- `user` + `createdAt`

**Relationships:**
- `order` → Orders collection
- `user` → Users collection

---

## Relationships & References

```mermaid
erDiagram
    User ||--o{ Cart : has
    User ||--o{ Order : places
    User ||--o{ Payment : makes
    User ||--o{ Product : creates (admin)

    Product ||--o{ Cart : contains
    Product ||--o{ Order : includes
    Product }|--|| Category : belongs_to

    Cart ||--|| User : belongs_to
    Order ||--|| User : belongs_to
    Order ||--o{ Payment : has
    Payment ||--|| Order : belongs_to
    Payment ||--|| User : belongs_to
```

## Data Flow Examples

### Order Creation Flow

1. User adds items to cart
2. Cart items stored with current prices
3. User places order:
   - Order document created with cart items
   - Stock updated in Products collection
   - Cart cleared
   - Payment initiated if online payment
4. Payment recorded in Payments collection
5. Order status updated based on payment result

### Product Rating Flow

1. User submits review
2. Product `ratings.count` incremented
3. Product `ratings.average` recalculated:
   ```
   new_average = ((old_average * old_count) + new_rating) / (old_count + 1)
   ```
4. Product saved with updated ratings

## Indexes Summary

### Text Search Index (Products)
```javascript
{
  name: 'text',
  description: 'text',
  tags: 'text'
}
```

### Performance Indexes

| Collection | Index | Fields | Type |
|------------|--------|--------|------|
| Users | email | `{ email: 1 }` | Unique |
| Users | role | `{ role: 1 }` | Normal |
| Products | category + createdAt | `{ category: 1, createdAt: -1 }` | Compound |
| Products | featured | `{ featured: 1 }` | Normal |
| Products | stock | `{ stock: 1 }` | Normal |
| Cart | user | `{ user: 1 }` | Unique |
| Orders | orderNumber | `{ orderNumber: 1 }` | Unique |
| Orders | user + createdAt | `{ user: 1, createdAt: -1 }` | Compound |
| Orders | status | `{ status: 1 }` | Normal |
| Orders | createdAt | `{ createdAt: -1 }` | Normal |
| Payments | order | `{ order: 1 }` | Unique |
| Payments | transactionId | `{ transactionId: 1 }` | Unique (sparse) |

## Validation Rules

### Email
- Must be valid email format
- Must be unique
- Stored in lowercase

### Password
- Minimum 6 characters
- Hashed using bcrypt (10 rounds)

### Price
- Must be non-negative
- `discountedPrice` must be less than `price` (if provided)

### Phone
- Must match Indian mobile format (if provided)
- Optional field

### Stock
- Must be non-negative integer
- Default: 0

### Rating
- Average: 0-5 (floating point)
- Count: Non-negative integer

## Default Values

| Collection | Field | Default |
|------------|-------|---------|
| Users | role | 'user' |
| Users | addresses.isDefault | false |
| Products | featured | false |
| Products | stock | 0 |
| Products | ratings.average | 0 |
| Products | ratings.count | 0 |
| Products | specifications.blousePiece | true |
| Orders | shippingCost | 0 |
| Orders | tax | 0 |
| Orders | discount | 0 |
| Orders | status | 'pending' |
| Orders | paymentStatus | 'pending' |
| Orders | statusHistory[].timestamp | Date.now() |
| Payments | currency | 'INR' |
| Payments | paymentStatus | 'initiated' |

## Enum Values

### Product Categories
- silk
- cotton
- chiffon
- georgette
- crepe
- banarasi
- kanchipuram
- other

### Product Sizes
- S
- M
- L
- XL
- XXL
- Free Size

### User Roles
- user
- admin

### Order Status
- pending
- confirmed
- processing
- shipped
- delivered
- cancelled
- refunded

### Payment Status
- initiated
- pending
- completed
- failed
- refunded
- partial_refund

### Payment Methods
- cod (Cash on Delivery)
- razorpay
- card
- upi
- netbanking
- wallet

## Data Retention

- **Orders:** Kept indefinitely
- **Payments:** Kept indefinitely (for compliance)
- **Cart:** Cleared after order placement or 30 days of inactivity
- **User Sessions:** Token expiry: 7 days

## Backup & Restore

### Backup Collection
```bash
mongodump --uri="mongodb://user:pass@host:port/db" \
  --collection=products \
  --out=/backup/path
```

### Restore Collection
```bash
mongorestore --uri="mongodb://user:pass@host:port/db" \
  /backup/path/db/products.bson
```

### Full Database Backup
```bash
mongodump --uri="mongodb://user:pass@host:port/db" \
  --out=/backup/path/$(date +%Y%m%d)
```

## Migration Notes

When updating the schema:

1. Create migration script in `backend/migrations/`
2. Test on staging database first
3. Backup production database before migration
4. Run migration during low-traffic period
5. Verify data integrity after migration
6. Document changes in this file

## Performance Considerations

1. **Large Collections:**
   - Use pagination (limit, skip)
   - Implement cursor-based pagination for large datasets
   - Consider sharding for products collection at scale

2. **Query Optimization:**
   - Use appropriate indexes
   - Avoid large $in arrays
   - Use projection to limit returned fields
   - Aggregate operations for complex queries

3. **Memory Usage:**
   - Monitor document sizes
   - Use reference lookups instead of embedding for large arrays
   - Consider GridFS for large file attachments (images)

## Security Notes

1. **Sensitive Data:**
   - Passwords are hashed (bcrypt, salt rounds: 10)
   - Payment details stored only from Razorpay response
   - Never store full credit card numbers

2. **Access Control:**
   - Role-based access (user/admin)
   - Validate ownership on user-specific queries
   - Use middleware for route protection

3. **Injection Prevention:**
   - Use Mongoose for parameterized queries
   - Validate all input
   - Sanitize user-provided data
