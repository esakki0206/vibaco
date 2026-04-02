import React, { useState, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, User, ArrowRight, Loader2,
  Eye, EyeOff, AlertCircle, Building2, Gift
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

      const role = result.user?.role

      const fromPath = location.state?.from?.pathname || location.state?.from || null
      const appliedCoupon = location.state?.appliedCoupon || null

      if (fromPath) {
        navigate(fromPath, {
          replace: true,
          state: { appliedCoupon }
        })
        return
      }

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
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-burgundy-100/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gold-100/30 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative z-10 border border-warmgray-100"
      >
        {/* Header Section */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-burgundy-800 to-burgundy-900 text-gold-300 mb-6 shadow-lg">
            <Gift size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-serif text-warmgray-900 mb-2">Welcome Back</h1>
          <p className="text-warmgray-500 text-sm">Sign in to your Vibaco Gifts account</p>
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
              <label className="text-xs font-semibold uppercase tracking-wider text-warmgray-500 pl-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-warmgray-400 group-focus-within:text-burgundy-800 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:border-burgundy-500 focus:ring-4 focus:ring-burgundy-500/10 transition-all outline-none text-warmgray-900 placeholder:text-warmgray-400"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-warmgray-500" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-burgundy-800 hover:text-burgundy-900 font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-warmgray-400 group-focus-within:text-burgundy-800 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3.5 bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:border-burgundy-500 focus:ring-4 focus:ring-burgundy-500/10 transition-all outline-none text-warmgray-900 placeholder:text-warmgray-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-warmgray-400 hover:text-warmgray-600 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-xl font-medium transition-all shadow-lg shadow-burgundy-900/20 hover:shadow-xl hover:translate-y-[-1px] disabled:opacity-70 disabled:cursor-not-allowed"
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

        <div className="bg-cream-50 p-6 text-center border-t border-warmgray-100 space-y-4">
          <p className="text-warmgray-600 text-sm">
            Don't have a login? You can still shop and checkout as a guest. For business accounts, use reseller registration below.
          </p>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-warmgray-200"></div>
            <span className="flex-shrink-0 mx-4 text-warmgray-400 text-[10px] font-bold uppercase tracking-widest">Business</span>
            <div className="flex-grow border-t border-warmgray-200"></div>
          </div>

          <Link
            to="/reseller/register"
            className="flex items-center justify-center gap-2 text-sm font-medium text-warmgray-700 hover:text-burgundy-800 transition-colors group p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-warmgray-100"
          >
            <Building2 size={16} className="text-warmgray-400 group-hover:text-burgundy-700 transition-colors"/>
            <span>Partner / Reseller Registration</span>
            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
