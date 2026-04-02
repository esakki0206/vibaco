import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Filter, Edit, Trash2, Tag,
  TrendingDown, Package, AlertTriangle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  X, Percent, Calendar, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { adminApi } from '../services/admin';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'silk', label: 'Silk' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'chiffon', label: 'Chiffon' },
  { value: 'georgette', label: 'Georgette' },
  { value: 'crepe', label: 'Crepe' },
  { value: 'banarasi', label: 'Banarasi' },
  { value: 'kanchipuram', label: 'Kanchipuram' },
  { value: 'bridal', label: 'Bridal' },
  { value: 'other', label: 'Other' }
];

const ProductManagementDashboard = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDiscount, setFilterDiscount] = useState('');
  const [sortParam, setSortParam] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editingDiscountProduct, setEditingDiscountProduct] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getProducts({
        page: currentPage,
        limit: 10,
        search: debouncedSearch,
        category: filterCategory,
        hasDiscount: filterDiscount === 'yes' ? true : filterDiscount === 'no' ? false : undefined,
        sort: sortParam || undefined
      });
      setProducts(response.products || []);
      setTotalPages(Math.max(1, Math.ceil((response.total || 0) / 10)));
    } catch (error) {
      console.error('Fetch Error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterCategory, filterDiscount, sortParam]);

  const fetchStats = async () => {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Stats Error:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); }, []);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Permanently delete this product?')) return;
    const toastId = toast.loading('Deleting...');
    try {
      await adminApi.deleteProduct(productId);
      toast.success('Product deleted', { id: toastId });
      fetchData();
      fetchStats();
    } catch {
      toast.error('Failed to delete', { id: toastId });
    }
  };

  const handleUpdateDiscount = async (productId, discountData) => {
    const toastId = toast.loading('Updating discount...');
    try {
      await adminApi.updateProductDiscount(productId, discountData);
      toast.success('Discount updated', { id: toastId });
      setEditingDiscountProduct(null);
      fetchData();
      fetchStats();
    } catch {
      toast.error('Failed to update discount', { id: toastId });
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price || 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900">Product Management</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Manage catalog, inventory and pricing.</p>
          </div>
          <Link
            to="/admin/products/new"
            className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 text-white rounded-xl font-medium text-sm sm:text-base hover:bg-rose-600 transition-all shadow-lg shadow-slate-900/20 touch-manipulation"
          >
            <Plus size={18} /> <span>Add Product</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard title="Total Products" value={stats?.totalProducts || 0} icon={<Package size={20} />} color="blue" loading={statsLoading} />
          <StatCard title="Active Discounts" value={stats?.productsWithDiscounts || 0} icon={<Tag size={20} />} color="emerald" loading={statsLoading} />
          <StatCard title="Low Stock" value={stats?.lowStockProducts || 0} icon={<AlertTriangle size={20} />} color="amber" loading={statsLoading} />
          <StatCard title="Out of Stock" value={products.filter(p => p.stock === 0).length} icon={<TrendingDown size={20} />} color="rose" loading={statsLoading} />
        </div>

        {/* Toolbar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 mb-5 sm:mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-none sm:min-w-[150px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:border-rose-500"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="relative flex-1 sm:flex-none sm:min-w-[140px]">
              <select
                value={filterDiscount}
                onChange={(e) => { setFilterDiscount(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:border-rose-500"
              >
                <option value="">All Promotions</option>
                <option value="yes">Discounted</option>
                <option value="no">Regular Price</option>
              </select>
            </div>
            <div className="relative flex-1 sm:flex-none sm:min-w-[150px]">
              <select
                value={sortParam}
                onChange={(e) => { setSortParam(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:border-rose-500"
              >
                <option value="">Sort: Newest First</option>
                <option value="recentlyUpdated">Sort: Recently Updated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <TableSkeleton />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-3.5 whitespace-nowrap">Product</th>
                      <th className="px-4 py-3.5 whitespace-nowrap hidden md:table-cell">Category</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Price</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Stock</th>
                      <th className="px-4 py-3.5 whitespace-nowrap hidden sm:table-cell">Discount</th>
                      <th className="px-4 sm:px-6 py-3.5 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {products.map((product) => (
                        <ProductRow
                          key={product._id}
                          product={product}
                          formatPrice={formatPrice}
                          onDelete={handleDeleteProduct}
                          onEditDiscount={() => setEditingDiscountProduct(product)}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-sm text-slate-500 font-medium order-2 sm:order-1">
                    Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
                  </span>
                  <div className="order-1 sm:order-2">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Discount Modal */}
      <AnimatePresence>
        {editingDiscountProduct && (
          <DiscountModal
            product={editingDiscountProduct}
            onClose={() => setEditingDiscountProduct(null)}
            onSave={handleUpdateDiscount}
            formatPrice={formatPrice}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub Components ---

const StatCard = ({ title, value, icon, color, loading }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
  };
  return (
    <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 sm:gap-4">
      <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">{title}</p>
        {loading ? (
          <div className="h-6 w-12 bg-slate-100 rounded animate-pulse mt-1" />
        ) : (
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{value}</h3>
        )}
      </div>
    </div>
  );
};

const ProductRow = ({ product, formatPrice, onDelete, onEditDiscount }) => {
  const finalPrice = product.price - (product.price * (product.discountPercentage || 0) / 100);

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', short: 'Out', color: 'bg-red-100 text-red-700 border-red-200' };
    if (stock < 10) return { label: 'Low Stock', short: 'Low', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'In Stock', short: 'OK', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  const stockStatus = getStockStatus(product.stock);

  const imageSource = product.images?.[0]?.imageId
    ? `/api/images/${product.images[0].imageId}`
    : product.images?.[0]?.url || null;

  const isRecentlyUpdated = () => {
    if (!product.updatedAt || product.createdAt === product.updatedAt) return false;
    const diffHours = (new Date() - new Date(product.updatedAt)) / (1000 * 60 * 60);
    return diffHours <= 48; // Updated within the last 48 hours
  };

  const getTimeAgo = (dateStr) => {
    const hours = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="hover:bg-slate-50/50 transition-colors"
    >
      {/* Product */}
      <td className="px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
            {imageSource ? (
              <img src={imageSource} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={16} /></div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 line-clamp-2 text-sm leading-snug">{product.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-slate-400 font-mono">#{product._id.slice(-6).toUpperCase()}</p>
              {isRecentlyUpdated() && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  <Clock size={10} /> Updated {getTimeAgo(product.updatedAt)}
                </span>
              )}
            </div>
            {/* Category shown inline on mobile */}
            <span className="md:hidden inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium capitalize border border-slate-200">
              {product.category}
            </span>
          </div>
        </div>
      </td>

      {/* Category — desktop only */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium capitalize border border-slate-200">
          {product.category}
        </span>
      </td>

      {/* Price */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <p className="font-bold text-slate-900 text-sm">{formatPrice(finalPrice)}</p>
        {product.discountPercentage > 0 && (
          <p className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</p>
        )}
        {/* Discount shown inline on mobile */}
        {product.discountPercentage > 0 && (
          <span className="sm:hidden inline-block mt-0.5 bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-rose-200">
            {product.discountPercentage}% OFF
          </span>
        )}
      </td>

      {/* Stock */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-0.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border whitespace-nowrap ${stockStatus.color}`}>
            <span className="hidden sm:inline">{stockStatus.label}</span>
            <span className="sm:hidden">{stockStatus.short}</span>
          </span>
          <span className="text-[10px] text-slate-400">{product.stock} units</span>
        </div>
      </td>

      {/* Discount — tablet+ */}
      <td className="px-4 py-3.5 hidden sm:table-cell">
        {product.discountPercentage > 0 ? (
          <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded text-xs font-bold border border-rose-200">
            {product.discountPercentage}% OFF
          </span>
        ) : (
          <span className="text-slate-400 text-xs italic">None</span>
        )}
      </td>

      {/* Actions — always visible */}
      <td className="px-4 sm:px-6 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <button
            onClick={onEditDiscount}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors touch-manipulation"
            title="Manage Discount"
          >
            <Tag size={16} />
          </button>
          <Link
            to={`/admin/products/${product._id}/edit`}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation"
            title="Edit"
          >
            <Edit size={16} />
          </Link>
          <button
            onClick={() => onDelete(product._id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

const DiscountModal = ({ product, onClose, onSave, formatPrice }) => {
  const [percent, setPercent] = useState(product.discountPercentage || 0);
  const [start, setStart] = useState(
    product.discountStartDate ? new Date(product.discountStartDate).toISOString().split('T')[0] : ''
  );
  const [end, setEnd] = useState(
    product.discountEndDate ? new Date(product.discountEndDate).toISOString().split('T')[0] : ''
  );

  const finalPrice = product.price - (product.price * percent / 100);

  const imageSource = product.images?.[0]?.imageId
    ? `/api/images/${product.images[0].imageId}`
    : product.images?.[0]?.url;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(product._id, {
      discountPercentage: Number(percent),
      discountStartDate: start || null,
      discountEndDate: end || null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
        style={{ maxHeight: 'min(90vh, 600px)' }}
      >
        {/* Drag handle on mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-base sm:text-lg text-slate-900">Manage Discount</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors touch-manipulation">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(min(90vh, 600px) - 64px)' }}>
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {imageSource && (
                <img src={imageSource} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">{product.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">Base Price: {formatPrice(product.price)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Percentage Off</label>
              <div className="relative">
                <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="min-w-0">
                <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400 shrink-0" /> Start Date
                </label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[42px] bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="min-w-0">
                <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400 shrink-0" /> End Date
                </label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  min={start || undefined}
                  className="w-full px-3 py-2.5 min-h-[42px] bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex justify-between items-center gap-3 mt-1">
              <span className="text-rose-800 text-sm font-medium">New Price</span>
              <div className="text-right">
                <span className="block text-2xl font-bold text-rose-600">{formatPrice(finalPrice)}</span>
                {percent > 0 && <span className="text-xs text-rose-400">Save {formatPrice(product.price - finalPrice)}</span>}
              </div>
            </div>

            <div className="flex gap-3 pt-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 touch-manipulation"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 shadow-lg shadow-slate-900/20 touch-manipulation"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center px-4 sm:px-6 py-4 border-b border-slate-100 gap-3">
        <div className="w-10 h-14 sm:w-12 sm:h-16 bg-slate-200 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-2/5" />
          <div className="h-3 bg-slate-200 rounded w-1/4" />
        </div>
        <div className="h-4 bg-slate-200 rounded w-16 hidden md:block" />
        <div className="h-4 bg-slate-200 rounded w-20" />
        <div className="h-6 bg-slate-200 rounded-full w-20 hidden sm:block" />
        <div className="flex gap-1 ml-auto">
          <div className="w-8 h-8 bg-slate-200 rounded-lg" />
          <div className="w-8 h-8 bg-slate-200 rounded-lg" />
          <div className="w-8 h-8 bg-slate-200 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// Smart paginator — same as OrderManagement
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const btnBase = 'min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-sm font-medium transition-all border touch-manipulation';
  const activeBtn = `${btnBase} bg-slate-900 text-white border-slate-900`;
  const normalBtn = `${btnBase} bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200`;
  const disabledBtn = `${btnBase} bg-white text-slate-300 border-slate-100 cursor-not-allowed`;

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('…');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={currentPage === 1 ? disabledBtn : normalBtn} title="First page">
        <ChevronsLeft size={15} />
      </button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={currentPage === 1 ? disabledBtn : normalBtn} title="Previous">
        <ChevronLeft size={15} />
      </button>

      {getPageNumbers().map((p, idx) =>
        p === '…' ? (
          <span key={`e${idx}`} className="min-w-[36px] h-9 flex items-center justify-center text-slate-400 text-sm select-none">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)} className={p === currentPage ? activeBtn : normalBtn}>
            {p}
          </button>
        )
      )}

      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={currentPage === totalPages ? disabledBtn : normalBtn} title="Next">
        <ChevronRight size={15} />
      </button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={currentPage === totalPages ? disabledBtn : normalBtn} title="Last page">
        <ChevronsRight size={15} />
      </button>
    </div>
  );
};

export default ProductManagementDashboard;
