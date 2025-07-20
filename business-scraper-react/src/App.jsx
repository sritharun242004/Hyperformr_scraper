import React from 'react';
import { Building2, ArrowUpDown } from 'lucide-react';

// Import components
import BusinessCard from './components/BusinessCard';
import SearchBar from './components/SearchBar';
import UrlAnalyzer from './components/UrlAnalyzer';
import StatusMessage from './components/StatusMessage';
import BusinessModal from './components/BusinessModal';

// Import hook
import useBusinesses from './hooks/useBusinesses';

const App = () => {
  // Get everything from our hook
  const {
    businesses,
    loading,
    sortBy,
    currentPage,
    pagination,
    totalBusinesses,
    selectedBusiness,
    showModal,
    statusMessage,
    messageType,
    handleSearch,
    handleSortChange,
    handlePageChange,
    deleteBusiness,
    viewBusiness,
    closeModal,
    showMessage,
    closeMessage,
    handleAnalyzeComplete
  } = useBusinesses();

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      <span className="ml-2 text-gray-600">Loading businesses...</span>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No businesses found</h3>
      <p className="text-gray-600 mb-6">
        Try searching for something else or add a new business website
      </p>
    </div>
  );

  // Pagination component
  const Pagination = () => {
    if (!pagination.total_pages || pagination.total_pages <= 1) return null;

    return (
      <div className="flex justify-center mt-8">
        <div className="flex space-x-2">
          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Message */}
      <StatusMessage 
        message={statusMessage}
        type={messageType}
        onClose={closeMessage}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                H
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Business Scraper</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                <span className="font-semibold text-green-600">{totalBusinesses}</span> businesses
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* URL Analyzer */}
      <UrlAnalyzer 
        onAnalyze={handleAnalyzeComplete}
        onStatusMessage={showMessage}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Sort */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <SearchBar onSearch={handleSearch} />
            
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="scraped_date">Recent First</option>
                <option value="company_name">Company Name</option>
                <option value="business_type">Business Type</option>
                <option value="industry">Industry</option>
                <option value="founded_year">Founded Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Business Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : businesses.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {businesses.map((business) => (
                <BusinessCard 
                  key={business.id} 
                  business={business}
                  onView={viewBusiness}
                  onDelete={deleteBusiness}
                />
              ))}
            </div>
            <Pagination />
          </>
        )}
      </main>

      {/* Modal */}
      <BusinessModal 
        isOpen={showModal}
        onClose={closeModal}
        business={selectedBusiness}
      />
    </div>
  );
};

export default App;