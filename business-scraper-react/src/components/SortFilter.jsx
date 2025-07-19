import React, { useState } from 'react';
import { ArrowUpDown, Filter, X } from 'lucide-react';

const SortFilter = ({ 
  sortBy, 
  onSortChange, 
  onFilterChange,
  showFilters = false,
  onToggleFilters 
}) => {
  const [filters, setFilters] = useState({
    businessType: '',
    industry: '',
    location: '',
    companySize: ''
  });

  const sortOptions = [
    { value: 'scraped_date', label: 'Recent First' },
    { value: 'company_name', label: 'Company Name' },
    { value: 'business_type', label: 'Business Type' },
    { value: 'industry', label: 'Industry' },
    { value: 'founded_year', label: 'Founded Year' }
  ];

  const businessTypes = [
    'SaaS/Software',
    'E-commerce', 
    'Fintech',
    'Consulting',
    'Healthcare/Medtech',
    'Education/EdTech',
    'Media/Content',
    'Technology'
  ];

  const industries = [
    'Technology',
    'Healthcare', 
    'Finance',
    'E-commerce',
    'Education',
    'Marketing',
    'Manufacturing',
    'Real Estate',
    'Transportation',
    'Entertainment'
  ];

  const companySizes = [
    'Startup (1-10 employees)',
    'Small (11-50 employees)', 
    'Medium (51-200 employees)',
    'Large (201-1000 employees)',
    'Enterprise (1000+ employees)'
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    const emptyFilters = {
      businessType: '',
      industry: '',
      location: '',
      companySize: ''
    };
    setFilters(emptyFilters);
    if (onFilterChange) {
      onFilterChange(emptyFilters);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      {/* Sort and Filter Toggle Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange && onSortChange(e)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={onToggleFilters}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="text-sm">Clear</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Filter Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Business Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                value={filters.businessType}
                onChange={(e) => handleFilterChange('businessType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">All Types</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Enter location..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Company Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                value={filters.companySize}
                onChange={(e) => handleFilterChange('companySize', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">All Sizes</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortFilter;