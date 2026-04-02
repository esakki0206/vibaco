import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, Truck, CheckCircle, XCircle, Clock, 
  ChevronRight, ArrowRight, Calendar, ShoppingBag, Loader2
} from 'lucide-react'
import { orderApi } from '../services/orders'

const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  // Filter definitions
  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' }
  ]

  useEffect(() => {
    fetchOrders()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (filter !== 'all') params.status = filter
      
      const data = await orderApi.getUserOrders(params)
      setOrders(data.orders || [])
      setTotalOrders(data.total || 0)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- Helpers ---
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': 
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <CheckCircle size={14} /> }
      case 'shipped': 
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: <Truck size={14} /> }
      case 'cancelled': 
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: <XCircle size={14} /> }
      case 'processing':
        return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: <Package size={14} /> }
      default: 
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <Clock size={14} /> }
    }
  }

  // --- Helper: Get Image URL Correctly ---
  const getProductImage = (item) => {
    // 1. Check direct image string (snapshot)
    if (typeof item.image === 'string' && item.image.length > 0) return item.image;
    
    // 2. Check populated product images
    const images = item.product?.images;
    if (images && images.length > 0) {
      if (images[0].imageId) return `${import.meta.env.VITE_API_URL}/api/images/${images[0].imageId}`;
      if (images[0].url) return images[0].url;
    }
    return '/placeholder.jpg';
  }

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(price)

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-stone-50/50 py-6 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">My Orders</h1>
            <p className="text-slate-500 text-sm">View and track your purchase history</p>
          </div>
          
          {/* Total Badge */}
          {!loading && (
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 text-sm text-slate-600">
              <ShoppingBag size={16} className="text-slate-400" />
              <span>Total Orders: <strong className="text-slate-900">{totalOrders}</strong></span>
            </div>
          )}
        </div>

        {/* --- Sticky Filter Tabs --- */}
        <div className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md py-2 -mx-4 px-4 md:mx-0 md:px-0 mb-6 border-b border-slate-200/60 md:border-none md:bg-transparent md:backdrop-filter-none md:static">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 mask-gradient-right">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setFilter(tab.id); setPage(1); }}
                className={`
                  relative flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
                  ${filter === tab.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-200 ring-offset-1'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <AnimatePresence mode='popLayout'>
                  {orders.map((order) => {
                    const status = getStatusConfig(order.status)
                    return (
                      <motion.div
                        layout
                        key={order._id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="group bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-900/5 transition-all duration-300"
                      >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-lg tracking-tight font-mono">
                                #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                              <Calendar size={12} />
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                          
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${status.bg} ${status.border} ${status.text}`}>
                            {status.icon} {order.status}
                          </span>
                        </div>

                        {/* Image Preview Row */}
                        <Link to={`/orders/${order._id}`} className="block">
                          <div className="flex gap-3 mb-5 overflow-hidden relative">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="relative w-16 h-20 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 group-hover:border-rose-100 transition-colors">
                                <img 
                                  src={getProductImage(item)} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                  onError={(e) => e.target.src = '/placeholder.jpg'}
                                />
                                <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-tl-md backdrop-blur-sm font-medium">
                                  x{item.quantity}
                                </div>
                              </div>
                            ))}
                            
                            {order.items.length > 3 && (
                              <div className="w-16 h-20 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs font-medium flex-shrink-0">
                                <span>+{order.items.length - 3}</span>
                                <span>more</span>
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Amount</p>
                            <p className="text-lg font-bold text-slate-900 leading-tight">{formatPrice(order.totalAmount)}</p>
                          </div>
                          
                          <Link 
                            to={`/orders/${order._id}`}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 shadow-sm"
                          >
                            Details <ChevronRight size={14} />
                          </Link>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {orders.length >= 10 && (
                <div className="flex justify-center items-center gap-4 mt-10 pb-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-slate-400 font-mono">Page {page}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Inline Styles for hiding scrollbar but keeping functionality */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-gradient-right { mask-image: linear-gradient(to right, black 90%, transparent 100%); }
      `}</style>
    </div>
  )
}

// --- Sub-Components ---

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse h-[240px] flex flex-col">
    <div className="flex justify-between mb-6">
      <div className="space-y-2">
        <div className="h-5 bg-slate-100 rounded w-24"></div>
        <div className="h-3 bg-slate-100 rounded w-32"></div>
      </div>
      <div className="h-6 bg-slate-100 rounded-full w-20"></div>
    </div>
    <div className="flex gap-3 mb-6">
      <div className="w-16 h-20 bg-slate-100 rounded-lg"></div>
      <div className="w-16 h-20 bg-slate-100 rounded-lg"></div>
      <div className="w-16 h-20 bg-slate-100 rounded-lg"></div>
    </div>
    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
      <div className="space-y-1">
        <div className="h-3 bg-slate-100 rounded w-16"></div>
        <div className="h-5 bg-slate-100 rounded w-20"></div>
      </div>
      <div className="h-9 bg-slate-100 rounded-xl w-24"></div>
    </div>
  </div>
)

const EmptyState = ({ filter }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 min-h-[400px]"
  >
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
      <Package size={32} className="text-slate-300" />
    </div>
    <h2 className="text-xl font-serif text-slate-900 mb-2">No orders found</h2>
    <p className="text-slate-500 mb-8 max-w-sm text-sm">
      {filter === 'all' 
        ? "Looks like you haven't placed any orders yet." 
        : `You don't have any ${filter} orders at the moment.`}
    </p>
    {filter === 'all' && (
      <Link 
        to="/products" 
        className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium"
      >
        Start Shopping <ArrowRight size={16} />
      </Link>
    )}
  </motion.div>
)

export default OrderHistory