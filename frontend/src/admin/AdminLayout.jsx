import React, { useState, useContext, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingBag, BarChart2, ClipboardList, 
  Package, LogOut, Menu, X, ChevronRight, Store, Ticket,
  Building2 // Added Building2 icon for Resellers
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile UX)
  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to normal login if needed
  };

  // Updated menu items to include 'Resellers'
  const menuItems = [
    { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: ShoppingBag },
    { path: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { path: '/admin/resellers', label: 'Resellers', icon: Building2 }, // New Resellers Item
    { path: '/admin/stock', label: 'Inventory', icon: Package },
    { path: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart2 }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link to="/admin/dashboard" className="flex items-center gap-2 font-serif text-xl font-bold text-slate-900 tracking-tight">
          Admin<span className="text-rose-600">.</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-rose-50 text-rose-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={isActive ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={16} className="text-rose-500" />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold border border-rose-200">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@luxesarees.com'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    // Used dvh (dynamic viewport height) for better mobile browser support
    <div className="flex h-screen md:h-screen bg-slate-50 overflow-hidden">
      
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-full bg-white shadow-sm z-30">
        <SidebarContent />
      </aside>

      {/* --- Mobile Sidebar (Drawer) --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop: High Z-Index to cover everything */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] md:hidden"
            />
            {/* Drawer: Z-Index 70 to sit on top of backdrop */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-[70] w-[80%] max-w-xs bg-white shadow-2xl md:hidden"
            >
              <SidebarContent />
              
              {/* Close Button specific for mobile */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-3 right-[-3rem] p-2 bg-white rounded-full text-slate-900 shadow-lg active:scale-95 transition-transform"
              >
                <X size={20} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Trigger */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
              aria-label="Open Sidebar"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 md:hidden">Admin Panel</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" target="_blank" className="hidden sm:flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 transition-colors">
              <Store size={18} />
              <span>View Store</span>
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
              Admin
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none scroll-smooth p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;