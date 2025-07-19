import React, { useState, useEffect, useCallback } from 'react';
import { Building2, ArrowUpDown, Filter } from 'lucide-react';
import BusinessCard from './components/BusinessCard';
import SearchBar from './components/SearchBar';
import UrlAnalyzer from './components/UrlAnalyzer';
import StatusMessage from './components/StatusMessage';

const App = () => {
  // State management
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('scraped_date');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [totalBusinesses, setTotalBusinesses] = useState(0);

  // Load businesses from API
  const loadBusinesses = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        sort_by: sortBy,
        search: searchTerm || '',
        per_page: 12
      });

      const response = await fetch(`/api/businesses?${params}`);
      if (!response.ok) throw new Error('Failed to fetch businesses');
      
      const result = await response.json();
      if (result.success) {
        setBusinesses(result.data || []);
        setPagination(result.pagination || {});
        setTotalBusinesses(result.pagination?.total_items || 0);
      } else {
        showMessage('Failed to load businesses', 'error');
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
      showMessage('Error loading businesses', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, searchTerm]);

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Delete business
  const deleteBusiness = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const response = await fetch(`/api/businesses/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        showMessage('Business deleted successfully', 'success');
        loadBusinesses();
      } else {
        showMessage(result.error || 'Failed to delete business', 'error');
      }
    } catch (error) {
      showMessage('Error deleting business', 'error');
    }
  };

  // Show status message
  const showMessage = (message, type) => {
    setStatusMessage(message);
    setMessageType(type);
  };

  // Close status message
  const closeMessage = () => {
    setStatusMessage('');
    setMessageType('');
  };

  // View business details
  const viewBusiness = (business) => {
    console.log('📊 App: viewBusiness called with:', business);
    console.log('📊 App: Setting selectedBusiness and showModal to true');
    
    setSelectedBusiness(business);
    setShowModal(true);
    setTimeout(() => {
      console.log('📊 App: Modal state after setState:', {
        showModal: true, // This should be true
        selectedBusiness: business ? business.company_name : 'null'
      });
    }, 100);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedBusiness(null);
  };

  // Handle URL analysis
  const handleAnalyze = () => {
    setCurrentPage(1);
    loadBusinesses();
  };

  // Load businesses on component mount and dependency changes
  useEffect(() => {
    loadBusinesses();
  }, [currentPage, sortBy, searchTerm]);

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      <span className="ml-2 text-gray-600">Loading businesses...</span>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="text-center py-12">
      <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No businesses found</h3>
      <p className="text-gray-600 mb-6">
        {searchTerm ? 'Try adjusting your search terms' : 'Start by analyzing some business websites'}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Messages */}
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
              {/* CHANGED: Green "H" logo instead of Building2 icon */}
              <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                H
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Hyperformr.scraper</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                <span className="font-semibold text-green-600">{totalBusinesses}</span> businesses
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* TEMP: Modal test button */}
      
      {/* TEMPORARY TEST SECTION - Add this after the header */}
<div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
  <div className="text-center">
    <h3 className="text-lg font-medium text-yellow-800 mb-2">🧪 Modal Testing</h3>
    <button 
      onClick={() => {
        console.log('🧪 Test button clicked - forcing modal open');
        if (businesses.length > 0) {
          setSelectedBusiness(businesses[0]);
          setShowModal(true);
        } else {
          alert('No businesses available for testing');
        }
      }}
      className="bg-yellow-500 text-white px-4 py-2 rounded mr-4"
    >
      🧪 Force Modal Open
    </button>
    <div className="text-sm mt-2 text-yellow-700">
      <p>Modal State: <strong>{showModal ? 'OPEN' : 'CLOSED'}</strong></p>
      <p>Selected Business: <strong>{selectedBusiness?.company_name || 'None'}</strong></p>
      <p>Total Businesses: <strong>{businesses.length}</strong></p>
    </div>
  </div>
</div>


      {/* URL Analyzer Section */}
      <UrlAnalyzer 
        onAnalyze={handleAnalyze}
        onStatusMessage={showMessage}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <SearchBar onSearch={handleSearch} />

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={handleSortChange}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => {
                console.log('🔄 Rendering BusinessCard for:', business.company_name, 'with onView:', typeof viewBusiness);
                return (
                  <BusinessCard 
                    key={business.id} 
                    business={business}
                    onView={viewBusiness}  // ← Make sure this line exists
                    onDelete={deleteBusiness}
                  />
                );
              })}
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg ${
                    page === currentPage
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ENHANCED: Business Detail Modal with better structure */}
      {showModal && selectedBusiness && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={closeModal}
              aria-hidden="true"
            ></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedBusiness.company_name || 'Unknown Company'}
                    </h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {selectedBusiness.business_type || 'Unknown'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {selectedBusiness.industry || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    title="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Company Details
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Type:</span>
                        <span className="text-gray-900">{selectedBusiness.business_type || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Industry:</span>
                        <span className="text-gray-900">{selectedBusiness.industry || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Location:</span>
                        <span className="text-gray-900">{selectedBusiness.location || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Founded:</span>
                        <span className="text-gray-900">{selectedBusiness.founded_year || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Model:</span>
                        <span className="text-gray-900">{selectedBusiness.business_model || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Business Intelligence */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Business Intelligence
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Size:</span>
                        <span className="text-gray-900">{selectedBusiness.company_size || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Revenue:</span>
                        <span className="text-gray-900">{selectedBusiness.estimated_revenue || 'Not disclosed'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Employees:</span>
                        <span className="text-gray-900">{selectedBusiness.employee_count || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Target Market:</span>
                        <span className="text-gray-900">{selectedBusiness.target_market || 'General Market'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Services:</span>
                        <span className="text-gray-900">{selectedBusiness.key_services || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Description
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedBusiness.description || 'No description available'}
                  </p>
                </div>

                {/* Additional Info */}
                {(selectedBusiness.contact_info && selectedBusiness.contact_info !== 'Contact info not found') && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <p className="text-sm text-gray-600">{selectedBusiness.contact_info}</p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => window.open(selectedBusiness.url, '_blank')}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Website
                </button>
                <button
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;