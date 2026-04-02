import React, { useState, useEffect, useContext, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  MdShoppingCart, MdPerson, MdSearch, MdMenu, MdClose,
  MdLogout, MdDashboard, MdShoppingBag, MdStore
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'

const Navbar = ({ }) => {
  const { user, logout } = useContext(AuthContext)
  const { itemCount } = useContext(CartContext) || { itemCount: 0 }

  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const isReseller = user?.role === 'reseller'
  const homeRoute = isReseller ? '/reseller/dashboard' : '/'
  const productsRoute = isReseller ? '/reseller/catalog' : '/products'
  const cartRoute = isReseller ? '/reseller/cart' : '/cart'
  const showCartBadge = !isReseller && itemCount > 0

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

  if (location.pathname.startsWith('/admin')) {
    return null
  }

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

            {/* LEFT: Hamburger & Logo */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 -ml-2 text-warmgray-700 hover:text-burgundy-800 transition-colors rounded-full active:bg-warmgray-100"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Menu"
              >
                <MdMenu size={28} />
              </button>

              <Link to={homeRoute} className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-burgundy-800 to-burgundy-900 flex items-center justify-center shadow-sm">
                  <Gift className="w-4.5 h-4.5 text-gold-300" size={18} />
                </div>
                <h1 className="font-serif text-xl font-bold tracking-tight text-warmgray-900 group-hover:text-burgundy-800 transition-colors">
                  Vibaco Gifts
                </h1>
              </Link>
            </div>

            {/* CENTER: Desktop Nav & Search */}
            <div className="hidden lg:flex items-center flex-1 justify-center gap-8 px-8">
              <nav className="flex items-center gap-8 font-medium text-sm text-warmgray-600">
                <NavLink to={homeRoute}>Home</NavLink>
                <NavLink to={productsRoute}>Shop Gifts</NavLink>
              </nav>

              <form onSubmit={handleSearch} className="relative w-full max-w-sm group">
                <input
                  type="text"
                  placeholder="Search for gifts..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-warmgray-50 border border-warmgray-200 focus:bg-white focus:border-burgundy-400 focus:ring-4 focus:ring-burgundy-50 outline-none transition-all text-sm placeholder:text-warmgray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute left-3.5 top-3 text-warmgray-400 group-focus-within:text-burgundy-700 hover:text-burgundy-800 transition-colors" aria-label="Search">
                  <MdSearch size={20} />
                </button>
              </form>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-1 sm:gap-3">

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className={`lg:hidden p-2 rounded-full transition-colors ${mobileSearchOpen ? 'bg-burgundy-50 text-burgundy-800' : 'text-warmgray-600 hover:bg-warmgray-50'}`}
              >
                <MdSearch size={26} />
              </button>

              {/* Cart */}
              <Link
                to={cartRoute}
                className="relative p-2 text-warmgray-700 hover:text-burgundy-800 transition-colors group flex items-center gap-2"
              >
                <div className="relative">
                  <MdShoppingCart size={26} />
                  {showCartBadge && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-burgundy-800 text-white text-[10px] font-bold rounded-full ring-2 ring-white group-hover:scale-110 transition-transform">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {isReseller ? 'Order' : 'Cart'}
                </span>
              </Link>

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-warmgray-50 transition-colors border border-transparent hover:border-warmgray-200 ml-1"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-burgundy-100 to-burgundy-200 flex items-center justify-center text-burgundy-800 font-bold text-sm shadow-inner border border-burgundy-200">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:block text-sm font-medium text-warmgray-700 max-w-[80px] truncate pr-2">
                        {user.name.split(' ')[0]}
                      </span>
                    </button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-xl border border-warmgray-100 overflow-hidden z-50 ring-1 ring-black/5"
                        >
                          <div className="px-5 py-4 border-b border-warmgray-100 bg-warmgray-50/50">
                            <p className="text-sm font-bold text-warmgray-900 truncate">{user.name}</p>
                            <p className="text-xs text-warmgray-500 truncate mt-0.5">{user.email}</p>
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
                              <DropdownItem to="/reseller/dashboard" icon={<MdStore size={18} />} label="Reseller Dashboard" />
                            ) : (
                              <DropdownItem to="/profile" icon={<MdPerson size={18} />} label="My Profile" />
                            )}
                            <DropdownItem to="/orders" icon={<MdShoppingBag size={18} />} label="My Orders" />
                          </div>

                          <div className="border-t border-warmgray-100 pt-1 pb-1">
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
                    <Link to="/login" className="text-sm font-medium px-5 py-2.5 rounded-full text-warmgray-600 hover:bg-warmgray-100 transition-colors">
                      Login
                    </Link>
                    <Link to="/reseller/register" className="text-sm font-medium px-5 py-2.5 rounded-full bg-burgundy-800 text-white hover:bg-burgundy-900 hover:shadow-lg hover:shadow-burgundy-900/20 transition-all">
                      Reseller Signup
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
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
                      placeholder="Search gifts..."
                      autoFocus
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-warmgray-50 border border-warmgray-200 focus:bg-white focus:border-burgundy-400 outline-none text-sm shadow-inner"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute left-4 top-3.5 text-warmgray-400 hover:text-burgundy-700 transition-colors" aria-label="Search mobile">
                      <MdSearch size={20} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-warmgray-900/40 backdrop-blur-md z-[60] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white z-[70] shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-5 flex items-center justify-between border-b border-warmgray-100 bg-cream-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-burgundy-800 to-burgundy-900 flex items-center justify-center">
                    <Gift className="text-gold-300" size={16} />
                  </div>
                  <span className="font-serif text-lg font-bold text-warmgray-900">Vibaco Gifts</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-warmgray-400 hover:text-warmgray-900 rounded-full hover:bg-warmgray-100 transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                  <MobileLink to={homeRoute} onClick={() => setMobileMenuOpen(false)}>Home</MobileLink>
                  <MobileLink to={productsRoute} onClick={() => setMobileMenuOpen(false)}>Shop Gifts</MobileLink>
                  <MobileLink to={cartRoute} onClick={() => setMobileMenuOpen(false)}>
                    {isReseller ? 'Wholesale Order' : 'Cart'}
                  </MobileLink>
                </nav>

                <div className="my-6 border-t border-warmgray-100" />

                <div className="space-y-1">
                  {user ? (
                    <>
                      <div className="px-4 py-2 mb-2">
                        <span className="text-xs font-bold text-warmgray-400 uppercase tracking-wider">Account</span>
                      </div>

                      {user.role === 'admin' ? (
                        <MobileLink to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} icon={<MdDashboard />}>Admin Panel</MobileLink>
                      ) : user.role === 'reseller' ? (
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
                        className="flex items-center justify-center py-3.5 border border-warmgray-200 rounded-xl font-semibold text-warmgray-700 active:bg-warmgray-50"
                      >
                        Login
                      </Link>
                      <Link
                        to="/reseller/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center py-3.5 bg-burgundy-800 text-white rounded-xl font-semibold active:bg-burgundy-900 shadow-lg shadow-burgundy-900/10"
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

const NavLink = ({ to, children }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  return (
    <Link
      to={to}
      className={`relative py-1 transition-colors ${isActive ? 'text-burgundy-800 font-semibold' : 'hover:text-warmgray-900'}`}
    >
      {children}
      {isActive && (
        <motion.span
          layoutId="underline"
          className="absolute bottom-0 left-0 w-full h-0.5 bg-burgundy-800 rounded-full"
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
        ? 'bg-burgundy-50 text-burgundy-800 font-semibold'
        : 'text-warmgray-600 hover:bg-warmgray-50 hover:text-warmgray-900'
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
    className="flex items-center px-5 py-2.5 text-sm text-warmgray-700 hover:bg-warmgray-50 hover:text-burgundy-800 transition-colors group"
  >
    <span className="mr-3 text-warmgray-400 group-hover:text-burgundy-700 transition-colors">{icon}</span>
    {label}
  </Link>
)

export default Navbar
