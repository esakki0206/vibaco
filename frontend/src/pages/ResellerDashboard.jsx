import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Clock, CheckCircle, 
  ChevronRight, Package, Loader2, Plus, 
  Wallet, Truck
} from 'lucide-react';
import { orderApi } from '../services/orders';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ResellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalOrders: 0,
    activeOrders: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getUserOrders(); 
      const userOrders = data.orders || [];
      setOrders(userOrders);

      const active = userOrders.filter(o => !['delivered', 'cancelled', 'refunded'].includes(o.status));
      const spent = userOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

      setStats({
        totalSpent: spent,
        totalOrders: userOrders.length,
        activeOrders: active.length
      });

    } catch (error) {
      console.error("Dashboard Error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white pt-20 md:pt-24 pb-32 md:pb-40 px-4 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 backdrop-blur-sm">
                  Reseller Portal
                </span>
                {user?.resellerStatus === 'approved' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] text-emerald-300 font-bold uppercase tracking-wide bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm">
                    <CheckCircle size={12} strokeWidth={3} /> Verified Partner
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 tracking-tight">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-slate-300 text-sm md:text-base max-w-2xl">
                Manage your wholesale orders, track shipments, and grow your business.
              </p>
            </div>
            
            <Link 
              to="/reseller/catalog" 
              className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 hover:shadow-2xl hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={20} strokeWidth={2.5} /> 
              <span className="hidden sm:inline">New Wholesale Order</span>
              <span className="sm:hidden">New Order</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-24 md:-mt-32 relative z-20">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <DashboardCard 
            title="Total Investment" 
            value={formatPrice(stats.totalSpent)} 
            icon={<Wallet className="text-white" size={22} />}
            gradient="from-indigo-500 to-indigo-600"
          />
          <DashboardCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            icon={<ShoppingBag className="text-white" size={22} />}
            gradient="from-slate-700 to-slate-800"
          />
          <DashboardCard 
            title="Active Orders" 
            value={stats.activeOrders} 
            icon={<Truck className="text-white" size={22} />}
            gradient="from-emerald-500 to-emerald-600"
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Package className="text-indigo-600" size={20} />
              </div>
              Recent Orders
            </h2>
            <Link 
              to="/orders" 
              className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors group"
            >
              View All Orders 
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 md:p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center mb-5 text-slate-300 shadow-inner">
                <ShoppingBag size={36} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Yet</h3>
              <p className="text-slate-500 mb-8 max-w-md text-sm md:text-base">
                Start building your inventory by browsing our wholesale catalog and placing your first order.
              </p>
              <Link 
                to="/reseller/catalog" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Browse Catalog <ChevronRight size={18}/>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-xs font-bold">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-6 py-4 font-mono font-bold text-slate-700 text-xs">
                          #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-semibold">
                          {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            to={`/orders/${order._id}`} 
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:shadow font-medium text-xs"
                          >
                            View <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono font-bold text-slate-700 text-xs mb-1">
                          #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-slate-600">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                    
                    <Link 
                      to={`/orders/${order._id}`}
                      className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all font-medium text-sm"
                    >
                      View Details <ChevronRight size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, gradient }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 md:p-6 shadow-lg bg-gradient-to-br ${gradient} text-white group hover:shadow-2xl transition-all hover:-translate-y-1 cursor-default`}>
    <div className="relative z-10 flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <p className="text-white/90 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{value}</h3>
      </div>
      <div className="p-2.5 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 group-hover:bg-white/30 transition-all flex-shrink-0 ml-3">
        {icon}
      </div>
    </div>
    {/* Decorative Elements */}
    <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
  </div>
);

export default ResellerDashboard;