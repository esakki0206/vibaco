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

  const [sections, setSections] = useState({
    sort: true,
    price: true,
    category: true,
    color: true,
    rating: false
  })

  const [categories, setCategories] = useState([
    'Birthday Gifts', 'Anniversary Gifts', 'Wedding Gifts', 'Personalized Gifts',
    'Kids Gifts', 'Luxury Gifts', 'Gift Hampers', 'Festival Gifts'
  ])
  const [colors, setColors] = useState([])
  const [showAllColors, setShowAllColors] = useState(false)
  const [colorSearch, setColorSearch] = useState('')
  const [loadingCategories, setLoadingCategories] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const data = await productsApi.getProducts({ limit: 1000 })
        if (data.products && Array.isArray(data.products)) {
          const uniqueCategories = [...new Set(
            data.products
              .map(product => product.category)
              .filter(cat => cat && cat.trim() !== '')
          )].sort()

          if (uniqueCategories.length > 0) {
            setCategories(uniqueCategories)
          }

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
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const priceRanges = [
    { label: 'Under $2,000', min: 0, max: 2000 },
    { label: '$2,000 - $4,000', min: 2000, max: 4000 },
    { label: '$4,000 - $7,000', min: 4000, max: 7000 },
    { label: '$7,000 - $10,000', min: 7000, max: 10000 },
    { label: 'Above $10,000', min: 10000, max: '' },
  ]

  const handleCategoryChange = (category) => {
    const normalize = (str) => str?.toLowerCase().trim().replace(/\s+/g, ' ') || ''
    const normalizedCategory = normalize(category)
    const normalizedFilter = normalize(filters.category)

    if (normalizedFilter === normalizedCategory) {
      onFilterChange('category', '')
    } else {
      onFilterChange('category', category)
    }
  }

  const handlePriceRangeSelect = (min, max) => {
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
    <aside className={`w-full bg-white rounded-xl shadow-sm border border-warmgray-200 overflow-hidden ${className}`}>

      {/* Header */}
      <div className="p-5 border-b border-warmgray-100 flex justify-between items-center bg-cream-50/50">
        <h3 className="font-serif text-lg text-warmgray-900 flex items-center gap-2 font-bold">
          <Filter size={18} className="text-burgundy-800" /> Filters
        </h3>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-warmgray-500 hover:text-burgundy-800 flex items-center gap-1 transition-colors uppercase tracking-wide"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="divide-y divide-warmgray-100">

        {/* Sort By */}
        <FilterSection title="Sort By" isOpen={sections.sort} onToggle={() => toggleSection('sort')}>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="w-full p-2.5 bg-warmgray-50 border border-warmgray-200 rounded-lg text-sm text-warmgray-700 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 outline-none cursor-pointer transition-all"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="popular">Best Selling</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price" isOpen={sections.price} onToggle={() => toggleSection('price')}>
          <div className="space-y-3">
            <div className="space-y-1 mb-4">
              {priceRanges.map((range, idx) => {
                const isActive = Number(filters.minPrice) === range.min && (range.max === '' ? filters.maxPrice === '' : Number(filters.maxPrice) === range.max);

                return (
                  <label
                    key={idx}
                    className={`flex items-center cursor-pointer px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-burgundy-50' : 'hover:bg-warmgray-50'}`}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handlePriceRangeSelect(range.min, range.max)}
                        className="peer w-4 h-4 border-2 border-warmgray-300 rounded transition-colors checked:bg-burgundy-800 checked:border-burgundy-800 appearance-none cursor-pointer"
                      />
                      <Check size={10} className="absolute left-[3px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <span className={`ml-3 text-sm ${isActive ? 'text-burgundy-800 font-medium' : 'text-warmgray-600'}`}>
                      {range.label}
                    </span>
                  </label>
                )
              })}
            </div>

            <div className="pt-3 border-t border-warmgray-50">
              <p className="text-xs text-warmgray-400 font-medium mb-2 uppercase tracking-wide">Custom Range</p>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warmgray-400 text-xs">$</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => onFilterChange('minPrice', e.target.value)}
                    className="w-full pl-6 pr-3 py-2 bg-white border border-warmgray-200 rounded-lg text-sm focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-500/10 outline-none transition-all"
                  />
                </div>
                <Minus size={12} className="text-warmgray-400" />
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warmgray-400 text-xs">$</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                    className="w-full pl-6 pr-3 py-2 bg-white border border-warmgray-200 rounded-lg text-sm focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Categories */}
        <FilterSection title="Category" isOpen={sections.category} onToggle={() => toggleSection('category')}>
          {loadingCategories ? (
            <div className="py-4 text-center text-sm text-warmgray-400">Loading categories...</div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(category => {
                const normalize = (str) => str?.toLowerCase().trim().replace(/\s+/g, ' ') || ''
                const normalizedCategory = normalize(category)
                const normalizedFilter = normalize(filters.category)
                const isSelected = normalizedFilter === normalizedCategory

                const displayCategory = category.split(' ').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ')

                return (
                  <label
                    key={category}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all group ${isSelected ? 'bg-burgundy-50' : 'hover:bg-warmgray-50'}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryChange(category)}
                        className="peer hidden"
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors mr-3 ${isSelected ? 'bg-burgundy-800 border-burgundy-800' : 'border-warmgray-300 group-hover:border-burgundy-400'}`}>
                        {isSelected && <Check size={10} className="text-white" strokeWidth={4} />}
                      </div>
                      <span className={`text-sm ${isSelected ? 'text-burgundy-800 font-medium' : 'text-warmgray-600 group-hover:text-warmgray-900'}`}>
                        {displayCategory}
                      </span>
                    </div>
                  </label>
                )
              })}
              {categories.length === 0 && (
                <div className="py-4 text-center text-sm text-warmgray-400">No categories available</div>
              )}
            </div>
          )}
        </FilterSection>

        {/* Colors */}
        <FilterSection title="Colors" isOpen={sections.color} onToggle={() => toggleSection('color')}>
          {loadingCategories ? (
            <div className="py-4 text-center text-sm text-warmgray-400">Loading colors...</div>
          ) : colors.length === 0 ? (
            <div className="py-4 text-center text-sm text-warmgray-400">No colours available</div>
          ) : (
            <div className="flex flex-col gap-3 pt-1">

              <AnimatePresence>
                {(showAllColors || colorSearch) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative mb-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warmgray-400" />
                      <input
                        type="text"
                        placeholder="Search colors..."
                        value={colorSearch}
                        onChange={(e) => setColorSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-warmgray-50 border border-warmgray-200 rounded-lg text-xs placeholder:text-warmgray-400 focus:outline-none focus:border-burgundy-400 focus:ring-1 focus:ring-burgundy-400 transition-all"
                      />
                      {colorSearch && (
                        <button
                          onClick={() => setColorSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray-400 hover:text-warmgray-600 p-0.5"
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
                    const selectedInList = colors.filter(c => selectedColors.includes(c));
                    const unselectedInList = colors.filter(c => !selectedColors.includes(c));
                    visibleColors = [...selectedInList, ...unselectedInList].slice(0, Math.max(initialDisplayCount, selectedInList.length));
                  }

                  if (visibleColors.length === 0 && colorSearch) {
                    return <p className="text-xs text-warmgray-400 italic py-2">No colors match "{colorSearch}"</p>;
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
                            ? 'bg-burgundy-50 border-burgundy-200 text-burgundy-800 shadow-sm'
                            : 'bg-white border-warmgray-200 text-warmgray-600 hover:bg-warmgray-50 hover:border-warmgray-300 hover:text-warmgray-800'
                          }
                        `}
                        title={color}
                        aria-label={isSelected ? `Deselect ${color}` : `Select ${color}`}
                      >
                        <span>{color}</span>
                        {isSelected && (
                          <span className="w-4 h-4 flex items-center justify-center rounded-full bg-burgundy-200/50 text-burgundy-700 hover:bg-burgundy-200 transition-colors">
                            <X size={10} strokeWidth={2.5} />
                          </span>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>

              {colors.length > 12 && !colorSearch && (
                <button
                  onClick={() => setShowAllColors(!showAllColors)}
                  className="text-xs font-semibold text-burgundy-800 hover:text-burgundy-900 flex items-center gap-1 mt-1 transition-colors w-fit p-1"
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

        {/* Availability Switch */}
        <div className="p-5 flex items-center justify-between hover:bg-warmgray-50 transition-colors">
          <span className="text-sm font-medium text-warmgray-700">In Stock Only</span>
          <button
            onClick={() => onFilterChange('inStock', !filters.inStock)}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
              ${filters.inStock ? 'bg-burgundy-800' : 'bg-warmgray-200'}
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
          background-color: #D9D0C5;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #A89888;
        }
      `}</style>
    </aside>
  )
}

const FilterSection = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border-b border-warmgray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-warmgray-50 transition-colors group focus:outline-none"
      >
        <span className="font-semibold text-warmgray-800 text-sm group-hover:text-burgundy-800 transition-colors">
          {title}
        </span>
        <div className="text-warmgray-400 group-hover:text-burgundy-800 transition-colors">
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
