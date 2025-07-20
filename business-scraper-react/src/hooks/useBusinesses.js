import { useState, useEffect, useCallback } from 'react';

const useBusinesses = () => {
  // All the state we need
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('scraped_date');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  
  // Modal state
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Status messages
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Load businesses from API
  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: currentPage,
        sort_by: sortBy,
        search: searchTerm,
        per_page: 12
      });

      console.log('🔍 Loading businesses...');
      const response = await fetch(`/api/businesses?${params}`);
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Loaded', result.data.length, 'businesses');
        setBusinesses(result.data || []);
        setPagination(result.pagination || {});
        setTotalBusinesses(result.pagination?.total_items || 0);
      } else {
        console.error('❌ API error:', result.error);
        showMessage('Failed to load businesses', 'error');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      showMessage('Error loading businesses', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, searchTerm]);

  // Search function
  const handleSearch = useCallback((term) => {
    console.log('🔍 Searching for:', term);
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  // Sort function
  const handleSortChange = useCallback((newSortBy) => {
    console.log('📊 Sorting by:', newSortBy);
    setSortBy(newSortBy);
    setCurrentPage(1);
  }, []);

  // Page change function
  const handlePageChange = useCallback((page) => {
    console.log('📄 Going to page:', page);
    setCurrentPage(page);
  }, []);

  // Delete business
  const deleteBusiness = useCallback(async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/businesses/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        showMessage('Business deleted successfully', 'success');
        loadBusinesses();
      } else {
        showMessage('Failed to delete business', 'error');
      }
    } catch (error) {
      showMessage('Error deleting business', 'error');
    }
  }, [loadBusinesses]);

  // View business (eye button)
  const viewBusiness = useCallback((business) => {
    console.log('👁️ Viewing business:', business?.company_name);
    setSelectedBusiness(business);
    setShowModal(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    console.log('❌ Closing modal');
    setShowModal(false);
    setSelectedBusiness(null);
  }, []);

  // Show message
  const showMessage = useCallback((message, type = 'info') => {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    setStatusMessage(message);
    setMessageType(type);
  }, []);

  // Close message
  const closeMessage = useCallback(() => {
    setStatusMessage('');
    setMessageType('');
  }, []);

  // Handle URL analysis
  const handleAnalyzeComplete = useCallback(() => {
    console.log('🔍 Analysis completed, reloading...');
    setCurrentPage(1);
    loadBusinesses();
  }, [loadBusinesses]);

  // Load businesses when page loads or dependencies change
  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  // Return everything the component needs
  return {
    // Data
    businesses,
    loading,
    sortBy,
    currentPage,
    pagination,
    totalBusinesses,
    
    // Modal
    selectedBusiness,
    showModal,
    
    // Status
    statusMessage,
    messageType,
    
    // Functions
    handleSearch,
    handleSortChange,
    handlePageChange,
    deleteBusiness,
    viewBusiness,
    closeModal,
    showMessage,
    closeMessage,
    handleAnalyzeComplete
  };
};

export default useBusinesses;