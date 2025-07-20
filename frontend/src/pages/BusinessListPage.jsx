import { useState, useEffect } from 'react'
import BusinessCard from '../components/BusinessCard'
import FilterSort from '../components/FilterSort'
import { Search, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react'

function BusinessListPage({ businesses, onFetchBusinesses, onViewBusiness, onDeleteBusiness, loading }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('scraped_date')
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [localBusinesses, setLocalBusinesses] = useState([])

  // Fetch businesses when component mounts or filters change
  useEffect(() => {
    fetchData()
  }, [searchTerm, sortBy, currentPage])

  const fetchData = async () => {
    const result = await onFetchBusinesses({
      search: searchTerm,
      sort_by: sortBy,
      page: currentPage,
      per_page: 12
    })
    
    if (result) {
      setLocalBusinesses(result.data || [])
      setPagination(result.pagination || {})
    }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleSort = (value) => {
    setSortBy(value)
    setCurrentPage(1) // Reset to first page when sorting
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (businessId) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      const result = await onDeleteBusiness(businessId)
      if (result.success) {
        // Refresh the current page
        fetchData()
      }
    }
  }

  const getSortLabel = (sortValue) => {
    const sortLabels = {
      'scraped_date': 'Recently Added',
      'company_name': 'Company Name',
      'business_type': 'Business Type',
      'industry': 'Industry',
      'founded_year': 'Founded Year'
    }
    return sortLabels[sortValue] || 'Recently Added'
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Database</h1>
        <p className="text-gray-600">
          {pagination.total_items > 0 
            ? `Showing ${localBusinesses.length} of ${pagination.total_items} businesses`
            : 'No businesses found'
          }
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search businesses..."
            className="input-primary pl-10"
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <FilterSort 
            sortBy={sortBy} 
            onSortChange={handleSort}
          />
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' 
                  ? 'bg-green-100 text-green-600' 
                  : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' 
                  ? 'bg-green-100 text-green-600' 
                  : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || sortBy !== 'scraped_date') && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="badge badge-green">
                Search: "{searchTerm}"
                <button
                  onClick={() => handleSearch('')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {sortBy !== 'scraped_date' && (
              <span className="badge badge-emerald">
                Sort: {getSortLabel(sortBy)}
                <button
                  onClick={() => handleSort('scraped_date')}
                  className="ml-2 text-emerald-600 hover:text-emerald-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading businesses...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && localBusinesses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No businesses found' : 'No businesses yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? `No businesses match "${searchTerm}". Try adjusting your search.`
              : 'Start by scraping your first business website.'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              className="btn-secondary"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Business Grid/List */}
      {!loading && localBusinesses.length > 0 && (
        <>
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'
            : 'space-y-4 mb-8'
          }>
            {localBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onView={() => onViewBusiness(business)}
                onDelete={() => handleDelete(business.id)}
                viewMode={viewMode}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.total_pages}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_prev}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  const pageNum = Math.max(1, pagination.current_page - 2) + i
                  if (pageNum > pagination.total_pages) return null
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pageNum === pagination.current_page
                          ? 'bg-green-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BusinessListPage