import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext' // ✅ Important: Added this
import CartSummary from '../components/CartSummary'
import toast from 'react-hot-toast'
import { getImageUrl } from '../utils/getImageUrl'

const Cart = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  // ✅ FIX: Use CartContext to get global cart state and methods
  // This ensures guest items from localStorage are visible
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useContext(CartContext)

  const [updatingItems, setUpdatingItems] = useState(new Set())
  const [removingId, setRemovingId] = useState(null)
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  useEffect(() => {
    if (user && user.role === 'reseller') {
      navigate('/reseller/cart', { replace: true })
      return
    }
  }, [user, navigate])

  // ✅ FIX: Removed local fetchCart and local useEffect that was checking for !user

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return
    if (updatingItems.has(item._id)) return;

    setUpdatingItems(prev => new Set(prev).add(item._id))

    try {
      // ✅ Use context method instead of direct API call
      await updateQuantity(item._id, newQuantity)
      if (appliedCoupon) await revalidateCoupon(cart)
    } catch (error) {
      console.error('Update failed:', error)
      toast.error("Could not update quantity")
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(item._id)
        return next
      })
    }
  }

  const handleRemoveItem = async (itemId) => {
    if (removingId) return;
    setRemovingId(itemId)

    try {
      // ✅ Use context method instead of direct API call
      await removeFromCart(itemId)
      if (appliedCoupon && cart.items.length > 0) {
        await revalidateCoupon(cart)
      } else if (cart.items.length === 0) {
        setAppliedCoupon(null)
      }
    } catch (error) {
      console.error('Remove error:', error)
      toast.error("Failed to remove item")
    } finally {
      setRemovingId(null)
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to remove all items?')) {
      try {
        await clearCart()
        setAppliedCoupon(null)
      } catch (error) {
        toast.error("Failed to clear cart")
      }
    }
  }

  // Coupon logic remains the same (Retail only)
  const handleCouponCheck = async (code) => {
    // Note: If you want coupons for guests, ensure your cartApi doesn't require Auth for validation
    try {
      // This still uses cartApi directly as coupons aren't usually in LocalStorage
      const res = await cartApi.validateCoupon({
        code,
        cartTotal: cart.totalAmount,
        cartItems: cart.items
      })
      const couponData = {
        code: res.couponCode || code,
        discountAmount: res.discountAmount || res.discount || 0
      }
      setAppliedCoupon(couponData)
      return couponData
    } catch (error) {
      setAppliedCoupon(null)
      throw error
    }
  }

  const revalidateCoupon = async (updatedCart) => {
    if (!appliedCoupon) return
    try {
      const res = await cartApi.validateCoupon({
        code: appliedCoupon.code,
        cartTotal: updatedCart.totalAmount,
        cartItems: updatedCart.items
      })
      if (res.discountAmount !== appliedCoupon.discountAmount) {
        setAppliedCoupon({
          code: res.couponCode || appliedCoupon.code,
          discountAmount: res.discountAmount || 0
        })
      }
    } catch (error) {
      setAppliedCoupon(null)
      toast.error("Coupon removed: Order value too low")
    }
  }

  const handleCheckout = () => {
    // Checkout is now available without login for regular customers.
    // Retailers are already redirected to the reseller cart in the effect above.
    navigate('/checkout', { state: { appliedCoupon } })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(price)
  }

  const getProductImage = (item) => {
    // 1. Auth users: derive color-specific image from populated product's colorImages
    if (item.product?.colorImages?.length > 0 && item.selectedColor) {
      const entry = item.product.colorImages.find(ci => ci.color === item.selectedColor);
      if (entry?.image?.url) return entry.image.url;
    }
    // 2. Guest users: selectedColorImage stored directly on the item
    if (item.selectedColorImage) return item.selectedColorImage;
    // 3. Final fallback: first product image
    return getImageUrl(item.product?.images?.[0]);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading your bag...</p>
      </div>
    )
  }

  // ✅ Now this properly checks the Context cart, which includes guest items
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-sm mb-6">
            <ShoppingBag className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-3xl font-serif text-slate-900 mb-3">Your Bag is Empty</h2>
          <Link to="/products" className="inline-flex items-center px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-rose-700 transition-colors shadow-lg">
            Start Shopping <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-6 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-serif text-slate-900 mb-2">Shopping Bag</h1>
            <p className="text-slate-500 text-sm md:text-base">
              <span className="font-semibold text-slate-900">{cart.totalItems} items</span> in your cart
            </p>
          </div>
          <Link to="/products" className="text-rose-600 font-medium hover:text-rose-800 flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Continue Shopping
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative">
          <div className="w-full lg:w-2/3 space-y-4">
            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-2 px-4">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <AnimatePresence mode='popLayout'>
              {cart.items.map((item) => (
                <motion.div
                  layout
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl p-3 md:p-4 shadow-sm border transition-all ${removingId === item._id ? 'border-red-200 bg-red-50' : 'border-slate-100 hover:border-rose-100'}`}
                >
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                    <div className="w-full md:col-span-6 flex gap-3 md:gap-4">
                      <div className="w-20 h-24 md:w-24 md:h-32 shrink-0 rounded-lg overflow-hidden bg-slate-100 relative border border-slate-100">
                        <img
                          src={getProductImage(item)}
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        />
                        {(removingId === item._id || updatingItems.has(item._id)) && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                            <Loader2 className="animate-spin text-rose-600 w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                        <div>
                          <Link to={`/products/${item.product?._id}`} className="font-serif text-base md:text-lg text-slate-900 hover:text-rose-600 transition-colors line-clamp-2 leading-tight">
                            {item.product?.name || "Unknown Product"}
                          </Link>
                          <div className="text-xs md:text-sm text-slate-500 mt-1.5 space-y-0.5">
                            {item.selectedSize && <p>Size: <span className="text-slate-700 font-medium">{item.selectedSize}</span></p>}
                            {item.selectedColor && <p>Color: <span className="text-slate-700 font-medium">{item.selectedColor}</span></p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:col-span-3 flex justify-between md:justify-center items-center mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-50">
                      <div className="flex items-center gap-2 md:gap-0 w-full md:w-auto justify-between md:justify-center">
                        <span className="md:hidden text-xs text-slate-400 font-medium uppercase tracking-wider">Quantity:</span>
                        <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
                          <button onClick={() => handleQuantityChange(item, item.quantity - 1)} disabled={item.quantity <= 1 || removingId === item._id} className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 shadow-sm hover:text-rose-600 active:scale-95 disabled:opacity-50">
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-medium text-slate-900 select-none">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item, item.quantity + 1)} disabled={removingId === item._id} className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 shadow-sm hover:text-rose-600 active:scale-95 disabled:opacity-50">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex md:col-span-3 flex-col justify-center items-end text-right">
                      <div className="font-medium text-lg text-slate-900">{formatPrice(item.price * item.quantity)}</div>
                      <button onClick={() => handleRemoveItem(item._id)} disabled={removingId === item._id} className="flex items-center text-xs font-medium text-slate-400 hover:text-red-500 mt-3 transition-colors px-2 py-1 rounded hover:bg-red-50">
                        <Trash2 size={14} className="mr-1.5" /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="pt-4 flex justify-end">
              <button onClick={handleClearCart} className="text-xs md:text-sm text-slate-400 hover:text-red-500 transition-colors underline decoration-slate-300 underline-offset-4">
                Clear Shopping Bag
              </button>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              <CartSummary
                cart={cart}
                onCheckout={handleCheckout}
                formatPrice={formatPrice}
                onApplyCoupon={handleCouponCheck}
                appliedCoupon={appliedCoupon}
                onRemoveCoupon={() => setAppliedCoupon(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart