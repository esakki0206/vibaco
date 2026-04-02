import React, { useState, useEffect, useContext, useRef, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  MdShoppingCart, MdFavorite, MdFavoriteBorder,
  MdZoomIn, MdClose, MdCheckCircle, MdArrowForward,
  MdChevronRight, MdImageNotSupported
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { productsApi } from '../services/products'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import { getImageUrl } from '../utils/getImageUrl';

// --- Helper: Toast Notification ---
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
      className={`toast-notification ${type}`}
    >
      {type === 'success' ? <MdCheckCircle size={20} /> : <MdClose size={20} />}
      <span>{message}</span>
    </motion.div>
  )
}

// --- Main Component ---
const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { addToCart } = useContext(CartContext)
  const mobileGalleryRef = useRef(null)

  // Data State
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  // Interaction State
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [showImageZoom, setShowImageZoom] = useState(false)
  const [toast, setToast] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Fetch Data
  // Fetch Data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true)
        window.scrollTo(0, 0)
        const data = await productsApi.getProductById(id)
        const prod = data.product;
        setProduct(prod)

        // --- FIX: Normalize Data for Defaults ---
        // 1. Handle Sizes (With Fallback)
        // If sizes exist, use them. If not, default to ['Free Size']
        const availableSizes = prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['Free Size'];
        setSelectedSize(availableSizes[0]); // Auto-select the first available size

        // 2. Handle Colors — prefer colorImages (new format) over plain colors
        const firstColor = prod.colorImages?.length > 0
          ? prod.colorImages[0].color
          : (prod.colors?.length > 0 ? prod.colors[0] : '');
        if (firstColor) setSelectedColor(firstColor);

      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProductData()
  }, [id])

  // Compute an images array that puts the selected color's image first
  const activeImages = useMemo(() => {
    if (!product) return [];
    if (product.colorImages?.length > 0 && selectedColor) {
      const entry = product.colorImages.find(ci => ci.color === selectedColor);
      if (entry?.image?.url) {
        const colorImg = { url: entry.image.url, publicId: entry.image.publicId || '' };
        const others = (product.images || []).filter(img => img.url !== entry.image.url);
        return [colorImg, ...others];
      }
    }
    return product.images || [];
  }, [product, selectedColor]);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedImage(0); // Reset gallery to first (color-specific) image
  };

  const isProgrammaticScroll = useRef(false);

  // Sync mobile slider with selected image
  useEffect(() => {
    if (mobileGalleryRef.current) {
      isProgrammaticScroll.current = true;
      const width = mobileGalleryRef.current.clientWidth;
      mobileGalleryRef.current.scrollTo({
        left: selectedImage * width,
        behavior: 'smooth'
      });
      // Release the lock after the smooth scroll animation completes
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 400);
    }
  }, [selectedImage]);

  // Handle Mobile Gallery Scroll (user-initiated only)
  const handleMobileScroll = () => {
    // Skip if this scroll event was triggered programmatically
    if (isProgrammaticScroll.current) return;
    if (mobileGalleryRef.current) {
      const scrollLeft = mobileGalleryRef.current.scrollLeft
      const width = mobileGalleryRef.current.clientWidth
      if (width > 0) {
        const index = Math.round(scrollLeft / width)
        setSelectedImage(index)
      }
    }
  }

  const handleAddToCart = async () => {
    // REMOVE: The user check and navigate redirect

    const currentStock = product.stock || 0;
    if (currentStock <= 0) return;

    setAddingToCart(true);
    try {
      await addToCart({
        ...product,
        selectedSize,
        selectedColor
      }, quantity);

      setToast({ message: 'Added to cart!', type: 'success' });
    } catch (error) {
      // If your backend requires a user, the CartContext should handle 
      // saving to LocalStorage for guests instead.
      setToast({ message: 'Could not add to cart', type: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  // Prevent background scroll when Zoom Modal is open
  useEffect(() => {
    document.body.style.overflow = showImageZoom ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [showImageZoom])

  // Remove scrolling logic tied to variants

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Loading details...</p>
    </div>
  )

  if (!product) return (
    <div className="error-container">
      <h2>Product Not Found</h2>
      <Link to="/" className="btn-primary">Back to Store</Link>
    </div>
  )

  const discountPercentage = product.discountPercentage || 0;

  const currentPrice =
    discountPercentage > 0
      ? Math.round(product.price * (1 - discountPercentage / 100))
      : product.price;

  const currentStock = product.stock || 0;

  const mobileDisplayImages = activeImages;

  return (
    <div className="product-page">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="container">
        <nav className="breadcrumbs">
          <Link to="/">Home</Link> <MdChevronRight className="crumb-icon" />
          <Link to="/products">Collection</Link> <MdChevronRight className="crumb-icon" />
          <span className="current">{product.name}</span>
        </nav>
      </div>

      <div className="container main-content">
        <div className="product-grid">

          {/* --- LEFT: GALLERY --- */}
          <div className="gallery-section">
            <div className="desktop-gallery">
              {/* MAIN IMAGE */}
              <div
                className="main-image-wrapper"
                onClick={() => setShowImageZoom(true)}
              >
                {activeImages[selectedImage] ? (
                  <img
                    className="main-image"
                    src={getImageUrl(activeImages[selectedImage])}
                    alt={activeImages[selectedImage]?.alt || product.name}
                    onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                  />
                ) : (
                  <div className="placeholder-image">
                    <MdImageNotSupported size={48} className="text-slate-300" />
                  </div>
                )}

                <button className="zoom-trigger" title="Zoom">
                  <MdZoomIn size={22} />
                </button>

                {discountPercentage > 0 && (
                  <span className="discount-tag">-{discountPercentage}%</span>
                )}
              </div>

              {/* THUMBNAILS */}
              {activeImages.length > 1 && (
                <div className="thumbnails-scroll">
                  {activeImages.map((img, idx) => (
                    <div
                      key={idx}
                      className={`thumbnail ${selectedImage === idx ? 'active' : ''
                        }`}
                      onMouseEnter={() => setSelectedImage(idx)}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`View ${idx + 1}`}
                        onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Gallery */}
            <div className="mobile-gallery">
              <div className="mobile-slider" ref={mobileGalleryRef} onScroll={handleMobileScroll}>
                {mobileDisplayImages?.length > 0 ? mobileDisplayImages.map((img, idx) => (
                  <div key={idx} className="mobile-slide" onClick={() => setShowImageZoom(true)}>
                    <img src={getImageUrl(img)} alt={img.alt || product.name} />
                  </div>
                )) : (
                  <div className="mobile-slide placeholder">
                    <MdImageNotSupported size={48} className="text-slate-300" />
                  </div>
                )}
              </div>

              {mobileDisplayImages?.length > 1 && (
                <div className="mobile-dots">
                  {mobileDisplayImages.map((_, idx) => (
                    <span key={idx} className={`dot ${selectedImage === idx ? 'active' : ''}`} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT: DETAILS --- */}
          <div className="details-section">
            <div className="product-header">
              <h1 className="title">{product.name}</h1>
              <p className="subtitle">{product.description?.substring(0, 150)}...</p>
            </div>

            <div className="price-box">
              <div className="price-row">
                <span className="final-price">{formatPrice(currentPrice)}</span>
                {discountPercentage > 0 && (
                  <span className="mrp">{formatPrice(product.price)}</span>
                )}
              </div>
              <p className="tax-note">Inclusive of all taxes</p>
            </div>

            <div className="divider"></div>

            <div className="selectors-container">
              {/* Sizes */}
              <div className="selector-group">
                <div className="label-row">
                  <span className="label">Select Size</span>
                  <span className="selected-value">{selectedSize}</span>
                </div>
                <div className="options-grid">
                  {/* FIX: Use fallback if product.sizes is missing */}
                  {(product.sizes && product.sizes.length > 0 ? product.sizes : ['Free Size']).map(size => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              {(() => {
                // Prefer colorImages entries for color list, fallback to plain colors array
                const colorList = product.colorImages?.length > 0
                  ? product.colorImages.map(ci => ci.color)
                  : (product.colors || []);
                if (colorList.length === 0) return null;
                return (
                  <div className="selector-group">
                    <div className="label-row">
                      <span className="label">Select Color</span>
                      <span className="selected-value">{selectedColor}</span>
                    </div>
                    <div className="options-grid">
                      {colorList.map(color => (
                        <button
                          key={color}
                          className={`size-btn ${selectedColor === color ? 'selected' : ''}`}
                          onClick={() => handleColorChange(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="actions-desktop">
              <div className="qty-wrapper">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span className="qty-val">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(currentStock, quantity + 1))} disabled={quantity >= currentStock}>+</button>
              </div>

              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={currentStock <= 0 || addingToCart}
              >
                {currentStock <= 0 ? (
                  'Out of Stock'
                ) : addingToCart ? (
                  <span className="loading-text">Adding...</span>
                ) : (
                  <>Add to Cart <MdArrowForward size={20} /></>
                )}
              </button>

              <button
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
                title="Wishlist"
              >
                {isWishlisted ? <MdFavorite /> : <MdFavoriteBorder />}
              </button>
            </div>

            {currentStock < 10 && currentStock > 0 && (
              <p className="stock-warning">
                <span className="pulse-dot"></span> Only {currentStock} units left!
              </p>
            )}

            <div className="divider"></div>

            <div className="product-tabs">
              <div className="tabs-header">
                <button className="tab-btn active">
                  Description
                  <motion.div layoutId="underline" className="active-line" />
                </button>
              </div>
              <div className="tab-body">
                <p>{product.description}</p>
                {product.highlights && (
                  <ul className="highlights-list">
                    {product.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-footer">
        <div className="mobile-qty-selector">
          <button
            className="qty-btn"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          > − </button>
          <span className="qty-display">{quantity}</span>
          <button
            className="qty-btn"
            onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
            disabled={quantity >= currentStock}
          > + </button>
        </div>

        <div className="footer-info">
          <span className="price-label">Total</span>
          <span className="price-val">{formatPrice(currentPrice * quantity)}</span>
        </div>

        <button
          className="mobile-cta"
          onClick={handleAddToCart}
          disabled={currentStock <= 0 || addingToCart}
        >
          {addingToCart ? <div className="spinner-small"></div> : <MdShoppingCart size={20} />}
          {currentStock <= 0 ? 'No Stock' : addingToCart ? 'Adding' : 'Add'}
        </button>
      </div>

      <AnimatePresence>
        {showImageZoom && mobileDisplayImages?.[selectedImage] && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="zoom-modal"
            onClick={() => setShowImageZoom(false)}
          >
            <button className="zoom-close"><MdClose size={24} /></button>
            <motion.img
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={getImageUrl(mobileDisplayImages[selectedImage])}
              alt="Zoomed"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CSS STYLES --- */}
      <style>{`
        :root {
          --primary: #0f172a;
          --accent: #e11d48;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --bg-page: #ffffff;
          --border: #e2e8f0;
          --bg-subtle: #f8fafc;
        }

        .product-page {
          background-color: var(--bg-page);
          min-height: 100vh;
          /* FIX: Added more breathing room top and bottom */
          padding-top: 20px;
          padding-bottom: 120px; 
          font-family: 'Inter', sans-serif;
          color: var(--text-main);
          position: relative;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Loader */
        .loader-container { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
        .spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid var(--accent); border-radius: 50%; animation: spin 1s linear infinite; }
        .spinner-small { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* Error */
        .error-container { text-align: center; padding-top: 100px; }
        .btn-primary { display: inline-block; margin-top: 16px; padding: 12px 28px; background: var(--text-main); color: white; text-decoration: none; border-radius: 8px; font-weight: 500; }

        /* Breadcrumbs */
        .breadcrumbs {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: var(--text-muted);
          padding: 20px 0 30px; /* More space */
        }
        .breadcrumbs a { text-decoration: none; color: var(--text-muted); transition: color 0.2s; }
        .breadcrumbs a:hover { color: var(--accent); }
        .breadcrumbs .current { color: var(--text-main); font-weight: 500; }
        .crumb-icon { font-size: 16px; color: #cbd5e1; }

        /* FIX: Grid Layout Spacing */
        .main-content { margin-top: 0; }
        .product-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 80px; /* Increased gap from 56px to 80px */
          align-items: start;
        }

        /* === Gallery Styles === */
        .gallery-section { position: relative; }
        .desktop-gallery { position: sticky; top: 120px; display: grid; gap: 20px; }
        
        .main-image-wrapper {
          position: relative;
          border-radius: 16px; /* Softer corners */
          overflow: hidden;
          background: var(--bg-subtle);
          aspect-ratio: 4/5;
          cursor: zoom-in;
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
        }
        .main-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .main-image-wrapper:hover .main-image { transform: scale(1.03); }
        .placeholder-image { color: #cbd5e1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }

        .discount-tag {
          position: absolute; top: 16px; left: 16px;
          background: var(--accent); color: white;
          font-size: 13px; font-weight: 700;
          padding: 6px 12px; border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          z-index: 2;
        }
        .zoom-trigger {
          position: absolute; bottom: 16px; right: 16px;
          background: white; border: none; border-radius: 50%;
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          color: var(--text-main); cursor: pointer;
          transition: all 0.2s; opacity: 0; transform: translateY(10px);
        }
        .main-image-wrapper:hover .zoom-trigger { opacity: 1; transform: translateY(0); }

        .thumbnails-scroll {
          display: flex; gap: 16px; overflow-x: auto; padding-bottom: 4px;
        }
        .thumbnail {
          width: 76px; height: 76px; border-radius: 12px;
          overflow: hidden; cursor: pointer;
          border: 2px solid transparent; opacity: 0.6; transition: all 0.2s;
          flex-shrink: 0; background: var(--bg-subtle);
        }
        .thumbnail.active { border-color: var(--text-main); opacity: 1; transform: translateY(-2px); }
        .thumbnail img { width: 100%; height: 100%; object-fit: cover; }

        /* Mobile Gallery */
        .mobile-gallery { display: none; }

        /* === Details Styles === */
        .details-section { padding-top: 10px; }
        
        .rating-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: #fffbeb; color: #b45309;
          padding: 4px 12px; border-radius: 20px;
          font-size: 13px; font-weight: 600; margin-bottom: 16px;
        }
        .star-icon { color: #f59e0b; }
        .review-text { color: var(--text-muted); font-weight: 400; margin-left: 4px; }

        .product-header .title {
          font-family: 'Playfair Display', serif;
          font-size: 38px; /* Larger title */
          font-weight: 700;
          margin-bottom: 12px; line-height: 1.2; letter-spacing: -0.5px;
        }
        .subtitle { font-size: 16px; color: var(--text-muted); line-height: 1.7; margin-bottom: 32px; max-width: 90%; }

        .price-box { margin-bottom: 36px; }
        .price-row { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }
        .final-price { font-size: 32px; font-weight: 700; color: var(--text-main); letter-spacing: -0.5px; }
        .mrp { font-size: 20px; text-decoration: line-through; color: #94a3b8; font-weight: 400; }
        .tax-note { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

        .divider { height: 1px; background: var(--border); margin: 36px 0; }

        /* Selectors */
        .selectors-container { display: flex; flex-direction: column; gap: 32px; }
        .label-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
        .selected-value { color: var(--text-main); font-weight: 600; text-transform: none; letter-spacing: 0; }
        
        .options-grid { display: flex; flex-wrap: wrap; gap: 12px; }
        .size-btn {
          min-width: 52px; height: 44px; padding: 0 16px;
          background: white; border: 1px solid var(--border);
          border-radius: 8px; font-size: 14px; font-weight: 500;
          color: var(--text-main); cursor: pointer; transition: all 0.2s;
        }
        .size-btn:hover { border-color: var(--text-muted); }
        .size-btn.selected { background: var(--text-main); color: white; border-color: var(--text-main); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

        .colors-row { display: flex; gap: 14px; flex-wrap: wrap; }
        .color-dot {
          width: 40px; height: 40px; border-radius: 50%;
          border: 2px solid white; 
          box-shadow: 0 0 0 1px #cbd5e1;
          cursor: pointer; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .color-dot:hover { transform: scale(1.1); box-shadow: 0 0 0 1px var(--text-muted); }
        .color-dot.selected { 
          transform: scale(1.15);
          box-shadow: 0 0 0 2px var(--text-main), inset 0 0 0 2px white; 
          z-index: 10;
        }
        .color-check { 
          color: white; font-size: 20px; 
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)); 
          animation: scaleIn 0.2s ease;
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Desktop Actions */
        .actions-desktop { display: flex; gap: 16px; margin-top: 48px; height: 52px; }
        
        .qty-wrapper {
          display: flex; align-items: center;
          border: 1px solid var(--border); border-radius: 10px;
          background: white; overflow: hidden;
        }
        .qty-wrapper button {
          width: 44px; height: 100%; border: none; background: transparent;
          font-size: 20px; color: var(--text-muted); cursor: pointer; transition: background 0.2s;
        }
        .qty-wrapper button:hover { background: #f8fafc; color: var(--text-main); }
        .qty-val { width: 40px; text-align: center; font-weight: 600; font-size: 16px; }

        .add-to-cart-btn {
          flex: 1; background: var(--text-main); color: white;
          border: none; border-radius: 10px;
          font-size: 16px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.2s; box-shadow: 0 4px 12px rgba(15,23,42,0.15);
        }
        .add-to-cart-btn:hover { background: #1e293b; transform: translateY(-2px); }
        .add-to-cart-btn:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

        .wishlist-btn {
          width: 52px; border: 1px solid var(--border); background: white;
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-size: 24px; color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .wishlist-btn:hover { border-color: var(--accent); color: var(--accent); background: #fff1f2; }
        .wishlist-btn.active { color: var(--accent); border-color: var(--accent); background: #fff1f2; }

        .stock-warning { font-size: 13px; color: #b91c1c; font-weight: 600; margin-top: 16px; display: flex; align-items: center; gap: 8px; }
        .pulse-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 70% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }

        /* Tabs */
        .product-tabs { margin-top: 16px; }
        .tabs-header { display: flex; gap: 40px; border-bottom: 1px solid var(--border); margin-bottom: 24px; position: relative; }
        .tab-btn {
          background: none; border: none; padding: 16px 0;
          font-size: 15px; font-weight: 600; color: var(--text-muted);
          cursor: pointer; position: relative; transition: color 0.2s;
        }
        .tab-btn.active { color: var(--text-main); }
        .active-line {
          position: absolute; bottom: -1px; left: 0; right: 0; height: 2px;
          background: var(--text-main);
        }
        .tab-body { font-size: 16px; line-height: 1.8; color: var(--text-muted); min-height: 100px; }
        .highlights-list { padding-left: 20px; margin-top: 16px; }

        /* Toast */
        .toast-notification {
          position: fixed; top: 100px; left: 50%; transform: translateX(-50%);
          background: #1e293b; color: white; padding: 12px 24px;
          border-radius: 50px; display: flex; align-items: center; gap: 12px;
          font-size: 14px; font-weight: 500; z-index: 9999;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
        }
        .toast-notification.error { background: #ef4444; }

        /* Mobile Footer (Hidden Desktop) */
        .mobile-footer { display: none; }

        /* Zoom Modal */
        .zoom-modal {
          position: fixed; inset: 0; background: rgba(255,255,255,0.98);
          z-index: 9999; display: flex; align-items: center; justify-content: center;
        }
        .zoom-modal img { max-width: 95%; max-height: 90vh; object-fit: contain; cursor: zoom-out; }
        .zoom-close {
          position: absolute; top: 24px; right: 24px; background: #f1f5f9;
          border: none; cursor: pointer; width: 48px; height: 48px; border-radius: 50%;
          color: var(--text-main); display: flex; align-items: center; justify-content: center;
        }

        /* --- RESPONSIVE DESIGN --- */
        @media (max-width: 1024px) {
          .product-grid { gap: 40px; }
        }

        @media (max-width: 900px) {
          .product-page { 
            padding-top: 0;
            padding-bottom: 120px; /* Space for fixed footer */
          }
          .container { padding: 0 16px; }
          .product-grid { grid-template-columns: 1fr; gap: 32px; }
          
          /* Switch Gallery to Mobile Mode */
          .desktop-gallery { display: none; }
          .mobile-gallery { display: block; position: relative; margin: 0 -16px; }
          
          .mobile-slider {
            display: flex; overflow-x: auto; 
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            scrollbar-width: none;
          }
          .mobile-slider::-webkit-scrollbar { display: none; }
          
          .mobile-slide {
            flex: 0 0 100%; scroll-snap-align: center; scroll-snap-stop: always;
            aspect-ratio: 4/5; position: relative;
            display: flex; align-items: center; justify-content: center;
            background: var(--bg-subtle);
          }
          .mobile-slide.placeholder { color: #cbd5e1; }
          .mobile-slide img { width: 100%; height: 100%; object-fit: cover; }
          
          .mobile-dots {
            position: absolute; bottom: 16px; left: 0; right: 0;
            display: flex; justify-content: center; gap: 8px; pointer-events: none;
          }
          .dot {
            width: 8px; height: 8px; background: rgba(255,255,255,0.5); border-radius: 50%;
            transition: all 0.2s; backdrop-filter: blur(4px); box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          }
          .dot.active { background: white; transform: scale(1.2); }
          
          .details-section { padding: 0 8px; }
          .product-header .title { font-size: 28px; }
          .final-price { font-size: 28px; }
          
          /* Hide Desktop Actions */
          .actions-desktop { display: none; }
          
          /* Show Mobile Footer */
          .mobile-footer {
            display: flex; align-items: center; gap: 12px;
            position: fixed; bottom: 0; left: 0; right: 0;
            background: white; padding: 12px 16px;
            box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
            z-index: 1000; border-top: 1px solid var(--border);
            padding-bottom: max(12px, env(safe-area-inset-bottom));
          }
          
          .mobile-qty-selector {
            display: flex; align-items: center; gap: 0;
            border: 1px solid var(--border); border-radius: 8px;
            background: white; overflow: hidden; height: 48px;
          }
          .qty-btn {
            width: 44px; height: 100%; border: none; background: transparent;
            font-size: 20px; color: var(--text-main); cursor: pointer;
            display: flex; align-items: center; justify-content: center;
          }
          .qty-btn:active { background: #f1f5f9; }
          .qty-display { min-width: 32px; text-align: center; font-weight: 600; font-size: 16px; }
          
          .footer-info { display: flex; flex-direction: column; gap: 0; flex: 1; padding: 0 8px; }
          .price-label { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
          .price-val { font-size: 18px; font-weight: 700; color: var(--text-main); }
          
          .mobile-cta {
            background: var(--text-main); color: white; border: none;
            padding: 0 24px; height: 48px; border-radius: 8px; 
            font-weight: 600; font-size: 15px; cursor: pointer;
            display: flex; align-items: center; gap: 8px; white-space: nowrap;
            transition: all 0.2s; box-shadow: 0 2px 8px rgba(15,23,42,0.15);
          }
          .mobile-cta:active { transform: scale(0.96); }
          
          .trust-grid { padding-bottom: 24px; border-bottom: 1px solid var(--border); }
        }
      `}</style>
    </div>
  )
}

export default ProductDetails