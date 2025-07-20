import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import BusinessListPage from './pages/BusinessListPage'
import BusinessDetail from './components/BusinessDetail'
import { Database, ArrowLeft } from 'lucide-react'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)

  // Fetch businesses from API
  const fetchBusinesses = async (params = {}) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        per_page: params.per_page || 12,
        search: params.search || '',
        sort_by: params.sort_by || 'scraped_date'
      })

      const response = await fetch(`http://localhost:5003/api/businesses?${queryParams}`)
      const data = await response.json()
      
      if (data.success) {
        setBusinesses(data.data)
        return data
      } else {
        console.error('Failed to fetch businesses:', data.error)
        return { data: [], pagination: {} }
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
      return { data: [], pagination: {} }
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Scrape new business
  const scrapeBusiness = async (url) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5003/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh business list and stats immediately
        await Promise.all([
          fetchBusinesses(),
          fetchStats()
        ])
        return { success: true, data: data.data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Error scraping business:', error)
      return { success: false, error: 'Failed to scrape business' }
    } finally {
      setLoading(false)
    }
  }

  // Delete business
  const deleteBusiness = async (businessId) => {
    try {
      const response = await fetch(`http://localhost:5003/api/businesses/${businessId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh business list
        await fetchBusinesses()
        await fetchStats()
        // If we're viewing the deleted business, go back to list
        if (selectedBusiness && selectedBusiness.id === businessId) {
          setSelectedBusiness(null)
          setCurrentPage('businesses')
        }
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Error deleting business:', error)
      return { success: false, error: 'Failed to delete business' }
    }
  }

  // Navigation functions
  const goToBusinessList = () => {
    setCurrentPage('businesses')
    setSelectedBusiness(null)
  }

  const goToHome = () => {
    setCurrentPage('home')
    setSelectedBusiness(null)
  }

  const viewBusinessDetail = (business) => {
    setSelectedBusiness(business)
    setCurrentPage('detail')
  }

  const goBack = () => {
    if (currentPage === 'detail') {
      setCurrentPage('businesses')
      setSelectedBusiness(null)
    } else if (currentPage === 'businesses') {
      setCurrentPage('home')
    }
  }

  // Load initial data
  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f0fdf4, #ffffff, #ecfdf5)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ 
        background: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #dcfce7',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-4">
              {currentPage !== 'home' && (
                <button
                  onClick={goBack}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                  style={{ ':hover': { background: '#f0fdf4' } }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(to right, #84cc16, #65a30d)' }}
                >
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <div>
                  <h1 
                    className="text-xl font-bold"
                    style={{ 
                      background: 'linear-gradient(to right, #84cc16, #65a30d)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Hyperformr.scraper
                  </h1>
                  <p className="text-sm text-gray-500">Business Intelligence</p>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-3">
              {currentPage !== 'home' && (
                <button
                  onClick={goToHome}
                  className="px-4 py-2 text-gray-600 rounded-lg transition-colors"
                  style={{ ':hover': { color: '#16a34a', background: '#f0fdf4' } }}
                >
                  Home
                </button>
              )}
              
              {/* Always show businesses button when not on businesses page */}
              {currentPage !== 'businesses' && (
                <button
                  onClick={goToBusinessList}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-sm"
                  style={{ 
                    background: '#dcfce7', 
                    color: '#15803d',
                    ':hover': { background: '#bbf7d0' }
                  }}
                >
                  <Database className="h-4 w-4" />
                  <span>
                    {stats ? `View Businesses (${stats.total_businesses})` : 'View Businesses'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'home' && (
          <HomePage
            onScrapeBusiness={scrapeBusiness}
            onViewBusinesses={goToBusinessList}
            loading={loading}
            stats={stats}
          />
        )}

        {currentPage === 'businesses' && (
          <BusinessListPage
            businesses={businesses}
            onFetchBusinesses={fetchBusinesses}
            onViewBusiness={viewBusinessDetail}
            onDeleteBusiness={deleteBusiness}
            loading={loading}
          />
        )}

        {currentPage === 'detail' && selectedBusiness && (
          <BusinessDetail
            business={selectedBusiness}
            onDelete={deleteBusiness}
            onBack={goBack}
          />
        )}
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-xl p-6 shadow-xl" style={{ border: '1px solid #dcfce7' }}>
            <div className="flex items-center space-x-3">
              <div className="spinner"></div>
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App