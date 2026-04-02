import React, { useState, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Lock, User, ArrowRight, Loader2, 
  Eye, EyeOff, AlertCircle, Building2 
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useContext(AuthContext)
  
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isPendingReseller, setIsPendingReseller] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
    if (isPendingReseller) setIsPendingReseller(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)

      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.')
        setIsPendingReseller(result.isPending === true)
        setLoading(false)
        return
      }
      setIsPendingReseller(false)

      // --- Smart Redirect Logic ---
      const role = result.user?.role
      
      // ✅ FIX: Improved redirect logic to handle complex state objects
      // Checks location.state.from (which can be an object or string)
      const fromPath = location.state?.from?.pathname || location.state?.from || null
      const appliedCoupon = location.state?.appliedCoupon || null

      // 1. If user was redirected from a protected page (like Checkout), send them back
      if (fromPath) {
        navigate(fromPath, { 
          replace: true, 
          state: { appliedCoupon } // Pass back any coupon they were using
        })
        return
      }

      // 2. Otherwise, route based on Role
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (role === 'reseller') {
        navigate('/reseller/dashboard', { replace: true })
      } else {
        navigate('/', { replace: true })
      }

    } catch (err) {
      const data = err.response?.data
      setError(data?.message || 'Login failed. Please try again.')
      setIsPendingReseller(data?.isPending === true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-slate-200/30 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative z-10"
      >
        {/* Header Section */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-600 mb-6 shadow-sm border border-rose-100">
            <User size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-serif text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Please sign in to access your account</p>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-8">
          <AnimatePresence mode='wait'>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-sm ${
                  isPendingReseller 
                    ? 'bg-amber-50 border-amber-200 text-amber-800' 
                    : 'bg-red-50 border-red-100 text-red-700'
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:translate-y-[-1px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100 space-y-4">
          <p className="text-slate-600 text-sm">
            Don't have a login? You can still shop and checkout as a guest. For business accounts, use reseller registration below.
          </p>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Business</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <Link 
            to="/reseller/register" 
            className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:text-rose-700 transition-colors group p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100"
          >
            <Building2 size={16} className="text-slate-400 group-hover:text-rose-600 transition-colors"/>
            <span>Partner / Reseller Registration</span>
            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login