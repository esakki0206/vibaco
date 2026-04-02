import React, { useState, useEffect, useContext, useRef } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, Search, Menu, X, User, LogOut, 
  Package, Heart, ChevronRight, Settings, LogIn, UserPlus
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'

const Header = ({ appName = "Luxe Sarees" }) => {
  const { user, logout } = useContext(AuthContext)
  // safe fallback: if context is missing, default to 0
  const { itemCount } = useContext(CartContext) || { itemCount: 0 }
  
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  
  // State
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const profileRef = useRef(null)

  // Sync search input with URL params (so refreshing keeps the search text)
  useEffect(() => {
    const query = searchParams.get('search')
    if (query) setSearchQuery(query)
  }, [searchParams])

  // Scroll Detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileOpen(false)
    setIsMobileSearchOpen(false)
  }, [location])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsMobileSearchOpen(false)
    }
  }

  // Only show badge when there are items in cart
  const displayCartCount = itemCount > 0 ? itemCount : 0;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled || isMobileMenuOpen 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-slate-200 py-3' 
            : 'bg-white border-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-12">
            
            {/* --- LEFT: Logo & Mobile Toggle --- */}
            <div className="flex items-center gap-3 md:gap-8">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-slate-800 hover:text-rose-600 transition-colors p-1"
                aria-label="Open Menu"
              >
                <Menu size={26} />
              </button>

              <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  {appName}<span className="text-rose-600">.</span>
                </span>
              </Link>

              {/* Desktop Nav Links (Left-Aligned next to logo) */}
              <nav className="hidden lg:flex items-center gap-6 xl:gap-8 ml-4">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/products">Shop</NavLink>
                <NavLink to="/new-arrivals">New Arrivals</NavLink>
                <NavLink to="/about">About</NavLink>
              </nav>
            </div>

            {/* --- CENTER: Search Bar (Desktop) --- */}
            <div className="hidden md:flex flex-1 max-w-md px-4">
              <form onSubmit={handleSearch} className="w-full relative group">
                <input 
                  type="text"
                  placeholder="Search sarees, silk, cotton..."
                  className="w-full bg-slate-100 text-slate-800 rounded-full py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white border border-transparent focus:border-rose-200 transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
              </form>
            </div>

            {/* --- RIGHT: Actions (Account, Cart) --- */}
            <div className="flex items-center gap-1 sm:gap-4">
              
              {/* Mobile Search Toggle */}
              <button 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-slate-700 hover:text-rose-600 transition-colors"
              >
                <Search size={22} />
              </button>

              {/* Account Dropdown */}
              <div className="relative" ref={profileRef}>
                {user ? (
                  <>
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-serif font-bold text-sm group-hover:bg-rose-600 group-hover:text-white transition-all">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-xs text-slate-500 font-medium">Hello,</span>
                        <span className="text-sm font-semibold text-slate-700 leading-none max-w-[80px] truncate">
                          {user.name?.split(' ')[0]}
                        </span>
                      </div>
                    </button>

                    {/* Desktop Dropdown */}
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden z-50 origin-top-right"
                        >
                          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                          <div className="py-2">
                            <DropdownItem to="/profile" icon={<User size={16} />} label="My Profile" />
                            <DropdownItem to="/orders" icon={<Package size={16} />} label="My Orders" />
                            <DropdownItem to="/wishlist" icon={<Heart size={16} />} label="Wishlist" />
                          </div>
                          <div className="border-t border-slate-50 pt-1 mt-1">
                             <button 
                                onClick={logout}
                                className="w-full flex items-center px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                             >
                               <LogOut size={16} className="mr-3" />
                               Sign Out
                             </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login" className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600 transition-colors">
                      <User size={20} />
                      <span>Login</span>
                    </Link>
                    <Link to="/register" className="hidden lg:block px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300">
                      Sign Up
                    </Link>
                    {/* Mobile Only User Icon */}
                    <Link to="/login" className="lg:hidden p-2 text-slate-700 hover:text-rose-600">
                      <User size={22} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Cart Button with Label */}
              <Link 
                to="/cart" 
                className="group flex items-center gap-2 px-1 md:px-3 py-2 rounded-full hover:bg-rose-50 transition-all"
              >
                <div className="relative">
                  <ShoppingBag size={22} className="text-slate-800 group-hover:text-rose-600 transition-colors" />
                  {displayCartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center bg-rose-600 text-white text-[10px] font-bold rounded-full ring-2 ring-white group-hover:scale-110 transition-transform">
                      {displayCartCount > 99 ? '99+' : displayCartCount}
                    </span>
                  )}
                </div>
                {/* Text Label for Cart */}
                <span className="hidden lg:block text-sm font-semibold text-slate-700 group-hover:text-rose-700">
                  Cart
                </span>
              </Link>

            </div>
          </div>

          {/* Mobile Search Bar (Expandable) */}
          <AnimatePresence>
            {isMobileSearchOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden border-t border-slate-100"
              >
                <form onSubmit={handleSearch} className="py-3 px-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for sarees..."
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* --- Mobile Slide-Over Menu --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
            />
            
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[60] shadow-2xl lg:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 flex justify-between items-center border-b border-slate-100">
                <span className="font-serif text-2xl font-bold text-slate-900">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-500 hover:text-red-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <MobileNavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</MobileNavLink>
                <MobileNavLink to="/products" onClick={() => setIsMobileMenuOpen(false)}>Shop Collection</MobileNavLink>
                <MobileNavLink to="/new-arrivals" onClick={() => setIsMobileMenuOpen(false)}>New Arrivals</MobileNavLink>
                <MobileNavLink to="/categories" onClick={() => setIsMobileMenuOpen(false)}>Categories</MobileNavLink>
                <MobileNavLink to="/about" onClick={() => setIsMobileMenuOpen(false)}>Our Story</MobileNavLink>
                
                <div className="my-4 border-t border-slate-100" />
                
                <MobileNavLink to="/orders" onClick={() => setIsMobileMenuOpen(false)} icon={<Package size={18} />}>My Orders</MobileNavLink>
                <MobileNavLink to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} icon={<Heart size={18} />}>Wishlist</MobileNavLink>
              </nav>

              {/* Drawer Footer (Auth) */}
              <div className="p-5 border-t border-slate-100 bg-slate-50">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold font-serif shadow-md">
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="w-full py-3 bg-white border border-slate-200 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                     <Link 
                        to="/login" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 bg-white"
                      >
                        <LogIn size={18} /> Log In
                     </Link>
                     <Link 
                        to="/register" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-semibold shadow-lg shadow-slate-900/20"
                      >
                        <UserPlus size={18} /> Register
                     </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// --- Sub Components ---

const NavLink = ({ to, children }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  
  return (
    <Link 
      to={to} 
      className={`text-sm font-semibold transition-colors relative py-1 ${
        isActive ? 'text-rose-600' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
      {isActive && (
        <motion.div 
          layoutId="activeNav" 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" 
        />
      )}
    </Link>
  )
}

const MobileNavLink = ({ to, onClick, children, icon }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
        isActive 
          ? 'bg-rose-50 text-rose-700 font-semibold' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className={isActive ? 'text-rose-600' : 'text-slate-400'}>{icon}</span>}
        {children}
      </div>
      {isActive && <ChevronRight size={16} />}
    </Link>
  )
}

const DropdownItem = ({ to, icon, label }) => (
  <Link 
    to={to} 
    className="flex items-center px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
  >
    <span className="mr-3 text-slate-400 group-hover:text-rose-500">{icon}</span>
    {label}
  </Link>
)

export default Header