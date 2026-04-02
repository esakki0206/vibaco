import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Package, ArrowRight, ShoppingBag, Calendar, Copy, CheckCircle2 } from 'lucide-react'

const Success = () => {
  const location = useLocation()
  const [params] = useSearchParams()
  const [copied, setCopied] = useState(false)

  // Prioritize ID from Router State (more secure), fallback to URL param
  const orderId = location.state?.orderId || params.get('orderId')
  
  // Calculate delivery date (current date + 7 days)
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 7)
  
  const formattedDate = new Intl.DateTimeFormat('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(deliveryDate)

  const copyToClipboard = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience (Consistent with Login/Register) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-100/40 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative z-10 text-center p-8 md:p-12"
      >
        {/* Success Icon Animation */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
             <Check className="w-12 h-12 text-emerald-500" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Headings */}
        <h1 className="text-3xl font-serif text-slate-900 mb-2">Thank You!</h1>
        <p className="text-slate-500 mb-8">
          Your order has been placed successfully. We've sent a confirmation email with details.
        </p>

        {/* Order Details Card */}
        {orderId && (
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
            {/* Order ID Row */}
            <div className="mb-4 border-b border-slate-200 pb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Reference</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-slate-900 font-medium text-lg truncate pr-4">#{orderId.slice(-8).toUpperCase()}</span>
                <button 
                  onClick={copyToClipboard} 
                  className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-rose-600 relative group"
                  title="Copy Order ID"
                >
                  {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-slate-800 text-white px-2 py-1 rounded opacity-100 transition-opacity">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            to="/orders" 
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-rose-700 hover:-translate-y-0.5 transition-all group"
          >
            <Package size={18} />
            Track Order
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            to="/products" 
            className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Success