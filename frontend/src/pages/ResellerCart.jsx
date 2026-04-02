import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2, Plus, Minus, Package, ArrowRight,
  ShieldCheck, Lock, Loader2, Store, TrendingUp
} from 'lucide-react'
import { cartApi } from '../services/cart'
import { AuthContext } from '../context/AuthContext'
import CartSummary from '../components/CartSummary'
import toast from 'react-hot-toast'
import { getImageUrl } from '../utils/getImageUrl'

const ResellerCart = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)

  const [updatingItems, setUpdatingItems] = useState(new Set())
  const [removingId, setRemovingId] = useState(null)
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  useEffect(() => {
    if (user) {
      if (user.role !== 'reseller') {
        navigate('/cart')
        return
      }
      fetchCart()
    } else {
      setLoading(false)
    }
  }, [user, navigate])

  const fetchCart = async () => {
    try {
      const data = await cartApi.getCart()
      setCart(data.cart)
      if (data.cart?.appliedCoupon) {
        setAppliedCoupon(data.cart.appliedCoupon)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error("Could not load wholesale order")
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return
    if (updatingItems.has(item._id)) return;

    const oldCart = JSON.parse(JSON.stringify(cart))
    const updatedItems = cart.items.map(i =>
      i._id === item._id ? { ...i, quantity: newQuantity } : i
    )

    const newSubtotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
    const estimatedTotal = newSubtotal + (cart.totalShipping || 0) + (cart.totalTax || 0)

    setCart(prev => ({
      ...prev,
      items: updatedItems
    }))

    setUpdatingItems(prev => new Set(prev).add(item._id))

    try {
      // ✅ FIX: Use cart line item _id directly
      const data = await cartApi.updateCartItem(item._id, newQuantity)

      if (data.success) {
        setCart(data.cart)
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      setCart(oldCart)
      toast.error(error.response?.data?.message || "Update failed")
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(item._id)
        return next
      })
    }
  }

  const handleRemoveItem = async (itemId) => {
    // ✅ FIX: itemId is already the cart line item _id
    if (removingId) return;
    setRemovingId(itemId)

    try {
      // ✅ Use the line item _id directly
      const data = await cartApi.removeFromCart(itemId)

      if (data.success) {
        setCart(data.cart)
        toast.success("Item removed")
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error(error.response?.data?.message || "Failed to remove item")
    } finally {
      setRemovingId(null)
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('Clear entire wholesale order?')) {
      try {
        await cartApi.clearCart()
        setCart({ ...cart, items: [], totalAmount: 0, totalItems: 0, subtotal: 0, totalTax: 0, totalShipping: 0 })
        toast.success("Order cleared")
      } catch (error) {
        toast.error("Failed to clear cart")
      }
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  const getProductImage = (item) => {
    const imageUrl = item.product?.images?.[0];
    return getImageUrl(imageUrl);
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading wholesale order...</p>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-6">
            <Store className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-serif text-slate-900 mb-2">No Active Order</h2>
          <p className="text-slate-500 mb-8 text-sm">Your bulk order list is currently empty.</p>
          <Link to="/reseller/catalog" className="inline-flex items-center justify-center px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg w-full">
            Browse Catalog <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
              <Package size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
              Wholesale Order
            </h1>
          </div>
          <Link to="/reseller/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1">
            Back to Dashboard <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative">

          <div className="w-full lg:w-2/3 space-y-4">

            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm">
              <div className="col-span-6">Product Details</div>
              <div className="col-span-3 text-center">Bulk Qty</div>
              <div className="col-span-3 text-right">Subtotal</div>
            </div>

            <AnimatePresence mode='popLayout'>
              {cart.items.map((item) => (
                <motion.div
                  layout
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`bg-white rounded-xl p-4 shadow-sm border transition-all relative overflow-hidden ${removingId === item._id ? 'border-red-200 bg-red-50' : 'border-slate-200'
                    }`}
                >
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">

                    <div className="w-full md:col-span-6 flex gap-4">
                      <div className="w-20 h-24 md:w-20 md:h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100 relative border border-slate-100">
                        <img
                          src={getProductImage(item)}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        />
                        {(removingId === item._id || updatingItems.has(item._id)) && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-[1px]">
                            <Loader2 className="animate-spin text-indigo-600 w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <Link to={`/products/${item.product?._id}`} className="font-bold text-base text-slate-900 hover:text-indigo-600 truncate transition-colors">
                          {item.product?.name || "Unknown Product"}
                        </Link>

                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.selectedSize && (
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium border border-slate-200">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium border border-slate-200">
                              Color: {item.selectedColor}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-1">
                          Unit Cost: <span className="text-slate-900 font-bold">{formatPrice(item.price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:col-span-3 flex justify-between md:justify-center items-center mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-50">
                      <span className="md:hidden text-xs font-bold text-slate-400">QTY</span>
                      <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 h-9">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          disabled={item.quantity <= 1 || removingId === item._id}
                          className="w-8 flex items-center justify-center text-slate-500 hover:text-indigo-600 disabled:opacity-30"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={removingId === item._id}
                          className="w-8 flex items-center justify-center text-slate-500 hover:text-indigo-600 disabled:opacity-30"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* ✅ FIX: Pass item._id for mobile remove */}
                      <button onClick={() => handleRemoveItem(item._id)} className="md:hidden p-2 text-slate-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="hidden md:flex md:col-span-3 flex-col justify-center items-end">
                      <div className="font-bold text-lg text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {/* ✅ FIX: Pass item._id directly */}
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={removingId === item._id}
                        className="text-xs text-slate-400 hover:text-red-500 mt-1 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-end pt-2">
              <button onClick={handleClearCart} className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-wider transition-colors">
                Clear Order List
              </button>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">

              <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
                <span className="font-serif font-bold">Total Investment</span>
                <TrendingUp size={18} className="text-emerald-400" />
              </div>

              <div className="rounded-b-2xl border-x border-b border-slate-200 overflow-hidden">
                <CartSummary
                  cart={cart}
                  onCheckout={handleCheckout}
                  formatPrice={formatPrice}
                  onApplyCoupon={() => { }}
                  appliedCoupon={null}
                  onRemoveCoupon={() => { }}
                />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Verified B2B Transaction</p>
                    <p className="text-[10px] text-slate-500">Secure payment gateway</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <Lock className="text-blue-600 shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Invoice Generated</p>
                    <p className="text-[10px] text-slate-500">GST invoice sent to email</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ResellerCart