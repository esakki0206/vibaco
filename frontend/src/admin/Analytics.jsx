import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  TrendingUp, ShoppingBag, DollarSign, 
  Calendar, Award, Loader2, BarChart2 
} from 'lucide-react';
import { adminApi } from '../services/admin';

// Premium Color Palette
const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'];
const ACCENT_COLOR = '#e11d48'; // Rose-600

const Analytics = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // today, week, month, year, all

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch ALL orders to perform accurate client-side aggregation
      const response = await adminApi.getOrders({ limit: 5000, sort: '-createdAt' });
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price || 0);

  // --- 1. Filter Orders by Period ---
  const periodOrders = useMemo(() => {
    if (!orders.length) return [];
    
    const now = new Date();
    const cutoff = new Date();
    // End of today
    now.setHours(23, 59, 59, 999);

    if (period === 'today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      cutoff.setDate(now.getDate() - 7);
      cutoff.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      cutoff.setDate(1); 
      cutoff.setHours(0, 0, 0, 0);
    } else if (period === 'year') {
      cutoff.setMonth(0, 1);
      cutoff.setHours(0, 0, 0, 0);
    } else if (period === 'all') {
      return orders;
    }

    return orders.filter(o => new Date(o.createdAt) >= cutoff);
  }, [orders, period]);

  // --- 2. Calculate KPIs ---
  const kpiData = useMemo(() => {
    // Revenue based on Delivered orders only for accuracy
    const deliveredOrders = periodOrders.filter(o => o.status === 'delivered');
    
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const totalOrders = periodOrders.length; // Count all orders (placed)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / deliveredOrders.length : 0; // Avg value of completed orders

    return { totalRevenue, totalOrders, avgOrderValue: avgOrderValue || 0 };
  }, [periodOrders]);

  // --- 3. Category Analytics ---
  const categoryChartData = useMemo(() => {
    const categories = {};

    periodOrders.forEach(order => {
      // Consider all valid orders for demand analysis, not just delivered
      if (order.status === 'cancelled') return;

      order.items.forEach(item => {
        // Fallback for category if not populated, assume 'General' or try to parse
        // Note: Ideally item.product.category is populated. 
        // If your order.items stores category snapshot, use it. 
        // Otherwise we might need to rely on what's available.
        // Assuming item.product object exists from population:
        const catName = item.product?.category || 'Uncategorized';
        
        if (!categories[catName]) {
          categories[catName] = { name: catName, count: 0, revenue: 0 };
        }
        
        categories[catName].count += item.quantity;
        categories[catName].revenue += (item.price * item.quantity);
      });
    });

    return Object.values(categories)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8
  }, [periodOrders]);

  // --- 4. Top Products Analytics ---
  const topProductsChartData = useMemo(() => {
    const products = {};

    periodOrders.forEach(order => {
      if (order.status === 'cancelled') return;

      order.items.forEach(item => {
        const pId = item.product?._id || item._id; // Unique Identifier
        const pName = item.name;

        if (!products[pId]) {
          products[pId] = { 
            name: pName.length > 20 ? pName.substring(0, 20) + '...' : pName,
            full_name: pName,
            category: item.product?.category || 'N/A',
            revenue: 0, 
            sold: 0 
          };
        }
        
        products[pId].sold += item.quantity;
        products[pId].revenue += (item.price * item.quantity);
      });
    });

    return Object.values(products)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5
  }, [periodOrders]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Gathering insights...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* --- Header & Controls --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Performance metrics for your store.</p>
          </div>
          
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm self-start md:self-auto overflow-x-auto max-w-full">
            {['today', 'week', 'month', 'year', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all capitalize ${
                  period === p 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {p === 'all' ? 'All Time' : p}
              </button>
            ))}
          </div>
        </div>

        {/* --- KPI Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={formatPrice(kpiData.totalRevenue)} 
            icon={<DollarSign size={22} />} 
            label={`Delivered orders this ${period}`}
            color="emerald"
          />
          <StatCard 
            title="Orders Placed" 
            value={kpiData.totalOrders} 
            icon={<ShoppingBag size={22} />} 
            label={`Total volume this ${period}`}
            color="blue"
          />
          <StatCard 
            title="Avg. Order Value" 
            value={formatPrice(kpiData.avgOrderValue)} 
            icon={<TrendingUp size={22} />} 
            label="Revenue / Delivered Count"
            color="rose"
          />
        </div>

        {/* --- Charts Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* 1. Sales by Category (Bar Chart) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Sales by Category</h2>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">by Volume</span>
            </div>
            
            <div className="h-[320px] w-full">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100} 
                      tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <RechartsTooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value, name) => [name === 'revenue' ? formatPrice(value) : value, name === 'count' ? 'Units Sold' : 'Revenue']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? ACCENT_COLOR : '#0f172a'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState />
              )}
            </div>
          </motion.div>

          {/* 2. Top Revenue Generators (Bar Chart) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
             <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Top Revenue Sources</h2>
              <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded">₹ Revenue</span>
            </div>

            <div className="h-[320px] w-full">
              {topProductsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 11}} 
                      interval={0}
                    />
                    <YAxis hide />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => formatPrice(value)}
                      labelFormatter={(label, payload) => payload[0]?.payload.full_name || label}
                    />
                    <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={32}>
                        {topProductsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#059669' : '#334155'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState />
              )}
            </div>
          </motion.div>
        </div>

        {/* --- Top Products Table --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Award className="text-rose-600" size={20} />
            <h2 className="text-lg font-bold text-slate-900">Best Selling Products</h2>
          </div>

          {!topProductsChartData || topProductsChartData.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No product sales data available for this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold">
                  <tr>
                    <th className="px-6 py-4 w-16">Rank</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Units Sold</th>
                    <th className="px-6 py-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProductsChartData.map((product, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                          ${index === 0 ? 'bg-amber-100 text-amber-700' : 
                            index === 1 ? 'bg-slate-200 text-slate-700' :
                            index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-50 text-slate-500'}
                        `}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900 group-hover:text-rose-600 transition-colors">
                          {product.full_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-xs font-medium capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {product.sold}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {formatPrice(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

// --- Sub Components ---

const StatCard = ({ title, value, icon, label, color }) => {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    rose: 'bg-rose-100 text-rose-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
        <p className="text-xs text-slate-400 flex items-center gap-1">
          {label}
        </p>
      </div>
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
};

const EmptyChartState = () => (
  <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
    <BarChart2 className="w-10 h-10 mb-2 opacity-50" />
    <p className="text-sm">No data available for chart</p>
  </div>
);

export default Analytics;