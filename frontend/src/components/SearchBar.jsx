import React, { useState, useEffect, useRef } from 'react';
import { IoSearch, IoClose } from 'react-icons/io5';

const SearchBar = ({
  onSearch,
  placeholder = 'Search gifts...',
  debounceTime = 500,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (searchTerm === '') {
      onSearch('');
      return;
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceTime);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, debounceTime, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSearch(searchTerm);
    inputRef.current?.blur();
  };

  return (
    <div className={`relative w-full max-w-xl mx-auto ${className}`}>
      <form
        onSubmit={handleSubmit}
        className={`
          relative flex items-center w-full rounded-full transition-all duration-300
          ${isFocused
            ? 'bg-white shadow-lg ring-2 ring-burgundy-500/20 border-burgundy-500'
            : 'bg-warmgray-100 border-transparent hover:bg-warmgray-50 border border-warmgray-200'}
        `}
      >
        <div className="pl-4 text-warmgray-400">
          <IoSearch size={20} className={`${isFocused ? 'text-burgundy-700' : ''} transition-colors`} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full py-3 px-3 bg-transparent border-none outline-none text-warmgray-700 placeholder:text-warmgray-400 text-base"
          aria-label="Search"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 mr-2 text-warmgray-400 hover:text-burgundy-800 rounded-full hover:bg-burgundy-50 transition-all active:scale-95"
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
