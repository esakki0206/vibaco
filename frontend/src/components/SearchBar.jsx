import React, { useState, useEffect, useRef } from 'react';
import { IoSearch, IoClose } from 'react-icons/io5';

const SearchBar = ({ 
  onSearch, 
  placeholder = 'Search products...', 
  debounceTime = 500,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  
  // Use a ref to keep track of the timeout ID so we can clear it manually on "Enter"
  const timeoutRef = useRef(null);

  // --- Debounce Logic ---
  useEffect(() => {
    // If empty, trigger immediately to clear results
    if (searchTerm === '') {
      onSearch('');
      return;
    }

    // Set a timeout to trigger search
    timeoutRef.current = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceTime);

    // Cleanup: If the user types again before time is up, clear the previous timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, debounceTime, onSearch]);

  // --- Handlers ---

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    inputRef.current?.focus(); // Keep focus for rapid re-typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 1. Clear the pending debounce timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // 2. Trigger search immediately
    onSearch(searchTerm);
    // 3. Remove focus from input to hide keyboard on mobile
    inputRef.current?.blur(); 
  };

  return (
    <div className={`relative w-full max-w-xl mx-auto ${className}`}>
      <form 
        onSubmit={handleSubmit}
        className={`
          relative flex items-center w-full rounded-full transition-all duration-300
          ${isFocused 
            ? 'bg-white shadow-lg ring-2 ring-rose-500/20 border-rose-500' 
            : 'bg-slate-100 border-transparent hover:bg-slate-50 border border-slate-200'}
        `}
      >
        {/* Search Icon */}
        <div className="pl-4 text-slate-400">
          <IoSearch size={20} className={`${isFocused ? 'text-rose-500' : ''} transition-colors`} />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full py-3 px-3 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 text-base" 
          aria-label="Search"
        />

        {/* Clear Button (Visible only when typing) */}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 mr-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-all active:scale-95"
            aria-label="Clear search"
          >
            <IoClose size={20} />
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;