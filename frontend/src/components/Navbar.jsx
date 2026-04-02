import React, { useState, useEffect, useContext, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  MdShoppingCart, MdPerson, MdSearch, MdMenu, MdClose,
  MdLogout, MdDashboard, MdShoppingBag, MdStore
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'

const Navbar = ({ }) => {
  const { user, logout } = useContext(AuthContext)
  const { itemCount } = useContext(CartContext) || { itemCount: 0 }

  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

  // --- State ---
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  // --- Reseller Logic ---
  const isReseller = user?.role === 'reseller'
  // Dynamic routes based on user role
  const homeRoute = isReseller ? '/reseller/dashboard' : '/'
  const productsRoute = isReseller ? '/reseller/catalog' : '/products'
  const cartRoute = isReseller ? '/reseller/cart' : '/cart'
  const showCartBadge = !isReseller && itemCount > 0

  // --- Effects ---
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 20)

      if (currentScrollY > lastScrollY && currentScrollY > 100 && !mobileMenuOpen) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlNavbar)
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY, mobileMenuOpen])

  useEffect(() => {
    setMobileMenuOpen(false)
    setShowUserMenu(false)
    setMobileSearchOpen(false)
  }, [location])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ✅ SAFE: conditional return AFTER hooks
  if (location.pathname.startsWith('/admin')) {
    return null
  }


  // --- Handlers ---
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileSearchOpen(false)
    }
  }

  return (
    <>
      {/* --- Main Header --- */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform 
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
          ${isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm py-2'
            : 'bg-white border-b border-transparent py-2'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-12">

            {/* 1. LEFT: Hamburger (Mobile) & Logo */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-rose-600 transition-colors rounded-full active:bg-slate-100"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Menu"
              >
                <MdMenu size={28} />
              </button>

              <Link to={homeRoute} className="flex items-center gap-2 group">
                <h1 className="font-Alice text-xl font-bold tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
                  Shri Sai Collections
                </h1>
              </Link>
            </div>

            {/* 2. CENTER: Desktop Nav & Search */}
            <div className="hidden lg:flex items-center flex-1 justify-center gap-8 px-8">
              <nav className="flex items-center gap-8 font-medium text-sm text-slate-600">
                <NavLink to={homeRoute}>Home</NavLink>
                <NavLink to={productsRoute}>Collection</NavLink>
              </nav>

              <form onSubmit={handleSearch} className="relative w-full max-w-sm group">
                <input
                  type="text"
                  placeholder="Search for sarees..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-rose-500 hover:text-rose-600 transition-colors" aria-label="Search">
                  <MdSearch size={20} />
                </button>
              </form>
            </div>

            {/* 3. RIGHT: Actions */}
            <div className="flex items-center gap-1 sm:gap-3">

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className={`lg:hidden p-2 rounded-full transition-colors ${mobileSearchOpen ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <MdSearch size={26} />
              </button>

              {/* Cart Icon (Dynamic Link & Badge Logic) */}
              <Link
                to={cartRoute}
                className="relative p-2 text-slate-700 hover:text-rose-600 transition-colors group flex items-center gap-2"
              >
                <div className="relative">
                  <MdShoppingCart size={26} />
                  {showCartBadge && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-rose-600 text-white text-[10px] font-bold rounded-full ring-2 ring-white group-hover:scale-110 transition-transform">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {isReseller ? 'Order' : 'Cart'}
                </span>
              </Link>

              {/* User Menu (Desktop + Mobile Dropdown) */}
              <div className="relative" ref={dropdownRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 ml-1"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center text-rose-700 font-bold text-sm shadow-inner border border-rose-200">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[80px] truncate pr-2">
                        {user.name.split(' ')[0]}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 ring-1 ring-black/5"
                        >
                          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                            {/* Role Badge */}
                            {user.role !== 'user' && (
                              <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider 
                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {user.role === 'reseller' ? 'Partner' : user.role}
                              </span>
                            )}
                          </div>

                          <div className="py-2">
                            {user.role === 'admin' ? (
                              <DropdownItem to="/admin/dashboard" icon={<MdDashboard size={18} />} label="Admin Dashboard" />
                            ) : user.role === 'reseller' ? (
                              // Reseller Dashboard Link
                              <DropdownItem to="/reseller/dashboard" icon={<MdStore size={18} />} label="Reseller Dashboard" />
                            ) : (
                              <DropdownItem to="/profile" icon={<MdPerson size={18} />} label="My Profile" />
                            )}
                            <DropdownItem to="/orders" icon={<MdShoppingBag size={18} />} label="My Orders" />
                          </div>

                          <div className="border-t border-slate-50 pt-1 pb-1">
                            <button
                              onClick={logout}
                              className="w-full flex items-center px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                            >
                              <MdLogout className="mr-3" size={18} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="hidden sm:flex items-center gap-2 ml-2">
                    <Link to="/login" className="text-sm font-medium px-5 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
                      Login
                    </Link>
                    <Link to="/reseller/register" className="text-sm font-medium px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-600/20 transition-all">
                      Reseller Signup
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Mobile Search Bar (Expandable) */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <form onSubmit={handleSearch} className="pb-4 pt-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search collection..."
                      autoFocus
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-300 outline-none text-sm shadow-inner"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute left-4 top-3.5 text-slate-400 hover:text-rose-500 transition-colors" aria-label="Search mobile">
                      <MdSearch size={20} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* --- Mobile Sidebar / Drawer --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white z-[70] shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                <span className="font-serif text-lg font-bold text-slate-900">Sri Sai Saree Collections</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                  <MobileLink to={homeRoute} onClick={() => setMobileMenuOpen(false)}>Home</MobileLink>
                  <MobileLink to={productsRoute} onClick={() => setMobileMenuOpen(false)}>Shop Collection</MobileLink>
                  <MobileLink to={cartRoute} onClick={() => setMobileMenuOpen(false)}>
                    {isReseller ? 'Wholesale Order' : 'Cart'}
                  </MobileLink>
                </nav>

                <div className="my-6 border-t border-slate-100" />

                <div className="space-y-1">
                  {user ? (
                    <>
                      <div className="px-4 py-2 mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</span>
                      </div>

                      {user.role === 'admin' ? (
                        <MobileLink to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} icon={<MdDashboard />}>Admin Panel</MobileLink>
                      ) : user.role === 'reseller' ? (
                        // Mobile Reseller Link
                        <MobileLink to="/reseller/dashboard" onClick={() => setMobileMenuOpen(false)} icon={<MdStore />}>Reseller Dashboard</MobileLink>
                      ) : (
                        <MobileLink to="/profile" onClick={() => setMobileMenuOpen(false)} icon={<MdPerson />}>Profile</MobileLink>
                      )}

                      <MobileLink to="/orders" onClick={() => setMobileMenuOpen(false)} icon={<MdShoppingBag />}>Orders</MobileLink>

                      <button
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        className="w-full flex items-center px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm mt-2"
                      >
                        <MdLogout className="mr-3 text-lg opacity-70" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3 mt-4">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center py-3.5 border border-slate-200 rounded-xl font-semibold text-slate-700 active:bg-slate-50"
                      >
                        Login
                      </Link>
                      <Link
                        to="/reseller/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center py-3.5 bg-slate-900 text-white rounded-xl font-semibold active:bg-slate-800 shadow-lg shadow-slate-900/10"
                      >
                        Reseller Signup
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// --- Sub-Components ---

const NavLink = ({ to, children }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  return (
    <Link
      to={to}
      className={`relative py-1 transition-colors ${isActive ? 'text-rose-600 font-semibold' : 'hover:text-slate-900'}`}
    >
      {children}
      {isActive && (
        <motion.span
          layoutId="underline"
          className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600 rounded-full"
        />
      )}
    </Link>
  )
}

const MobileLink = ({ to, children, onClick, icon }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-4 py-3.5 rounded-xl transition-all ${isActive
        ? 'bg-rose-50 text-rose-700 font-semibold'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      {icon && <span className="mr-3 text-lg opacity-70">{icon}</span>}
      {children}
    </Link>
  )
}

const DropdownItem = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors group"
  >
    <span className="mr-3 text-slate-400 group-hover:text-rose-500 transition-colors">{icon}</span>
    {label}
  </Link>
)

export default Navbar