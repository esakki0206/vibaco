import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, User, Mail, Lock, Phone, FileText, ArrowRight, Loader2, MapPin, Globe, AlertTriangle, CheckCircle } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-hot-toast'

const ResellerRegister = () => {
  const navigate = useNavigate()
  
  // Safe destructuring
  const context = useContext(AuthContext)
  const registerReseller = context?.registerReseller

  const [loading, setLoading] = useState(false)
  
  // UI Feedback States
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    phone: '',
    businessName: '', 
    address: '',
    socialLink: '',
    gstNumber: '', 
    panNumber: ''
  })

  // Clear errors when user types
  const handleChange = (e) => {
    setErrorMessage('')
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    
    if (!registerReseller) {
      setErrorMessage("System Error: Auth Context not loaded. Try refreshing.")
      return
    }

    setLoading(true)
    
    try {
      // 1. Client-Side Validation
      const requiredFields = ['name', 'email', 'password', 'phone', 'businessName', 'address']
      const missingField = requiredFields.find(field => !formData[field]?.trim())
      
      if (missingField) {
        setErrorMessage(`Please fill in the required field: ${missingField}`)
        setLoading(false)
        return
      }

      // 2. Data Sanitization (Remove empty strings for optional fields)
      const payload = { ...formData }
      if (!payload.gstNumber?.trim()) delete payload.gstNumber
      if (!payload.panNumber?.trim()) delete payload.panNumber
      if (!payload.socialLink?.trim()) delete payload.socialLink

      // 3. API Call
      console.log("Sending Payload:", payload)
      const result = await registerReseller(payload)
      console.log("API Result:", result)

      if (result.success) {
        setSuccessMessage(result.message || 'Application Submitted Successfully! Redirecting...')
        toast.success('Application Submitted!')
        
        // Wait 2 seconds before redirecting so user can read the message
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Application submitted! Please wait for admin approval before logging in.' } 
          })
        }, 2000)
      } else {
        // Show specific error from backend
        setErrorMessage(result.error || 'Registration failed. Please try again.')
        toast.error(result.error || 'Registration failed')
      }

    } catch (err) {
      console.error("Submit Error:", err)
      setErrorMessage("An unexpected network error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden my-8 border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_120%,#fb7185,transparent)]" />
          <div className="relative z-10">
            <div className="inline-flex p-3 bg-white/10 rounded-full text-white mb-4 backdrop-blur-sm border border-white/10">
              <Building2 size={32} />
            </div>
            <h1 className="text-2xl font-serif text-white font-bold">Partner Program</h1>
            <p className="text-slate-400 text-sm mt-2">Join as a verified reseller for exclusive pricing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* --- Error / Success Messages Display --- */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-700">Registration Failed</h4>
                <p className="text-sm text-red-600 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-700">Success!</h4>
                <p className="text-sm text-emerald-600 mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Contact Info</p>
            <Input name="name" value={formData.name} icon={User} placeholder="Full Name *" onChange={handleChange} required />
            <Input name="email" value={formData.email} icon={Mail} placeholder="Email Address *" type="email" onChange={handleChange} required />
            <Input name="phone" value={formData.phone} icon={Phone} placeholder="Phone Number *" type="tel" onChange={handleChange} required />
            <Input name="password" value={formData.password} icon={Lock} placeholder="Create Password *" type="password" onChange={handleChange} required />
          </div>

          {/* Business Info */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Business Details</p>
            <Input name="businessName" value={formData.businessName} icon={Building2} placeholder="Business / Shop Name *" onChange={handleChange} required />
            <Input name="address" value={formData.address} icon={MapPin} placeholder="Shop / Home Address *" onChange={handleChange} required />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="gstNumber" value={formData.gstNumber} icon={FileText} placeholder="GST (Optional)" onChange={handleChange} />
              <Input name="panNumber" value={formData.panNumber} icon={FileText} placeholder="PAN (Optional)" onChange={handleChange} />
            </div>

             <Input name="socialLink" value={formData.socialLink} icon={Globe} placeholder="Instagram / Website Link (Optional)" onChange={handleChange} />
          </div>

          <button 
            type="submit"
            disabled={loading || successMessage}
            className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 shadow-lg shadow-rose-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="animate-spin" /> Submitting...</>
            ) : (
              <><ArrowRight size={18} /> Submit Application</>
            )}
          </button>
          
          <div className="text-center">
            <Link to="/login" className="text-sm text-slate-500 hover:text-slate-800 font-medium">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

const Input = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-600 transition-colors">
      <Icon size={18} />
    </div>
    <input 
      {...props} 
      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none text-sm transition-all text-slate-900 placeholder:text-slate-400" 
    />
  </div>
)

export default ResellerRegister