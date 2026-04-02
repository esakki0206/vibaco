const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { PAGINATION, PRODUCT_CATEGORIES } = require('../config/constants');
const cloudinary = require('../config/cloudinary');

const formatProduct = (product) => {
  const discountActive = typeof product.isDiscountActive === 'function' ? product.isDiscountActive() : false;
  const obj = product.toObject({ virtuals: true });

  obj.discountActive = discountActive;
  obj.discountedPrice = discountActive ? product.finalPrice : null;
  obj.currentPrice = typeof product.getCurrentPrice === 'function' ? product.getCurrentPrice() : obj.price;

  obj.variants = obj.variants || [];

  // Helper for UI: Is the product totally out of stock?
  obj.isSoldOut = obj.stock <= 0;
  return obj;
};

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
exports.getAllProducts = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  // Build query – only show active (published) products to customers
  const query = { isActive: true };

  // If request is specifically for reseller catalog, only show approved products
  if (req.query.forReseller === 'true') {
    query.publishForReseller = { $ne: false }; // Handles missing fields as well as explicit true
  }

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by price range
  // Filter by price range (USE EFFECTIVE PRICE)
  if (req.query.minPrice || req.query.maxPrice) {
    const min = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const max = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity;

    query.$expr = {
      $and: [
        { $gte: [{ $ifNull: ['$discountedPrice', '$price'] }, min] },
        { $lte: [{ $ifNull: ['$discountedPrice', '$price'] }, max] }
      ]
    };
  }

  // Filter by availability
  if (req.query.inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  // Filter by search
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { name: searchRegex },
      { category: searchRegex },
      { description: searchRegex }
    ];
  }

  // Filter by colors (now using the 'colors' string array instead of 'variants')
  if (req.query.variantColors) {
    const colorNames = req.query.variantColors.split(',').map(c => c.trim()).filter(c => c);
    if (colorNames.length > 0) {
      // Create conditions to match any of the colors case-insensitively
      const colorConditions = colorNames.map(color => ({
        colors: { $regex: `^${color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
      }));

      // If $or already exists (e.g. from search), wrap both in $and
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: colorConditions }
        ];
        delete query.$or;
      } else if (query.$and) {
        query.$and.push({ $or: colorConditions });
      } else {
        query.$or = colorConditions;
      }
    }
  }

  // Build sort
  let sort = {};
  switch (req.query.sort) {
    case 'price-asc':
      sort = { price: 1 };
      break;
    case 'price-desc':
      sort = { price: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'popular':
      sort = { 'ratings.count': -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    count: products.length,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    products: products.map(formatProduct)
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const products = await Product.find({ featured: true, stock: { $gt: 0 }, isActive: true })
    .sort({ 'ratings.count': -1 })
    .limit(limit);

  res.json({
    success: true,
    count: products.length,
    products: products.map(formatProduct)
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  res.json({
    success: true,
    product: formatProduct(product)
  });
});

// @desc    Search products
// @route   GET /api/products/search/:query
// @access  Public
exports.searchProducts = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const q = req.query.q || req.params.query;
  if (!q) {
    throw new AppError(400, 'Search query is required');
  }

  const searchRegex = new RegExp(q, 'i');
  const searchQuery = {
    isActive: true,
    $or: [
      { name: searchRegex },
      { category: searchRegex },
      { description: searchRegex }
    ]
  };

  const products = await Product.find(searchQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(searchQuery);

  res.json({
    success: true,
    count: products.length,
    total,
    products: products.map(formatProduct)
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const category = req.params.category.toLowerCase();

  // Only fetch active (published) products in this category
  const products = await Product.find({ category, isActive: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments({ category, isActive: true });

  res.json({
    success: true,
    count: products.length,
    total,
    products: products.map(formatProduct)
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = asyncHandler(async (req, res) => {
  const {
    images = [],   // ✅ FIXED
    ...rest
  } = req.body;

  const product = await Product.create({
    ...rest,
    images
  });

  res.status(201).json({
    success: true,
    product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
// controllers/productController.js

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError(404, 'Product not found');

  const {
    images = [],   // ✅ FIXED
    ...rest
  } = req.body;

  // ✅ Set images safely
  if (Array.isArray(images)) {
    product.images = images;
  }

  // Update other fields
  Object.keys(rest).forEach(key => {
    product[key] = rest[key];
  });

  await product.save();

  res.json({
    success: true,
    product
  });
});


// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, errors.array()[0].msg);
  }

  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  // Check if user already reviewed
  // (This would need a reviews array in the product schema)

  // Update ratings
  product.ratings.count += 1;
  product.ratings.average = ((product.ratings.average * (product.ratings.count - 1)) + rating) / product.ratings.count;

  await product.save();

  res.json({
    success: true,
    message: 'Review added successfully',
    ratings: product.ratings
  });
});

// Aliases for route compatibility
exports.getByCategory = exports.getProductsByCategory;

// Get products by occasion (matches tags)
// @route   GET /api/products/occasion/:occasion
// @access  Public
exports.getByOccasion = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const occasion = req.params.occasion;
  if (!occasion) {
    throw new AppError(400, 'Occasion is required');
  }

  const occasionRegex = new RegExp(occasion, 'i');
  // Only active (published) products for this occasion
  const query = { tags: occasionRegex, isActive: true };

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    count: products.length,
    total,
    products: products.map(formatProduct)
  });
});
