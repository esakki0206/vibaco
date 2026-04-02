import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingDown, AlertTriangle, Package, Search, 
  RefreshCw, Plus, Save, X, ArrowUpRight, 
  ClipboardList, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { adminApi } from '../services/admin';

const StockControl = () => {
  // --- State ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [restockItem, setRestockItem] = useState(null);

  // --- Data Fetching ---
  const fetchLowStockData = useCallback(async () => {
    try {
      setLoading(true);
      // Assuming API accepts a threshold query param
      const data = await adminApi.getLowStockProducts(threshold);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Stock Fetch Error:', error);
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [threshold]);

  // Debounce threshold changes to prevent API spam
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLowStockData();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchLowStockData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLowStockData();
  };

  // --- Actions ---
  const handleRestockSubmit = async (productId, addedQuantity) => {
    const toastId = toast.loading('Updating inventory...');
    try {
      // Optimistic Update
      setProducts(prev => prev.map(p => 
        p._id === productId ? { ...p, stock: p.stock + addedQuantity } : p
      ));

      // API Call (Assuming a patch or update endpoint exists)
      // You might need to adjust this based on your exact API signature
      const currentProduct = products.find(p => p._id === productId);
      await adminApi.updateProduct(productId, { 
        stock: (currentProduct.stock || 0) + addedQuantity 
      });

      toast.success('Stock updated successfully', { id: toastId });
      setRestockItem(null);
      
      // Optional: Refresh to ensure consistency
      // fetchLowStockData(); 
    } catch (error) {
      toast.error('Failed to update stock', { id: toastId });
      fetchLowStockData(); // Revert on error
    }
  };

  // --- Filter Logic ---
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">Stock Control</h1>
            <p className="text-slate-500 text-sm mt-1">Monitor and replenish low inventory items.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 px-3">
              <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Alert Threshold:</span>
              <input 
                type="number" 
                value={threshold} 
                onChange={(e) => setThreshold(Number(e.target.value))}
                min="1"
                className="w-16 px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <button 
              onClick={handleRefresh}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* --- Stats Overview --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Low Stock Items" 
            value={products.length} 
            subtitle={`Below ${threshold} units`}
            icon={<ClipboardList size={24} />} 
            color="amber"
          />
          <StatCard 
            title="Critical (Out of Stock)" 
            value={outOfStockCount} 
            subtitle="Needs immediate attention"
            icon={<AlertTriangle size={24} />} 
            color="red"
          />
          <StatCard 
            title="Healthy Stock" 
            value="--" 
            subtitle="Items above threshold"
            icon={<Package size={24} />} 
            color="emerald"
          />
        </div>

        {/* --- Search & List --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search low stock products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl w-full"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Package size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Stock Levels Healthy</h3>
              <p className="text-sm">No products found below the threshold of {threshold}.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock Level</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => (
                      <StockRow 
                        key={product._id} 
                        product={product} 
                        threshold={threshold}
                        onRestock={() => setRestockItem(product)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <StockCardMobile 
                    key={product._id} 
                    product={product}
                    threshold={threshold} 
                    onRestock={() => setRestockItem(product)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- Restock Modal --- */}
      <AnimatePresence>
        {restockItem && (
          <RestockModal 
            product={restockItem} 
            onClose={() => setRestockItem(null)} 
            onSubmit={handleRestockSubmit} 
          />
        )}
      </AnimatePresence>

    </div>
  );
};

// --- Sub Components ---

const StatCard = ({ title, value, subtitle, icon, color }) => {
  const colors = {
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
};

const StockRow = ({ product, threshold, onRestock }) => {
  const isCritical = product.stock === 0;
  const percentage = Math.min((product.stock / threshold) * 100, 100);

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
      <td className="px-6 py-4">
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs capitalize border border-slate-200">
          {product.category}
        </span>
      </td>
      <td className="px-6 py-4">₹{product.price.toLocaleString('en-IN')}</td>
      <td className="px-6 py-4 w-48">
        <div className="flex items-center justify-between text-xs mb-1 font-medium">
          <span>{product.stock} / {threshold}</span>
          <span className={isCritical ? 'text-red-600' : 'text-amber-600'}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </td>
      <td className="px-6 py-4">
        {isCritical ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full border border-red-200">
            <AlertCircle size={12} /> Out of Stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
            <TrendingDown size={12} /> Low Stock
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={onRestock}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-rose-600 transition-colors shadow-sm"
        >
          <Plus size={14} /> Restock
        </button>
      </td>
    </tr>
  );
};

const StockCardMobile = ({ product, threshold, onRestock }) => (
  <div className="p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-semibold text-slate-900">{product.name}</h4>
        <span className="text-xs text-slate-500 capitalize">{product.category}</span>
      </div>
      <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
        {product.stock} Left
      </span>
    </div>
    
    <div className="flex items-center justify-between pt-2">
      <span className="font-bold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
      <button 
        onClick={onRestock}
        className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg font-medium hover:bg-rose-600 transition-colors"
      >
        Replenish Stock
      </button>
    </div>
  </div>
);

const RestockModal = ({ product, onClose, onSubmit }) => {
  const [amount, setAmount] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(amount > 0) onSubmit(product._id, Number(amount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Restock Product</h3>
              <p className="text-sm text-slate-500 line-clamp-1">{product.name}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
              <div className="text-sm">
                <span className="block text-slate-500">Current Stock</span>
                <span className={`text-lg font-bold ${product.stock === 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {product.stock} units
                </span>
              </div>
              <ArrowUpRight className="text-slate-300" />
              <div className="text-sm text-right">
                <span className="block text-slate-500">New Total</span>
                <span className="text-lg font-bold text-emerald-600">
                  {product.stock + Number(amount)} units
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Add Quantity</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setAmount(Math.max(1, amount - 5))} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 font-bold text-slate-600">-</button>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="flex-1 text-center py-2 bg-white border border-slate-200 rounded-lg font-bold outline-none focus:border-rose-500"
                />
                <button type="button" onClick={() => setAmount(amount + 5)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 font-bold text-slate-600">+</button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-slate-900/20"
            >
              Confirm Restock
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default StockControl;