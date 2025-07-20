import { ChevronDown, SortAsc } from 'lucide-react'

function FilterSort({ sortBy, onSortChange }) {
  const sortOptions = [
    { value: 'scraped_date', label: 'Recently Added', icon: '🕒' },
    { value: 'company_name', label: 'Company Name (A-Z)', icon: '🔤' },
    { value: 'business_type', label: 'Business Type', icon: '🏢' },
    { value: 'industry', label: 'Industry', icon: '🏭' },
    { value: 'founded_year', label: 'Founded Year (Newest)', icon: '📅' }
  ]

  const currentSort = sortOptions.find(option => option.value === sortBy) || sortOptions[0]

  return (
    <div className="flex items-center space-x-4">
      {/* Sort Dropdown */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Sort indicator */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <SortAsc className="h-4 w-4" />
        <span>
          <span className="mr-1">{currentSort.icon}</span>
          Sort by {currentSort.label}
        </span>
      </div>
    </div>
  )
}

export default FilterSort