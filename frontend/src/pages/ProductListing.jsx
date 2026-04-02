import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import FilterSidebar from '../components/FilterSidebar'
import { productsApi } from '../services/products'
import { FiFilter, FiGrid, FiList, FiX, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    colors: searchParams.get('colors') ? searchParams.get('colors').split(',') : [],
    sizes: searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [],
    inStock: searchParams.get('inStock') === 'true',
    sortBy: searchParams.get('sortBy') || 'newest'
  })

  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    const urlCategory = searchParams.get('category') || ''

    setFilters(prev => {
      if (prev.search !== urlSearch || prev.category !== urlCategory) {
        return {
          ...prev,
          search: urlSearch,
          category: urlCategory
        }
      }
      return prev
    })
  }, [searchParams])

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    const params = {}
    if (filters.category) params.category = filters.category
    if (filters.search) params.search = filters.search
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    if (filters.colors.length > 0) params.colors = filters.colors.join(',')
    if (filters.sizes.length > 0) params.sizes = filters.sizes.join(',')
    if (filters.inStock) params.inStock = 'true'
    if (filters.sortBy !== 'newest') params.sortBy = filters.sortBy
    if (pagination.page > 1) params.page = pagination.page.toString()

    setSearchParams(params, { replace: true })
  }, [filters, pagination.page, setSearchParams])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const apiParams = {
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sortBy,
        category: filters.category,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        inStock: filters.inStock,
        variantColors: filters.colors.join(','),
        sizes: filters.sizes.join(',')
      }

      Object.keys(apiParams).forEach(key => {
        if (apiParams[key] === '' || apiParams[key] === null || apiParams[key] === undefined) {
          delete apiParams[key]
        }
      })

      const data = await productsApi.getProducts(apiParams)
      setProducts(data.products || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }))
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  useEffect(() => {
    fetchProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchProducts])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => {
      const current = prev[key]
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]

      return { ...prev, [key]: updated }
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearAllFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      colors: [],
      sizes: [],
      inStock: false,
      sortBy: 'newest'
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.category) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.inStock) count++
    count += filters.colors.length
    count += filters.sizes.length
    return count
  }

  return (
    <div className="listing-page">
      {/* Sticky Header */}
      <div className="sticky-header">
        <div className="container">
          <div className="header-row">

            <div className="header-info">
              <h1 className="page-title">
                {filters.category
                  ? filters.category
                  : filters.search
                    ? `Results for "${filters.search}"`
                    : 'Gift Collection'}
              </h1>
              <span className="product-count">
                {loading ? 'Loading...' : `${pagination.total} Items`}
              </span>
            </div>

            <div className="header-controls">
              <button
                className="control-btn mobile-filter-btn"
                onClick={() => setShowMobileFilters(true)}
              >
                <FiFilter /> Filters
                {getActiveFilterCount() > 0 && <span className="badge">{getActiveFilterCount()}</span>}
              </button>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FiGrid />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>

          {getActiveFilterCount() > 0 && (
            <div className="active-tags-row">
              {filters.category && (
                <div className="tag">
                  {filters.category} <FiX onClick={() => handleFilterChange('category', '')} />
                </div>
              )}
              {filters.colors.map(color => (
                <div key={color} className="tag">
                  <span className="color-dot" style={{ backgroundColor: color }}></span>
                  {color} <FiX onClick={() => toggleArrayFilter('colors', color)} />
                </div>
              ))}
              {(filters.minPrice || filters.maxPrice) && (
                <div className="tag">
                  ${filters.minPrice || 0} - ${filters.maxPrice || 'Any'}
                  <FiX onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', '') }} />
                </div>
              )}
              {filters.inStock && (
                <div className="tag">
                  In Stock <FiX onClick={() => handleFilterChange('inStock', false)} />
                </div>
              )}
              <button className="clear-text" onClick={clearAllFilters}>Clear All</button>
            </div>
          )}
        </div>
      </div>

      <div className="main-layout container">
        <aside className="sidebar-desktop">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onToggleArray={toggleArrayFilter}
          />
        </aside>

        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div
                className="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
              />
              <motion.aside
                className="sidebar-mobile"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
              >
                <div className="mobile-header">
                  <h3>Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)}><FiX size={24} /></button>
                </div>
                <div className="mobile-content">
                  <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onToggleArray={toggleArrayFilter}
                  />
                </div>
                <div className="mobile-footer">
                  <button className="btn-reset" onClick={clearAllFilters}>Reset</button>
                  <button className="btn-apply" onClick={() => setShowMobileFilters(false)}>
                    Show {pagination.total} Results
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="product-area">
          {loading ? (
            <div className="loader-area">
              <div className="spinner"></div>
              <p>Finding perfect gifts...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎁</div>
              <h3>No gifts found</h3>
              <p>Try changing your filters or search for something else.</p>
              <button onClick={clearAllFilters}>View All Gifts</button>
            </div>
          ) : (
            <>
              <div className={`products-grid ${viewMode}`}>
                {products.map(product => (
                  <ProductCard key={product._id} product={product} viewMode={viewMode} />
                ))}
              </div>

              <div className="pagination-container">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
                />
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        :root {
          --primary: #7B2D3B;
          --bg-page: #FEFAF3;
          --border: #EBE5DE;
          --text-main: #2C2C2C;
          --text-muted: #8F7E6E;
        }

        .listing-page {
          background-color: var(--bg-page);
          min-height: 100vh;
        }

        .container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .sticky-header {
          background: white;
          position: sticky;
          top: 0;
          z-index: 40;
          border-bottom: 1px solid var(--border);
          padding: 16px 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: var(--text-main);
          margin: 0;
          text-transform: capitalize;
        }

        .product-count {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-top: 4px;
          display: block;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid var(--border);
          background: white;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .control-btn:hover { border-color: var(--text-muted); }

        .badge {
          background: var(--primary);
          color: white;
          font-size: 10px;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          position: absolute;
          top: -6px;
          right: -6px;
        }

        .mobile-filter-btn { display: none; }

        .view-toggle {
          display: flex;
          background: #F5F0EB;
          padding: 4px;
          border-radius: 8px;
        }

        .view-btn {
          padding: 6px 10px;
          border: none;
          background: transparent;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
        }

        .view-btn.active {
          background: white;
          color: var(--text-main);
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .active-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #F5F0EB;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: #fdf2f4;
          color: var(--primary);
          border: 1px solid #f9d0d9;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .tag svg { cursor: pointer; }

        .color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
        }

        .clear-text {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          text-decoration: underline;
          cursor: pointer;
        }

        .main-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 32px;
          padding-top: 32px;
          padding-bottom: 60px;
        }

        .sidebar-desktop {
          position: sticky;
          top: 140px;
          height: fit-content;
          max-height: calc(100vh - 160px);
          overflow-y: auto;
          padding-right: 8px;
        }

        .backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(2px);
          z-index: 90;
        }

        .sidebar-mobile {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 85%;
          max-width: 320px;
          background: white;
          z-index: 100;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 24px rgba(0,0,0,0.1);
        }

        .mobile-header {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }

        .mobile-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .mobile-footer {
          padding: 16px;
          border-top: 1px solid var(--border);
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 12px;
        }

        .btn-reset {
          background: white;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
          font-weight: 600;
        }

        .btn-apply {
          background: var(--text-main);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
        }

        .products-grid.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }

        .products-grid.list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .loader-area, .empty-state {
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #EBE5DE;
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .empty-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }
        .empty-state h3 { margin: 0; color: var(--text-main); }
        .empty-state p { color: var(--text-muted); margin: 8px 0 24px; }
        .empty-state button {
          background: var(--text-main);
          color: white;
          padding: 10px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }

        .pagination-container {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .smart-pagination {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .page-btn {
          min-width: 38px;
          height: 38px;
          padding: 0 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: white;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn.nav-btn {
          color: var(--text-main);
        }

        .page-btn:hover:not(:disabled) {
          border-color: var(--primary);
          color: var(--primary);
          background: #fdf2f4;
        }

        .page-btn.active {
          background: var(--text-main);
          color: white;
          border-color: var(--text-main);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #FAF9F7;
        }

        .page-dots {
          color: var(--text-muted);
          font-weight: bold;
          padding: 0 4px;
          user-select: none;
        }

        @media (max-width: 1024px) {
          .main-layout { grid-template-columns: 1fr; }
          .sidebar-desktop { display: none; }
          .mobile-filter-btn { display: flex; }
        }

        @media (max-width: 640px) {
          .sticky-header { top: -1px; }
          .products-grid.grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .header-row { gap: 12px; }
          .header-controls { width: 100%; justify-content: space-between; }
          .page-title { font-size: 1.25rem; }
        }
      `}</style>
    </div>
  )
}

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="smart-pagination">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="page-btn nav-btn"
        title="First page"
      >
        <FiChevronsLeft size={16} />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="page-btn nav-btn"
        title="Previous page"
      >
        <FiChevronLeft size={16} />
      </button>

      {getPageNumbers().map((p, idx) =>
        p === '...' ? (
          <span key={`e${idx}`} className="page-dots">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`page-btn ${p === currentPage ? 'active' : ''}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="page-btn nav-btn"
        title="Next page"
      >
        <FiChevronRight size={16} />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="page-btn nav-btn"
        title="Last page"
      >
        <FiChevronsRight size={16} />
      </button>
    </div>
  );
};

export default ProductListing
