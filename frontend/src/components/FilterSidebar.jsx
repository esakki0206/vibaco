import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Filter, RotateCcw, Check, Minus, Plus, X, Search } from 'lucide-react'
import { productsApi } from '../services/products'

const FilterSidebar = ({
  filters,
  onFilterChange,
  onToggleArray,
  className = ""
}) => {

  // Accordion States
  const [sections, setSections] = useState({
    sort: true,
    price: true, // Opened by default for visibility
    category: true,
    color: true,
    rating: false
  })

  const [categories, setCategories] = useState([
    'Sarees', 'Pure silk Sarees', 'Salwar’s', 'Kurtis/Readymade', 'Jewels'
  ])
  const [colors, setColors] = useState([])
  const [showAllColors, setShowAllColors] = useState(false)
  const [colorSearch, setColorSearch] = useState('')
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Fetch unique categories from products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        // Fetch a large number of products to get all categories
        const data = await productsApi.getProducts({ limit: 1000 })
        if (data.products && Array.isArray(data.products)) {
          // Extract unique categories - keep original values for comparison
          const uniqueCategories = [...new Set(
            data.products
              .map(product => product.category)
              .filter(cat => cat && cat.trim() !== '')
          )].sort()

          if (uniqueCategories.length > 0) {
            setCategories(uniqueCategories)
          }

          // Extract unique colors based on actual available product data
          const distinctColors = [...new Set(
            data.products
              .flatMap(product => {
                const colorImagesColors = product.colorImages?.map(ci => ci.color) || [];
                const plainColors = product.colors || [];
                return [...colorImagesColors, ...plainColors];
              })
              .filter(color => color && color.trim() !== '')
              .map(color => {
                const c = color.trim()
                return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()
              })
          )].sort()

          if (distinctColors.length > 0) {
             setColors(distinctColors)
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Keep default categories on error
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Predefined Price Ranges
  const priceRanges = [
    { label: 'Under ₹2,000', min: 0, max: 2000 },
    { label: '₹2,000 - ₹4,000', min: 2000, max: 4000 },
    { label: '₹4,000 - ₹7,000', min: 4000, max: 7000 },
    { label: '₹7,000 - ₹10,000', min: 7000, max: 10000 },
    { label: 'Above ₹10,000', min: 10000, max: '' }, // empty string for no upper limit
  ]

  // --- Handlers ---

  const handleCategoryChange = (category) => {
    // Normalize for comparison
    const normalize = (str) => str?.toLowerCase().trim().replace(/\s+/g, ' ') || ''
    const normalizedCategory = normalize(category)
    const normalizedFilter = normalize(filters.category)

    if (normalizedFilter === normalizedCategory) {
      onFilterChange('category', '')
    } else {
      // Use the exact category value as stored in database (preserve original case)
      onFilterChange('category', category)
    }
  }

  // Handle Price Range Selection (Acts like a Radio)
  const handlePriceRangeSelect = (min, max) => {
    // If clicking the currently active range, clear it
    if (filters.minPrice == min && filters.maxPrice == max) {
      onFilterChange('minPrice', '')
      onFilterChange('maxPrice', '')
    } else {
      onFilterChange('minPrice', min)
      onFilterChange('maxPrice', max)
    }
  }

  const handleReset = () => {
    onFilterChange('category', '')
    onFilterChange('minPrice', '')
    onFilterChange('maxPrice', '')
    onFilterChange('colors', [])
    onFilterChange('inStock', false)
    onFilterChange('sortBy', 'newest')
  }

  return (
    <aside className={`w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>

      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-serif text-lg text-slate-900 flex items-center gap-2 font-bold">
          <Filter size={18} className="text-rose-600" /> Filters
        </h3>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors uppercase tracking-wide"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="divide-y divide-slate-100">

        {/* 1. Sort By */}
        <FilterSection title="Sort By" isOpen={sections.sort} onToggle={() => toggleSection('sort')}>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none cursor-pointer transition-all"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="popular">Best Selling</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </FilterSection>

        {/* 2. Price Range (Ranges + Manual) */}
        <FilterSection title="Price" isOpen={sections.price} onToggle={() => toggleSection('price')}>
          <div className="space-y-3">

            {/* Checkbox Ranges */}
            <div className="space-y-1 mb-4">
              {priceRanges.map((range, idx) => {
                // Check if this range is currently active in the manual inputs
                const isActive = Number(filters.minPrice) === range.min && (range.max === '' ? filters.maxPrice === '' : Number(filters.maxPrice) === range.max);

                return (
                  <label
                    key={idx}
                    className={`flex items-center cursor-pointer px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-rose-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox" // UI looks like checkbox, logic acts like radio
                        checked={isActive}
                        onChange={() => handlePriceRangeSelect(range.min, range.max)}
                        className="peer w-4 h-4 border-2 border-slate-300 rounded transition-colors checked:bg-rose-600 checked:border-rose-600 appearance-none cursor-pointer"
                      />
                      <Check size={10} className="absolute left-[3px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <span className={`ml-3 text-sm ${isActive ? 'text-rose-700 font-medium' : 'text-slate-600'}`}>
                      {range.label}
                    </span>
                  </label>
                )
              })}
            </div>

            {/* Manual Inputs */}
            <div className="pt-3 border-t border-slate-50">
              <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">Custom Range</p>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => onFilterChange('minPrice', e.target.value)}
                    className="w-full pl-6 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none transition-all"
                  />
                </div>
                <Minus size={12} className="text-slate-400" />
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                    className="w-full pl-6 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* 3. Categories */}
        <FilterSection title="Category" isOpen={sections.category} onToggle={() => toggleSection('category')}>
          {loadingCategories ? (
            <div className="py-4 text-center text-sm text-slate-400">Loading categories...</div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(category => {
                // Normalize category for comparison (case-insensitive, trim spaces)
                const normalize = (str) => str?.toLowerCase().trim().replace(/\s+/g, ' ') || ''
                const normalizedCategory = normalize(category)
                const normalizedFilter = normalize(filters.category)
                const isSelected = normalizedFilter === normalizedCategory

                // Format category for display (capitalize first letter of each word)
                const displayCategory = category.split(' ').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ')

                return (
                  <label
                    key={category}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all group ${isSelected ? 'bg-rose-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryChange(category)}
                        className="peer hidden"
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors mr-3 ${isSelected ? 'bg-rose-600 border-rose-600' : 'border-slate-300 group-hover:border-rose-400'}`}>
                        {isSelected && <Check size={10} className="text-white" strokeWidth={4} />}
                      </div>
                      <span className={`text-sm ${isSelected ? 'text-rose-700 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>
                        {displayCategory}
                      </span>
                    </div>
                  </label>
                )
              })}
              {categories.length === 0 && (
                <div className="py-4 text-center text-sm text-slate-400">No categories available</div>
              )}
            </div>
          )}
        </FilterSection>

        {/* 4. Colors */}
        <FilterSection title="Colors" isOpen={sections.color} onToggle={() => toggleSection('color')}>
          {loadingCategories ? (
            <div className="py-4 text-center text-sm text-slate-400">Loading colors...</div>
          ) : colors.length === 0 ? (
            <div className="py-4 text-center text-sm text-slate-400">No colours available</div>
          ) : (
            <div className="flex flex-col gap-3 pt-1">
              
              {/* Local Search for Colors (only shown when expanded or if searching) */}
              <AnimatePresence>
                {(showAllColors || colorSearch) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative mb-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search colors..." 
                        value={colorSearch}
                        onChange={(e) => setColorSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
                      />
                      {colorSearch && (
                        <button 
                          onClick={() => setColorSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {(()=>{
                  const filteredColors = colorSearch 
                    ? colors.filter(c => c.toLowerCase().includes(colorSearch.toLowerCase()))
                    : colors;
                  
                  const selectedColors = filters.colors || [];
                  const initialDisplayCount = 12;

                  let visibleColors = filteredColors;
                  if (!showAllColors && !colorSearch) {
                    // Always show selected colors, then fill the rest
                    const selectedInList = colors.filter(c => selectedColors.includes(c));
                    const unselectedInList = colors.filter(c => !selectedColors.includes(c));
                    visibleColors = [...selectedInList, ...unselectedInList].slice(0, Math.max(initialDisplayCount, selectedInList.length));
                  }

                  if (visibleColors.length === 0 && colorSearch) {
                    return <p className="text-xs text-slate-400 italic py-2">No colors match "{colorSearch}"</p>;
                  }

                  return visibleColors.map((color) => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => onToggleArray('colors', color)}
                        className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border touch-manipulation
                          ${isSelected 
                            ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800'
                          }
                        `}
                        title={color}
                        aria-label={isSelected ? `Deselect ${color}` : `Select ${color}`}
                      >
                        <span>{color}</span>
                        {isSelected && (
                          <span className="w-4 h-4 flex items-center justify-center rounded-full bg-rose-200/50 text-rose-600 hover:bg-rose-200 transition-colors">
                            <X size={10} strokeWidth={2.5} />
                          </span>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Toggle Button */}
              {colors.length > 12 && !colorSearch && (
                <button 
                  onClick={() => setShowAllColors(!showAllColors)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 mt-1 transition-colors w-fit p-1"
                >
                  {showAllColors ? (
                     <><Minus size={14} /> Show Less</>
                  ) : (
                     <><Plus size={14} /> Show All ({colors.length})</>
                  )}
                </button>
              )}
            </div>
          )}
        </FilterSection>

        {/* 5. Availability Switch */}
        <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <span className="text-sm font-medium text-slate-700">In Stock Only</span>
          <button
            onClick={() => onFilterChange('inStock', !filters.inStock)}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
              ${filters.inStock ? 'bg-rose-600' : 'bg-slate-200'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                ${filters.inStock ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </aside>
  )
}

// --- Helper Component ---
const FilterSection = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-slate-50 transition-colors group focus:outline-none"
      >
        <span className="font-semibold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">
          {title}
        </span>
        <div className="text-slate-400 group-hover:text-rose-600 transition-colors">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FilterSidebar