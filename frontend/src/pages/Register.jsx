import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, ArrowRight, FileText } from 'lucide-react'

const Register = () => {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 md:py-8 relative overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-slate-200/30 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[500px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative z-10 my-4"
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 text-rose-600 mb-4 shadow-sm">
            <User size={28} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-serif text-slate-900 mb-2">Customer Sign-up Closed</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            New customer registrations are currently disabled. You can still shop and checkout as a guest without creating an account.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 md:px-8 pb-10 space-y-6">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 text-sm text-rose-800">
            <FileText className="w-5 h-5 mt-0.5" />
            <p>
              You no longer need an account to place an order as a customer. Simply add products to your cart and complete checkout as a guest using your delivery details and email.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">For business / reseller accounts</h2>
            <p className="text-sm text-slate-600">
              If you are a retailer or reseller and would like to buy at wholesale prices, please use our dedicated reseller registration page.
            </p>

            <Link
              to="/reseller/register"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-lg hover:bg-rose-600 hover:shadow-rose-500/30 transition-all"
            >
              Go to Reseller Registration
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-slate-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-800 transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// Helper component to reduce repetition for standard inputs
const InputGroup = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-600 transition-colors">
      {icon}
    </div>
    <input
      {...props}
      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400"
      required={props.required !== false}
    />
  </div>
)

export default Register