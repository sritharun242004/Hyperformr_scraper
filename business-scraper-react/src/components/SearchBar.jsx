import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search companies, industries, locations..." }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // Call onSearch with delay
    setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  const clearSearch = () => {
    setSearchValue('');
    onSearch('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchValue);
    }
  };

  return (
    <div className="relative flex-1">
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Search className="h-4 w-4 text-gray-400" />
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
      />

      {/* Clear Button */}
      {searchValue && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <button
            onClick={clearSearch}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;