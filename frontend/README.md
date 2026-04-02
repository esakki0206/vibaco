# Saree E-Commerce - Frontend

React frontend for the Saree E-Commerce Platform.

## Overview

A modern, responsive React application built with Vite for an optimal development experience and production build performance.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Context API** - State management

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
   - `VITE_API_URL` - Backend API URL
   - `VITE_APP_NAME` - Application name
   - `VITE_RAZORPAY_KEY` - Razorpay public key

## Running the Application

### Development
```bash
npm run dev
```

The application will run on `http://localhost:5173`

### Production Build
```bash
npm run build
```

Build files will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/           # Page components
├── admin/           # Admin-specific pages
├── services/        # API service layer
├── context/         # React Context providers
├── styles/          # Global and component styles
├── App.jsx          # Main app component
└── main.jsx         # Application entry point
```

## Key Features

- **Responsive Design** - Mobile-first approach
- **Product Catalog** - Browse and filter products
- **Shopping Cart** - Add, update, and remove items
- **User Authentication** - Login, registration, profile management
- **Order Management** - Place and track orders
- **Payment Integration** - Razorpay payment gateway
- **Admin Dashboard** - Manage products, orders, and analytics

## API Integration

All API calls are handled through the services layer in `src/services/`. The API base URL is configured via the `VITE_API_URL` environment variable.

## State Management

State management is handled using React Context API:
- `AuthContext` - User authentication state
- `CartContext` - Shopping cart state

## Routing

Routes are defined in `App.jsx` using React Router:
- `/` - Home page
- `/products` - Product listing
- `/products/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/login` - Login page
- `/register` - Registration page
- `/orders` - Order history
- `/admin` - Admin dashboard

## Styling

The application uses CSS files for styling:
- `styles/index.css` - Global styles and resets
- `styles/components.css` - Component-specific styles
- `styles/pages.css` - Page-specific styles

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Notes

- The dev server runs on port 5173 by default
- API requests are proxied to the backend during development
- Hot Module Replacement (HMR) is enabled for fast development
- All environment variables must be prefixed with `VITE_`

## Building for Production

1. Set the production API URL in `.env`
2. Run `npm run build`
3. Deploy the `dist/` directory to your hosting service
