const express = require('express');
const router = express.Router();
const { 
  getAllProducts, 
  getFeaturedProducts,
  getProductById, 
  searchProducts, 
  getByCategory, 
  getByOccasion, 
  addReview 
} = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);  // GET /api/products?category=&page=&limit=
router.get('/featured', getFeaturedProducts);  // GET /api/products/featured
router.get('/search', searchProducts);  // GET /api/products/search?q=
router.get('/category/:category', getByCategory);  // GET /api/products/category/Silk%20Sarees
router.get('/occasion/:occasion', getByOccasion);  // GET /api/products/occasion/Wedding
router.get('/:id', getProductById);  // GET /api/products/:id

// Protected routes (customer)
router.post('/:id/review', verifyToken, addReview);  // POST /api/products/:id/review

module.exports = router;
