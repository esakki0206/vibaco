import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdFilterList, MdSearch, MdGridView, MdViewList, MdClose,
  MdTrendingUp, MdInventory, MdShoppingCart,
  MdCheckCircle, MdLocalShipping, MdReceipt, MdInfo, MdArrowForward
} from 'react-icons/md'
import { productsApi } from '../services/products'
import { cartApi } from '../services/cart'
import { AuthContext } from '../context/AuthContext'
import FilterSidebar from '../components/FilterSidebar'

// --- Helper: Toast Notification (Same as ProductDetails) ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-28 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl z-[100] font-medium text-sm ${type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
        }`}
    >
      {type === 'success' ? <MdCheckCircle size={20} className="text-emerald-400" /> : <MdClose size={20} />}
      <span>{message}</span>
    </motion.div>
  )
}

const ResellerCatalog = () => {
  const [searchParams] = useSearchParams()
  const { user } = useContext(AuthContext)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Toast State
  const [toast, setToast] = useState(null)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    inStock: true,
    sortBy: 'newest'
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await productsApi.getProducts({
        ...filters,
        limit: 50,
        forReseller: true
      })
      setProducts(data.products || [])
    } catch (error) {
      console.error(error)
      setToast({ message: 'Could not load catalog', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAddToCart = async (product, qty, selectedColor, selectedSize) => {
    try {
      const payload = {
        product: product._id,
        selectedColor,
        selectedSize
      }

      await cartApi.addToCart(payload, qty)


      setToast({
        message: `Added ${qty} units to Wholesale Order`,
        type: 'success'
      })
      return true
    } catch (error) {
      console.error('Add to cart error:', error)
      setToast({
        message: error.response?.data?.message || 'Failed to add to cart',
        type: 'error'
      })
      return false
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(price)
  }

  return (
    // Added pt-24 to ensure it sits BELOW the fixed Navbar
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans text-slate-900">

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="flex-1">
            <h1 className="font-serif text-3xl font-bold text-slate-900 flex items-center gap-3">
              Wholesale Catalog
              <span className="bg-rose-100 text-rose-700 text-[10px] px-2.5 py-1 rounded-full border border-rose-200 uppercase tracking-wider font-sans font-bold">
                B2B Portal
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
              <MdInventory /> <span className="font-semibold text-slate-700">{products.length}</span> Items Available
            </p>
          </div>

          {/* Search & Tools */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-80 group">
              <input
                type="text"
                placeholder="Search SKU, Name..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-full focus:border-rose-300 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm shadow-sm"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <MdSearch className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={22} />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <MdFilterList size={20} /> <span className="hidden sm:inline">Filters</span>
              </button>

              <div className="flex bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <MdGridView size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-slate-100 text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <MdViewList size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-rose-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdSearch size={36} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => setFilters({ ...filters, search: '', category: '' })}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-bold shadow-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
            }`}>
            {products.map(product => (
              <ResellerProductCard
                key={product._id}
                product={product}
                viewMode={viewMode}
                onQuickView={() => setSelectedProduct(product)}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </main>

      {/* Filter Sidebar (Mobile/Desktop Drawer) */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-serif font-bold text-xl">Filter Options</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <MdClose size={22} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
                />
              </div>
              <div className="p-5 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
                >
                  Show {products.length} Results
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Quick View / Add to Cart Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <QuickViewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            formatPrice={formatPrice}
          />
        )}
      </AnimatePresence>

    </div>
  )
}

// --- Sub-Components ---

const ResellerProductCard = ({ product, viewMode, onQuickView, formatPrice }) => {
  const wholesalePrice = product.wholesalePrice > 0 ? product.wholesalePrice : product.price
  const retailPrice = product.price

  const hasShipping = Number(product.shippingCost) > 0
  const hasTax = Number(product.taxPercentage) > 0

  const margin = retailPrice - wholesalePrice
  const marginPercent = retailPrice > 0 ? Math.round((margin / retailPrice) * 100) : 0
  const isOutOfStock = product.stock <= 0

  // Get image URL
  const imageUrl = product.images?.[0]?.imageId
    ? `${import.meta.env.VITE_API_URL}/api/images/${product.images[0].imageId}`
    : product.images?.[0]?.url || '/placeholder.jpg'

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <div
        onClick={onQuickView}
        className={`bg-white rounded-2xl border p-5 flex gap-5 transition-all cursor-pointer group ${isOutOfStock ? 'opacity-60 border-slate-100 grayscale' : 'border-slate-200 hover:border-rose-300 hover:shadow-lg'
          }`}
      >
        <div className="w-28 h-32 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-xs text-white">
              Sold Out
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-lg mb-1 group-hover:text-rose-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Category: {product.category}</p>

              <div className="flex gap-2 mt-3">
                {hasShipping && (
                  <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100 font-bold">
                    <MdLocalShipping size={12} /> +₹{product.shippingCost}
                  </span>
                )}
                {hasTax && (
                  <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-100 font-bold">
                    <MdReceipt size={12} /> +{product.taxPercentage}% Tax
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="block font-bold text-xl text-emerald-600">{formatPrice(wholesalePrice)}</span>
              <span className="text-xs text-slate-400 line-through">MRP: {formatPrice(retailPrice)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full border border-rose-100">
              <MdTrendingUp size={14} /> {marginPercent}% Margin
            </span>
            <button className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-rose-600 transition-colors flex items-center gap-2 shadow-lg">
              <MdShoppingCart size={18} /> View Options
            </button>
          </div>
        </div>
      </div>
    )
  }

  // GRID VIEW
  return (
    <div
      onClick={onQuickView}
      className={`group bg-white rounded-2xl border overflow-hidden flex flex-col cursor-pointer transition-all duration-300 ${isOutOfStock ? 'opacity-70 border-slate-100' : 'border-slate-200 hover:shadow-2xl hover:-translate-y-2 hover:border-rose-200'
        }`}
    >
      <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`}
        />

        {/* Margin Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg border border-emerald-100">
          {marginPercent}% Return
        </div>

        {/* Shipping/Tax Indicators */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 items-start">
          {hasShipping && (
            <span className="flex items-center gap-1 text-[10px] bg-white/95 backdrop-blur text-blue-700 px-2 py-1 rounded-lg border border-blue-100 shadow-sm font-bold">
              <MdLocalShipping size={12} /> +Ship
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif font-bold text-slate-900 line-clamp-1 mb-1 text-base group-hover:text-rose-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 mb-4 line-clamp-1">{product.category}</p>

        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide mb-0.5">Wholesale</p>
              <p className="text-lg font-bold text-emerald-600 leading-none">{formatPrice(wholesalePrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide mb-0.5">MRP</p>
              <p className="text-sm text-slate-400 line-through decoration-rose-300">{formatPrice(retailPrice)}</p>
            </div>
          </div>

          <div className="w-full py-2.5 bg-slate-50 text-slate-900 font-bold text-sm rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center gap-2">
            <MdShoppingCart size={16} /> Select Size
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Quick View Modal (Logic from ProductDetails) ---
const QuickViewModal = ({ product, onClose, onAddToCart, formatPrice }) => {
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  // --- Data Normalization (Matching ProductDetails.jsx) ---
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedVariant, setSelectedVariant] = useState(null)

  useEffect(() => {
    // 1. Handle Sizes
    if (product.sizes?.length > 0) setSelectedSize(product.sizes[0])

    // 2. Handle Variants/Colors
    if (product.variants?.length > 0) {
      setSelectedVariant(product.variants[0])
    } else if (product.colors?.length > 0) {
      // Fallback for old data
      setSelectedVariant({ colorName: product.colors[0], hexCode: product.colors[0], stock: product.stock })
    }
  }, [product])

  const wholesalePrice = product.wholesalePrice > 0 ? Number(product.wholesalePrice) : Number(product.price)
  const shippingPerUnit = Number(product.shippingCost) || 0
  const taxPercent = Number(product.taxPercentage) || 0

  const taxPerUnit = (wholesalePrice * taxPercent) / 100
  const landedCostPerUnit = wholesalePrice + shippingPerUnit + taxPerUnit

  const retailPrice = Number(product.price)

  // Use variant stock if available, else product global stock
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0

  // Get image URL
  const imageUrl = product.images?.[0]?.imageId
    ? `${import.meta.env.VITE_API_URL}/api/images/${product.images[0].imageId}`
    : product.images?.[0]?.url || '/placeholder.jpg'

  const handleAdd = async () => {
    setAdding(true)
    const success = await onAddToCart(
      product,
      qty,
      selectedVariant?.colorName || selectedVariant?.hexCode || '',
      selectedSize
    )
    setAdding(false)
    if (success) onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors shadow-lg text-slate-500 hover:text-rose-600"
        >
          <MdClose size={24} />
        </button>

        {/* Gallery Side */}
        <div className="bg-slate-50 p-8 flex items-center justify-center h-[300px] md:h-auto border-r border-slate-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="max-w-full max-h-full object-contain drop-shadow-xl"
          />
        </div>

        {/* Details Side */}
        <div className="p-6 md:p-8 overflow-y-auto flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-2 leading-tight">{product.name}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-semibold">{product.category}</span>
              <span>•</span>
              <span className={!isOutOfStock ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {isOutOfStock ? 'Out of Stock' : `${currentStock} Units Available`}
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Base Wholesale</span>
                <span className="font-bold text-slate-900 text-lg">{formatPrice(wholesalePrice)}</span>
              </div>

              {(shippingPerUnit > 0 || taxPercent > 0) && (
                <div className="space-y-1 mt-2 pt-2 border-t border-slate-200/60">
                  {shippingPerUnit > 0 && (
                    <div className="flex justify-between items-center text-xs text-blue-600">
                      <span className="flex items-center gap-1"><MdLocalShipping /> Shipping</span>
                      <span className="font-semibold">+{formatPrice(shippingPerUnit)}</span>
                    </div>
                  )}
                  {taxPercent > 0 && (
                    <div className="flex justify-between items-center text-xs text-amber-600">
                      <span className="flex items-center gap-1"><MdReceipt /> Tax ({taxPercent}%)</span>
                      <span className="font-semibold">+{formatPrice(taxPerUnit)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-white flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Landed Cost / Unit</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-slate-900">{formatPrice(landedCostPerUnit)}</p>
                  <MdInfo size={16} className="text-slate-300" title="Includes Product + Shipping + Tax" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Est. Profit</p>
                <p className="text-xl font-bold text-emerald-600">~{formatPrice(retailPrice - landedCostPerUnit)}</p>
              </div>
            </div>
          </div>

          {/* Selectors (Adapted from ProductDetails) */}
          <div className="space-y-6 mb-8">

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select Size</span>
                  <span className="text-xs font-bold text-rose-600">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-10 px-3 rounded-lg text-sm font-semibold border transition-all ${selectedSize === size
                          ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                          : 'border-slate-200 text-slate-600 hover:border-slate-400'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors / Variants */}
            {(product.variants?.length > 0 || product.colors?.length > 0) && (
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select Color</span>
                  <span className="text-xs font-bold text-rose-600">
                    {selectedVariant?.colorName || selectedVariant?.hexCode}
                  </span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.variants?.length > 0
                    ? product.variants.map((variant, idx) => (
                      <button
                        key={idx}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedVariant === variant
                            ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-100'
                            : 'border-transparent ring-1 ring-slate-200'
                          }`}
                        style={{ backgroundColor: variant.hexCode }}
                        onClick={() => setSelectedVariant(variant)}
                        title={`${variant.colorName} (${variant.stock})`}
                      >
                        {selectedVariant === variant && <MdCheckCircle className="text-white drop-shadow-md" />}
                      </button>
                    ))
                    : product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedVariant?.hexCode === color
                            ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-100'
                            : 'border-transparent ring-1 ring-slate-200'
                          }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedVariant({ colorName: color, hexCode: color, stock: product.stock })}
                      >
                        {selectedVariant?.hexCode === color && <MdCheckCircle className="text-white drop-shadow-md" />}
                      </button>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-auto pt-6 border-t border-slate-100 grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Quantity</label>
              <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-full hover:bg-slate-50 font-bold text-lg">−</button>
                <div className="flex-1 text-center font-bold text-slate-900">{qty}</div>
                <button
                  onClick={() => setQty(Math.min(currentStock, qty + 1))}
                  className="w-10 h-full hover:bg-slate-50 font-bold text-lg"
                  disabled={qty >= currentStock}
                >+</button>
              </div>
            </div>

            <button
              disabled={isOutOfStock || adding}
              onClick={handleAdd}
              className="col-span-8 h-12 bg-slate-900 text-white rounded-xl font-bold hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-auto"
            >
              {adding ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isOutOfStock ? (
                <span>Out of Stock</span>
              ) : (
                <>
                  <span>Add to Wholesale Order</span>
                  <MdArrowForward size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ResellerCatalog