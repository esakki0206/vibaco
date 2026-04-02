import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Truck, 
  RefreshCw, Calendar, Search, Eye,
  CheckCircle, Clock, XCircle, Package, AlertTriangle, Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/admin'; 

// --- Theme Configuration ---
const COLORS = {
  primary: '#e11d48', // Rose-600
  secondary: '#64748b', // Slate-500
  grid: '#f1f5f9',
  pie: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
};

const SalesAnalyticsDashboard = () => {
  // --- State ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState('week'); // 'week', 'month', 'year'
  
  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const itemsPerPage = 10;

  // --- Data Fetching ---
  const loadDashboardData = async () => {
    try {
      if (!isRefreshing) setLoading(true);
      
      // Fetch Real Data - Get ALL orders to calculate analytics client-side accurately
      const response = await adminApi.getOrders({ limit: 2000, sort: '-createdAt' });
      
      setOrders(response.orders || []);
      
    } catch (error) {
      console.error('Dashboard Load Error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  // --- ANALYTICS LOGIC ---

  // 1. Filter Orders by Time Period
  const periodOrders = useMemo(() => {
    if (!orders.length) return [];
    
    const now = new Date();
    const cutoff = new Date();
    
    // Set time to end of day to include today's orders
    now.setHours(23, 59, 59, 999); 
    
    if (period === 'week') {
       cutoff.setDate(now.getDate() - 7);
       cutoff.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
       cutoff.setDate(1); // Start of current month
       cutoff.setHours(0, 0, 0, 0);
    } else if (period === 'year') {
       cutoff.setMonth(0, 1); // Start of current year
       cutoff.setHours(0, 0, 0, 0);
    }

    return orders.filter(o => new Date(o.createdAt) >= cutoff);
  }, [orders, period]);

  // 2. KPI Calculations
  const kpiData = useMemo(() => {
    // Only count DELIVERED orders for revenue to be accurate
    const deliveredOrders = periodOrders.filter(o => o.status === 'delivered');
    
    const revenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const totalOrders = periodOrders.length;
    const avgOrderValue = deliveredOrders.length > 0 ? revenue / deliveredOrders.length : 0;
    
    return { revenue, totalOrders, avgOrderValue, growth: 0 }; 
  }, [periodOrders]);

  // 3. CHART DATA GENERATION
  const chartData = useMemo(() => {
    const now = new Date();
    let dataMap = new Map();

    // A. Initialize Buckets (Zero-Filling) based on period
    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toLocaleDateString('en-IN', { weekday: 'short' }); // Mon, Tue
        dataMap.set(key, 0);
      }
    } else if (period === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        dataMap.set(i.toString(), 0);
      }
    } else if (period === 'year') {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      monthNames.forEach(m => dataMap.set(m, 0));
    }

    // B. Fill Buckets with Data
    periodOrders.forEach(order => {
      // Revenue logic: Only count 'delivered' orders
      if (order.status !== 'delivered') return;

      const date = new Date(order.createdAt);
      let key = '';

      if (period === 'week') {
        key = date.toLocaleDateString('en-IN', { weekday: 'short' });
      } else if (period === 'month') {
        key = date.getDate().toString();
      } else if (period === 'year') {
        key = date.toLocaleDateString('en-IN', { month: 'short' });
      }

      if (dataMap.has(key)) {
        dataMap.set(key, dataMap.get(key) + (Number(order.totalAmount) || 0));
      }
    });

    return Array.from(dataMap, ([name, revenue]) => ({ name, revenue }));
  }, [periodOrders, period]);

  // 4. Status Distribution
  const statusDistribution = useMemo(() => {
    const stats = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    periodOrders.forEach(o => {
      const s = o.status?.toLowerCase();
      if (stats[s] !== undefined) stats[s]++;
    });

    return [
      { name: 'Pending', value: stats.pending },
      { name: 'Processing', value: stats.processing },
      { name: 'Shipped', value: stats.shipped },
      { name: 'Delivered', value: stats.delivered },
      { name: 'Cancelled', value: stats.cancelled },
    ].filter(item => item.value > 0);
  }, [periodOrders]);

  // 5. Table Filters
  const filteredTableData = useMemo(() => {
    return orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (order.orderNumber || '').toLowerCase().includes(searchLower) ||
        (order.user?.name || '').toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const formatPrice = (price) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price || 0);

  // --- Render ---
  if (loading && !isRefreshing) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Sales Analytics</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
              <Calendar size={14} /> 
              Overview for: <span className="font-semibold text-slate-900 capitalize">{period}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
              {['week', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                    period === p 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button 
              onClick={handleRefresh}
              className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* --- KPI Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard 
            title="Total Revenue" 
            value={formatPrice(kpiData.revenue)} 
            subLabel="From delivered orders"
            growth={kpiData.growth}
            icon={<DollarSign size={24} />}
            color="emerald"
          />
          <KPICard 
            title="Total Orders" 
            value={kpiData.totalOrders} 
            subLabel="All order statuses"
            growth={0}
            icon={<ShoppingBag size={24} />}
            color="blue"
          />
          <KPICard 
            title="Avg. Order Value" 
            value={formatPrice(kpiData.avgOrderValue)} 
            subLabel="Revenue / Delivered Count"
            growth={0}
            icon={<Truck size={24} />}
            color="violet"
          />
        </div>

        {/* --- Charts Section --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          
          {/* Main Revenue Bar Chart */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Revenue Breakdown</h3>
                <p className="text-sm text-slate-500">
                  {period === 'week' ? 'Daily revenue (Last 7 Days)' : 
                   period === 'month' ? 'Daily revenue (Current Month)' : 
                   'Monthly revenue (Current Year)'}
                </p>
              </div>
            </div>
            
            <div className="h-[400px] w-full min-w-0">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: COLORS.secondary, fontSize: 12}} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: COLORS.secondary, fontSize: 12}} 
                      tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} 
                    />
                    <RechartsTooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [formatPrice(value), 'Revenue']}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill={COLORS.primary} 
                      radius={[4, 4, 0, 0]}
                      barSize={period === 'month' ? 12 : 32} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <AlertTriangle size={32} className="mb-2 opacity-50"/>
                  <p>No revenue data for this period</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Order Status</h3>
            <p className="text-sm text-slate-500 mb-6">Current period distribution</p>

            <div className="h-[300px] w-full relative">
              {statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <Package size={32} className="mb-2 opacity-50"/>
                   <p>No orders in this period</p>
                </div>
              )}
              
              {statusDistribution.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-slate-900">{periodOrders.length}</span>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Total</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Filterable Orders Table --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none w-full sm:w-64 transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTableData.length > 0 ? filteredTableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order) => (
                  <tr key={order._id || Math.random()} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      #{order.orderNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{order.user?.name || 'Guest'}</div>
                      <div className="text-xs text-slate-400">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/admin/orders/${order._id}`}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </Link>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      <Package size={48} className="mx-auto mb-3 opacity-20" />
                      No orders found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p-1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-100"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500 py-1 px-2">Page {currentPage}</span>
            <button 
              onClick={() => setCurrentPage(p => p+1)}
              disabled={filteredTableData.length <= currentPage * itemsPerPage}
              className="px-3 py-1 bg-white border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const KPICard = ({ title, value, subLabel, growth, icon, color }) => {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    violet: 'bg-violet-100 text-violet-600',
  };

  const isPositive = growth >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
        {/* Growth badge is purely visual here as we calculate realtime, historical comparison needs more data */}
        <div className={`
          flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-full
          ${isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}
        `}>
          <TrendingUp size={12} />
          Live Data
        </div>
      </div>
      
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subLabel && <p className="text-xs text-slate-400 mt-1">{subLabel}</p>}
      </div>
    </motion.div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-50 text-red-600',
  };
  
  const icons = {
    pending: <Clock size={12} />,
    delivered: <CheckCircle size={12} />,
    cancelled: <XCircle size={12} />,
  };

  const s = status?.toLowerCase() || 'pending';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${styles[s] || 'bg-slate-100 text-slate-600'}`}>
      {icons[s]} {status}
    </span>
  );
};

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-50 p-8">
    <div className="max-w-[1600px] mx-auto space-y-8 animate-pulse">
      <div className="h-10 bg-slate-200 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>)}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
      </div>
    </div>
  </div>
);

export default SalesAnalyticsDashboard;