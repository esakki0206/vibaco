import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Search, Filter, Edit, Trash2, Eye,
  Package, AlertTriangle, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { adminApi } from '../services/admin'

const ProductManagement = () => {
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({ total: 0, outOfStock: 0, lowStock: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [sortParam, setSortParam] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const CATEGORIES = [
    'silk', 'cotton', 'chiffon', 'georgette', 'crepe',
    'banarasi', 'kanchipuram', 'bridal', 'other'
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await adminApi.getProducts({
        page: currentPage,
        limit: 10,
        search: debouncedSearch,
        category: categoryFilter,
        stockStatus: stockFilter,
        sort: sortParam || undefined
      })
      setProducts(data.products || [])
      setTotalPages(Math.max(1, Math.ceil((data.total || 0) / 10)))
      setStats({
        total: data.total || 0,
        outOfStock: (data.products || []).filter(p => p.stock === 0).length,
        lowStock: (data.products || []).filter(p => p.stock > 0 && p.stock < 10).length
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, debouncedSearch, categoryFilter, stockFilter, sortParam])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRefresh = () => { setRefreshing(true); fetchData() }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this product?')) return
    const toastId = toast.loading('Deleting...')
    try {
      await adminApi.deleteProduct(id)
      toast.success('Product deleted', { id: toastId })
      fetchData()
    } catch {
      toast.error('Failed to delete', { id: toastId })
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
    if (stock < 10) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle }
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900">Product Management</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Manage catalog, inventory and pricing.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm touch-manipulation"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <Link
              to="/admin/products/new"
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 text-white rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-slate-900/20 font-medium text-sm sm:text-base touch-manipulation"
            >
              <Plus size={18} /> <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard title="Total" value={stats.total} icon={<Package size={20} />} color="blue" loading={loading && !products.length} />
          <StatCard title="Low Stock" value={stats.lowStock} icon={<AlertTriangle size={20} />} color="amber" loading={loading && !products.length} />
          <StatCard title="No Stock" value={stats.outOfStock} icon={<XCircle size={20} />} color="red" loading={loading && !products.length} />
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 mb-5 sm:mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-none sm:min-w-[150px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:border-rose-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 sm:flex-none sm:min-w-[130px]">
              <select
                value={stockFilter}
                onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1) }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:border-rose-500"
              >
                <option value="">All Stock</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div className="relative flex-1 sm:flex-none sm:min-w-[150px]">
              <select
                value={sortParam}
                onChange={(e) => { setSortParam(e.target.value); setCurrentPage(1) }}
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
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Package size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your filters</p>
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
                      <th className="px-4 py-3.5 text-center whitespace-nowrap hidden lg:table-cell">Featured</th>
                      <th className="px-4 sm:px-6 py-3.5 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {products.map(product => {
                        const stockStatus = getStockStatus(product.stock)
                        const StockIcon = stockStatus.icon
                        
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
                            key={product._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            {/* Product */}
                            <td className="px-4 sm:px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                  {product.images?.[0] ? (
                                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
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
                              {product.discountedPrice ? (
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{formatPrice(product.discountedPrice)}</p>
                                  <p className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</p>
                                </div>
                              ) : (
                                <p className="font-bold text-slate-900 text-sm">{formatPrice(product.price)}</p>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="px-4 py-3.5">
                              <div className="flex flex-col gap-0.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border whitespace-nowrap ${stockStatus.color}`}>
                                  <StockIcon size={10} /> <span className="hidden sm:inline">{stockStatus.label}</span>
                                  <span className="sm:hidden">{product.stock === 0 ? 'Out' : product.stock < 10 ? 'Low' : 'OK'}</span>
                                </span>
                                <span className="text-[10px] text-slate-400 pl-0.5">({product.stock} units)</span>
                              </div>
                            </td>

                            {/* Featured — large screens only */}
                            <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                              {product.featured
                                ? <CheckCircle size={17} className="text-emerald-500 mx-auto" />
                                : <span className="text-slate-300 text-lg">–</span>}
                            </td>

                            {/* Actions — always visible */}
                            <td className="px-4 sm:px-6 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <Link
                                  to={`/products/${product._id}`}
                                  target="_blank"
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation"
                                  title="View Live"
                                >
                                  <Eye size={16} />
                                </Link>
                                <Link
                                  to={`/admin/products/${product._id}/edit`}
                                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors touch-manipulation"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </Link>
                                <button
                                  onClick={() => handleDelete(product._id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-sm text-slate-500 font-medium order-2 sm:order-1">
                    Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
                    <span className="ml-2 text-slate-400">· {stats.total} products</span>
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
    </div>
  )
}

// --- Sub Components ---

const StatCard = ({ title, value, icon, color, loading }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
  }
  return (
    <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 sm:gap-4">
      <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">{title}</p>
        {loading ? (
          <div className="h-5 sm:h-6 w-10 bg-slate-100 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-lg sm:text-xl font-bold text-slate-900">{value}</p>
        )}
      </div>
    </div>
  )
}

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
        <div className="h-6 bg-slate-200 rounded-full w-20" />
        <div className="flex gap-1 ml-auto">
          <div className="w-8 h-8 bg-slate-200 rounded-lg" />
          <div className="w-8 h-8 bg-slate-200 rounded-lg" />
          <div className="w-8 h-8 bg-slate-200 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
)

// Smart paginator — identical to OrderManagement
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const btnBase = 'min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-sm font-medium transition-all border touch-manipulation'
  const activeBtn = `${btnBase} bg-slate-900 text-white border-slate-900`
  const normalBtn = `${btnBase} bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200`
  const disabledBtn = `${btnBase} bg-white text-slate-300 border-slate-100 cursor-not-allowed`

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = [1]
    if (currentPage > 3) pages.push('…')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('…')
    pages.push(totalPages)
    return pages
  }

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
  )
}

export default ProductManagement
