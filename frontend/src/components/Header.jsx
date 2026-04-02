import React, { useState, useEffect, useContext, useRef } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Search, Menu, X, User, LogOut,
  Package, Heart, ChevronRight, Settings, LogIn, UserPlus, Gift
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'

const Header = ({ appName = "Vibaco Gifts" }) => {
  const { user, logout } = useContext(AuthContext)
  const { itemCount } = useContext(CartContext) || { itemCount: 0 }

  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const profileRef = useRef(null)

  useEffect(() => {
    const query = searchParams.get('search')
    if (query) setSearchQuery(query)
  }, [searchParams])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileOpen(false)
    setIsMobileSearchOpen(false)
  }, [location])

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

  const displayCartCount = itemCount > 0 ? itemCount : 0;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled || isMobileMenuOpen
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-warmgray-200 py-3'
            : 'bg-white border-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-12">

            <div className="flex items-center gap-3 md:gap-8">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-warmgray-800 hover:text-burgundy-800 transition-colors p-1"
                aria-label="Open Menu"
              >
                <Menu size={26} />
              </button>

              <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-burgundy-800 to-burgundy-900 flex items-center justify-center shadow-sm">
                  <Gift className="text-gold-300" size={16} />
                </div>
                <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-warmgray-900">
                  {appName}
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-6 xl:gap-8 ml-4">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/products">Shop Gifts</NavLink>
              </nav>
            </div>

            <div className="hidden md:flex flex-1 max-w-md px-4">
              <form onSubmit={handleSearch} className="w-full relative group">
                <input
                  type="text"
                  placeholder="Search for gifts..."
                  className="w-full bg-warmgray-100 text-warmgray-800 rounded-full py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-burgundy-500/20 focus:bg-white border border-transparent focus:border-burgundy-200 transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-warmgray-400 group-focus-within:text-burgundy-700 transition-colors" size={18} />
              </form>
            </div>

            <div className="flex items-center gap-1 sm:gap-4">

              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-warmgray-700 hover:text-burgundy-800 transition-colors"
              >
                <Search size={22} />
              </button>

              <div className="relative" ref={profileRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-full hover:bg-warmgray-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-full bg-burgundy-100 border border-burgundy-200 flex items-center justify-center text-burgundy-800 font-serif font-bold text-sm group-hover:bg-burgundy-800 group-hover:text-white transition-all">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-xs text-warmgray-500 font-medium">Hello,</span>
                        <span className="text-sm font-semibold text-warmgray-700 leading-none max-w-[80px] truncate">
                          {user.name?.split(' ')[0]}
                        </span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-warmgray-100 py-2 overflow-hidden z-50 origin-top-right"
                        >
                          <div className="px-5 py-4 border-b border-warmgray-50 bg-warmgray-50/50">
                            <p className="text-sm font-semibold text-warmgray-900 truncate">{user.name}</p>
                            <p className="text-xs text-warmgray-500 truncate">{user.email}</p>
                          </div>
                          <div className="py-2">
                            <DropdownItem to="/profile" icon={<User size={16} />} label="My Profile" />
                            <DropdownItem to="/orders" icon={<Package size={16} />} label="My Orders" />
                          </div>
                          <div className="border-t border-warmgray-50 pt-1 mt-1">
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
                    <Link to="/login" className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-warmgray-700 hover:text-burgundy-800 transition-colors">
                      <User size={20} />
                      <span>Login</span>
                    </Link>
                    <Link to="/reseller/register" className="hidden lg:block px-5 py-2.5 bg-burgundy-800 text-white text-sm font-medium rounded-full hover:bg-burgundy-900 hover:shadow-lg hover:shadow-burgundy-900/30 transition-all duration-300">
                      Reseller Signup
                    </Link>
                    <Link to="/login" className="lg:hidden p-2 text-warmgray-700 hover:text-burgundy-800">
                      <User size={22} />
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/cart"
                className="group flex items-center gap-2 px-1 md:px-3 py-2 rounded-full hover:bg-burgundy-50 transition-all"
              >
                <div className="relative">
                  <ShoppingBag size={22} className="text-warmgray-800 group-hover:text-burgundy-800 transition-colors" />
                  {displayCartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center bg-burgundy-800 text-white text-[10px] font-bold rounded-full ring-2 ring-white group-hover:scale-110 transition-transform">
                      {displayCartCount > 99 ? '99+' : displayCartCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-sm font-semibold text-warmgray-700 group-hover:text-burgundy-800">
                  Cart
                </span>
              </Link>

            </div>
          </div>

          <AnimatePresence>
            {isMobileSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden border-t border-warmgray-100"
              >
                <form onSubmit={handleSearch} className="py-3 px-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for gifts..."
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 bg-warmgray-50 border border-warmgray-200 rounded-xl text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-400 outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-warmgray-400" size={18} />
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-warmgray-900/40 backdrop-blur-sm z-50 lg:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[60] shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-5 flex justify-between items-center border-b border-warmgray-100">
                <span className="font-serif text-2xl font-bold text-warmgray-900">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-warmgray-50 rounded-full text-warmgray-500 hover:text-red-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <MobileNavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</MobileNavLink>
                <MobileNavLink to="/products" onClick={() => setIsMobileMenuOpen(false)}>Shop Gifts</MobileNavLink>

                <div className="my-4 border-t border-warmgray-100" />

                <MobileNavLink to="/orders" onClick={() => setIsMobileMenuOpen(false)} icon={<Package size={18} />}>My Orders</MobileNavLink>
              </nav>

              <div className="p-5 border-t border-warmgray-100 bg-cream-50">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-burgundy-800 text-white flex items-center justify-center font-bold font-serif shadow-md">
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-warmgray-900">{user.name}</p>
                        <p className="text-xs text-warmgray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="w-full py-3 bg-white border border-warmgray-200 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                     <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-warmgray-300 font-semibold text-warmgray-700 bg-white"
                      >
                        <LogIn size={18} /> Log In
                     </Link>
                     <Link
                        to="/reseller/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-burgundy-800 text-white font-semibold shadow-lg shadow-burgundy-900/20"
                      >
                        <UserPlus size={18} /> Signup
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

const NavLink = ({ to, children }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`text-sm font-semibold transition-colors relative py-1 ${
        isActive ? 'text-burgundy-800' : 'text-warmgray-600 hover:text-warmgray-900'
      }`}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy-800"
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
          ? 'bg-burgundy-50 text-burgundy-800 font-semibold'
          : 'text-warmgray-600 hover:bg-warmgray-100 hover:text-warmgray-900'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className={isActive ? 'text-burgundy-700' : 'text-warmgray-400'}>{icon}</span>}
        {children}
      </div>
      {isActive && <ChevronRight size={16} />}
    </Link>
  )
}

const DropdownItem = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center px-5 py-2.5 text-sm font-medium text-warmgray-600 hover:bg-burgundy-50 hover:text-burgundy-800 transition-colors"
  >
    <span className="mr-3 text-warmgray-400">{icon}</span>
    {label}
  </Link>
)

export default Header
