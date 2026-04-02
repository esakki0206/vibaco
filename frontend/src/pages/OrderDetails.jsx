import React, { useEffect, useState, useContext } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, MapPin, CreditCard, Package, Truck, 
  CheckCircle, Clock, Calendar, AlertCircle, Loader2, 
  Copy, Phone, Mail, Ticket, Building2, Receipt, 
  FileText, Printer, ChevronRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { orderApi } from '../services/orders'
import { AuthContext } from '../context/AuthContext'

const OrderDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useContext(AuthContext)
  
  // Role Detection
  const isReseller = user?.role === 'reseller'

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const data = await orderApi.getOrderById(id)
        setOrder(data.order)
      } catch (e) {
        console.error('Failed to fetch order', e)
        setError(e.response?.data?.message || 'Failed to load order details')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const copyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber || order._id)
      toast.success('Order ID copied')
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price || 0)

  // --- Helper: Get Image URL Correctly ---
  const getProductImage = (item) => {
  if (item.image) return item.image;
  return '/placeholder.jpg';
};


  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className={`w-10 h-10 animate-spin mb-4 ${isReseller ? 'text-indigo-600' : 'text-rose-600'}`} />
        <p className="text-slate-500 font-medium animate-pulse">Retrieving order details...</p>
      </div>
    )
  }

  // --- Error State ---
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Order Not Found</h2>
          <p className="text-slate-500 mb-6">{error || "We couldn't locate the order details."}</p>
          <Link to="/orders" className="inline-flex items-center justify-center w-full px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen py-12 md:py-16 px-4 md:px-8 font-sans print:bg-white print:p-0 ${
      isReseller ? 'bg-slate-50' : 'bg-stone-50/50'
    }`}>
      <div className="max-w-6xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-5 print:hidden">
          <div className="flex items-start gap-4">
            <Link 
              to="/orders" 
              className="mt-1 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 shadow-sm border border-slate-200 hover:text-slate-900 transition-all active:scale-95"
            >
              <ArrowLeft size={20} />
            </Link>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                  {isReseller ? 'Wholesale Order' : 'Order'} <span className="text-slate-400">#</span>
                  {order.orderNumber || order._id.slice(-6).toUpperCase()}
                </h1>
                
                <button 
                  onClick={copyOrderId}
                  className="text-slate-400 hover:text-slate-900 transition-colors"
                  title="Copy Order ID"
                >
                  <Copy size={16} />
                </button>
                
                <span className={`text-xs px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>

                {isReseller && (
                  <span className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                    <Building2 size={12} /> B2B
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center text-slate-500 text-sm gap-x-4 gap-y-2">
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-slate-400"/> 
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-slate-400"/> 
                  {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all text-sm font-medium shadow-sm"
            >
              <Printer size={18} /> {isReseller ? 'Print Invoice' : 'Print Order'}
            </button>

            {/* Success Banner */}
            {location.state?.success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 text-emerald-800 px-5 py-2.5 rounded-xl border border-emerald-100 flex items-center gap-3 shadow-sm"
              >
                <CheckCircle size={18} className="text-emerald-600" />
                <div>
                  <p className="font-bold text-sm">Order Placed!</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 print:block">
          
          {/* --- LEFT COLUMN: Items & Addresses --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Order Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border print:shadow-none">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center print:bg-slate-50">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <Package size={18} className={isReseller ? "text-indigo-600" : "text-rose-600"} /> 
                  {isReseller ? 'Shipment Items' : 'Order Items'}
                </h2>
                <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                  {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-5 flex gap-4 hover:bg-slate-50/30 transition-colors">
                    {/* Image */}
                    <div className="w-20 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-serif font-medium text-slate-900 line-clamp-2 leading-tight text-sm md:text-base">
                            {item.name}
                          </h3>
                          <p className="font-bold text-slate-900 whitespace-nowrap text-sm md:text-base">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          {item.selectedSize && (
                            <div className="inline-flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 mr-2">
                              Size: <span className="font-semibold text-slate-700 ml-1">{item.selectedSize}</span>
                            </div>
                          )}
                          {item.selectedColor && (
                            <div className="inline-flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                              Color: <span className="font-semibold text-slate-700 ml-1">{item.selectedColor}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2">
                        <p className="text-xs text-slate-400">
                          Qty: <span className="text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded ml-1">{item.quantity}</span>
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-slate-400">
                            {formatPrice(item.price)} / unit
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Shipping & Payment Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
              
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full print:shadow-none print:border">
                <h3 className="font-bold text-slate-900 mb-4 pb-3 border-b border-slate-50 flex items-center gap-2">
                  <MapPin size={18} className={isReseller ? "text-indigo-600" : "text-rose-600"} /> 
                  Delivery Details
                </h3>
                <div className="space-y-1 text-slate-600 text-sm flex-1">
                  <p className="font-bold text-slate-900 text-base">{order.shippingAddress?.name}</p>
                  <p>{order.shippingAddress?.address}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                  <p className="font-semibold text-slate-800">{order.shippingAddress?.pincode}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone size={14} /> <span>{order.shippingAddress?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail size={14} /> <span className="truncate">{order.customerEmail || 'No email provided'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full print:shadow-none print:border">
                <h3 className="font-bold text-slate-900 mb-4 pb-3 border-b border-slate-50 flex items-center gap-2">
                  <CreditCard size={18} className={isReseller ? "text-indigo-600" : "text-rose-600"} /> 
                  Payment Info
                </h3>
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payment Method</span>
                    <p className="font-medium text-slate-900 capitalize flex items-center gap-2 mt-1">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payment Status</span>
                    <div className="mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase ${order.paymentStatus === 'paid' || order.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                          {(order.paymentStatus === 'paid' || order.paymentStatus === 'completed') && <CheckCircle size={12} />}
                          {order.paymentStatus}
                        </span>
                    </div>
                  </div>
                  {order.paymentDetails?.transactionId && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Transaction ID</span>
                      <p className="text-xs font-mono bg-slate-50 p-2 rounded border border-slate-100 mt-1 break-all text-slate-600">
                        {order.paymentDetails.transactionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* --- RIGHT COLUMN: Summary & Timeline --- */}
          <div className="space-y-6 print:mt-6">
            
            {/* 1. Order Summary */}
            <div className={`rounded-2xl shadow-sm border p-6 print:shadow-none print:border ${
              isReseller ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'
            }`}>
              <h3 className="font-serif font-bold text-lg text-slate-900 mb-5 flex items-center gap-2">
                {isReseller ? <FileText size={20} className="text-indigo-600"/> : null}
                {isReseller ? 'Wholesale Summary' : 'Order Summary'}
              </h3>
              
              <div className="space-y-3 text-sm">
                
                {/* Subtotal */}
                <div className="flex justify-between text-slate-600">
                  <span>{isReseller ? 'Wholesale Subtotal' : 'Subtotal'}</span>
                  <span className="font-medium text-slate-900">
                    {formatPrice(order.originalSubtotal || order.subtotal || order.totalAmount)}
                  </span>
                </div>
                
                {/* Discounts */}
                {(order.discountApplied > 0 || order.discount > 0) && !isReseller && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountApplied || order.discount)}</span>
                  </div>
                )}

                {/* Coupons */}
                {order.couponDiscount > 0 && !isReseller && (
                  <div className="flex justify-between text-rose-600 bg-rose-50/50 px-2 py-1 rounded -mx-2">
                    <span className="flex items-center gap-1.5">
                      <Ticket size={14} />
                      <span>Coupon ({order.couponDetails?.code})</span>
                    </span>
                    <span>-{formatPrice(order.couponDiscount)}</span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-slate-600">
                  <span>{isReseller ? 'Shipping (Bulk)' : 'Shipping'}</span>
                  <span>{order.shippingCost === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatPrice(order.shippingCost)}</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between text-slate-600">
                  <div className="flex items-center gap-1">
                    <span>{isReseller ? 'GST (Input Credit)' : 'Tax (GST)'}</span>
                    {isReseller && <Receipt size={12} className="text-slate-400"/>}
                  </div>
                  <span>{formatPrice(order.tax)}</span>
                </div>

                <div className="border-t border-dashed border-slate-300 my-3"></div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-base">Grand Total</span>
                  <span className={`text-xl font-serif font-bold ${isReseller ? 'text-indigo-700' : 'text-rose-600'}`}>
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
                
                {isReseller && (
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    * Invoice valid for Input Tax Credit claims.
                  </p>
                )}
              </div>
            </div>

            {/* 2. Tracking Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 print:hidden">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Truck size={18} className={isReseller ? "text-indigo-600" : "text-rose-600"} /> 
                Tracking Status
              </h3>

              {/* ✅ NEW: Tracking Details Box */}
              {order.trackingDetails && (order.status === 'shipped' || order.status === 'delivered') && (
                <div className={`mb-6 p-4 rounded-xl border ${isReseller ? 'bg-indigo-50 border-indigo-100' : 'bg-blue-50 border-blue-100'}`}>
                  <h4 className={`font-bold text-xs uppercase tracking-wider mb-3 ${isReseller ? 'text-indigo-800' : 'text-blue-800'}`}>
                    Shipment Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Courier</p>
                      <p className="text-sm font-medium text-slate-900">{order.trackingDetails.courierName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Tracking ID</p>
                      <p className="text-sm font-mono font-medium text-slate-900 tracking-wide">{order.trackingDetails.trackingId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {order.statusHistory?.length > 0 ? (
                <div className="relative pl-2">
                  <div className="absolute top-2 left-[7px] bottom-6 w-0.5 bg-slate-100" />
                  
                  <div className="space-y-8">
                    {[...order.statusHistory].reverse().map((history, idx) => (
                      <div key={idx} className="relative pl-8 group">
                        <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-[3px] z-10 bg-white
                          ${idx === 0 
                            ? isReseller 
                              ? 'border-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]' 
                              : 'border-rose-500 shadow-[0_0_0_2px_rgba(225,29,72,0.1)]'
                            : 'border-slate-300'}`} 
                        />
                        <div>
                          <p className={`font-bold text-sm capitalize ${idx === 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                            {history.status}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">
                            {new Date(history.timestamp).toLocaleString('en-IN', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                          {history.note && (
                            <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 px-2 py-1.5 rounded border border-slate-100 inline-block">
                              {history.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  Status updates will appear here soon.
                </div>
              )}
            </div>

            {/* Need Help? */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center print:hidden">
              <p className="text-sm text-slate-600 mb-2">Need help with this order?</p>
              <Link 
                to="/contact" 
                className={`text-sm font-bold hover:underline ${isReseller ? 'text-indigo-600 hover:text-indigo-700' : 'text-rose-600 hover:text-rose-700'}`}
              >
                {isReseller ? 'Contact B2B Support' : 'Contact Support'}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails