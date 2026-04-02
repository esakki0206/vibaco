import React, { useState, useContext, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Phone, Save, Loader2, 
  Package, MapPin, LogOut, ChevronRight, CheckCircle 
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { authApi } from '../services/auth'

const Profile = () => {
  const { user, logout } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('profile') // 'profile', 'orders', 'addresses'

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', '']
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (success) setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Simulate API call
      // await authApi.updateProfile({ name: `${formData.firstName} ${formData.lastName}`, ... })
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Update failed', error)
    } finally {
      setLoading(false)
    }
  }

  // Navigation Items
  const navItems = [
    { id: 'profile', label: 'My Profile', icon: <User size={20} /> },
  ]

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-slate-900">Account Settings</h1>
          <p className="text-slate-500">Manage your personal details and orders</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
              
              {/* User Mini-Summary (Read-only) */}
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                  <User size={24} />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-slate-900 truncate">
                    {formData.firstName || 'User'} {formData.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{formData.email || 'user@example.com'}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="p-2 space-y-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {activeTab === item.id && <ChevronRight size={16} />}
                  </button>
                ))}
              </nav>

              <div className="p-2 border-t border-slate-100 mt-2">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <AnimatePresence mode='wait'>
              
              {/* --- PROFILE TAB --- */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-serif text-slate-900">Personal Information</h2>
                    {success && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1 rounded-full"
                      >
                        <CheckCircle size={14} /> {success}
                      </motion.div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup 
                        label="First Name" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange} 
                        icon={<User size={18} />} 
                      />
                      <InputGroup 
                        label="Last Name" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange} 
                        icon={<User size={18} />} 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup 
                        label="Email Address" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        icon={<Mail size={18} />} 
                        disabled 
                      />
                      <InputGroup 
                        label="Phone Number" 
                        name="phone" 
                        type="tel" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        icon={<Phone size={18} />} 
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-rose-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={18} />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}

// Reusable Input Component
const InputGroup = ({ label, icon, disabled, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-1">{label}</label>
    <div className={`relative group ${disabled ? 'opacity-75' : ''}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-600 transition-colors">
        {icon}
      </div>
      <input
        {...props}
        disabled={disabled}
        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl transition-all outline-none text-slate-900 
          ${disabled ? 'cursor-not-allowed bg-slate-100' : 'focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'}`}
      />
    </div>
  </div>
)

export default Profile