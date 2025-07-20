import { useState } from 'react'
import SearchForm from '../components/SearchForm'
import { Database, Zap, Shield, Search, TrendingUp } from 'lucide-react'

function HomePage({ onScrapeBusiness, onViewBusinesses, loading, stats }) {
  const [recentScrape, setRecentScrape] = useState(null)

  const handleScrape = async (url) => {
    const result = await onScrapeBusiness(url)
    if (result.success) {
      setRecentScrape(result.data)
    }
    return result
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-8">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-lg"
            style={{ background: 'linear-gradient(to right, #16a34a, #059669)' }}
          >
            <span className="text-white font-bold text-3xl">H</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Business Intelligence
            <span 
              className="block"
              style={{ 
                background: 'linear-gradient(to right, #16a34a, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Made Simple
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform any business website into comprehensive insights with Hyperformr.scraper. 
            Extract company data, analyze market position, and build your business intelligence database in seconds.
          </p>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            <div className="card text-center" style={{ borderColor: '#dcfce7' }}>
              <div 
                className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3"
                style={{ background: '#dcfce7' }}
              >
                <Database className="h-6 w-6" style={{ color: '#16a34a' }} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_businesses}</div>
              <div className="text-gray-600">Businesses Scraped</div>
            </div>
            <div className="card text-center" style={{ borderColor: '#d1fae5' }}>
              <div 
                className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3"
                style={{ background: '#d1fae5' }}
              >
                <TrendingUp className="h-6 w-6" style={{ color: '#059669' }} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{Object.keys(stats.business_types || {}).length}</div>
              <div className="text-gray-600">Industry Types</div>
            </div>
            <div className="card text-center" style={{ borderColor: '#dcfce7' }}>
              <div 
                className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3"
                style={{ background: '#dcfce7' }}
              >
                <Zap className="h-6 w-6" style={{ color: '#16a34a' }} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.recent_businesses}</div>
              <div className="text-gray-600">Recent Additions</div>
            </div>
          </div>
        )}
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto mb-16">
        <SearchForm onSubmit={handleScrape} loading={loading} />
        
        {/* Quick Actions */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onViewBusinesses}
            className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-green-200 text-green-700 rounded-xl font-medium hover:bg-green-50 hover:border-green-300 transition-all duration-200 shadow-sm"
          >
            <Database className="h-5 w-5" />
            <span>
              {stats && stats.total_businesses > 0 
                ? `Browse ${stats.total_businesses} Scraped Businesses` 
                : ' View All Businesses'
              }
            </span>
          </button>
        </div>
      </div>

      {/* Recent Scrape Result */}
      {recentScrape && (
        <div className="max-w-4xl mx-auto mb-16 animate-scale-in">
          <div className="card" style={{ borderColor: '#dcfce7', background: '#f0fdf4' }}>
            <div className="flex items-start space-x-4">
              <div 
                className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
                style={{ background: '#dcfce7' }}
              >
                <Database className="h-6 w-6" style={{ color: '#16a34a' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Successfully Scraped: {recentScrape.company_name}
                </h3>
                <p className="text-gray-600 mb-4">{recentScrape.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {recentScrape.business_type && (
                    <span className="badge-green">{recentScrape.business_type}</span>
                  )}
                  {recentScrape.industry && (
                    <span className="badge-emerald">{recentScrape.industry}</span>
                  )}
                  {recentScrape.location && (
                    <span className="badge-green">{recentScrape.location}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onViewBusinesses}
                    className="btn-primary text-sm"
                  >
                    View All Businesses
                  </button>
                  <button
                    onClick={() => setRecentScrape(null)}
                    className="btn-secondary text-sm"
                  >
                    Continue Scraping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Powerful Features for Business Intelligence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card hover-lift" style={{ borderColor: '#dcfce7' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#dcfce7' }}
            >
              <Search className="h-6 w-6" style={{ color: '#16a34a' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Extraction</h3>
            <p className="text-gray-600">
              Automatically extract company information, business model, revenue estimates, 
              and key metrics from any business website.
            </p>
          </div>

          <div className="card hover-lift" style={{ borderColor: '#d1fae5' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#d1fae5' }}
            >
              <Database className="h-6 w-6" style={{ color: '#059669' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Organized Database</h3>
            <p className="text-gray-600">
              Store and organize all business data in a searchable database with 
              advanced filtering and sorting capabilities.
            </p>
          </div>

          <div className="card hover-lift" style={{ borderColor: '#dcfce7' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#dcfce7' }}
            >
              <Shield className="h-6 w-6" style={{ color: '#16a34a' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Reliable Data</h3>
            <p className="text-gray-600">
              Get accurate business insights including company size, industry classification, 
              and competitive positioning.
            </p>
          </div>

          <div className="card hover-lift" style={{ borderColor: '#fef3c7' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#fef3c7' }}
            >
              <TrendingUp className="h-6 w-6" style={{ color: '#d97706' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Market Analysis</h3>
            <p className="text-gray-600">
              Analyze business models, target markets, and competitive advantages 
              to understand market positioning.
            </p>
          </div>

          <div className="card hover-lift" style={{ borderColor: '#dcfce7' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#dcfce7' }}
            >
              <Zap className="h-6 w-6" style={{ color: '#16a34a' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Updates</h3>
            <p className="text-gray-600">
              Get the latest business information with real-time scraping and 
              automatic data refresh capabilities.
            </p>
          </div>

          <div className="card hover-lift" style={{ borderColor: '#d1fae5' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#d1fae5' }}
            >
              <span 
                className="text-2xl font-bold"
                style={{ color: '#059669' }}
              >
                H
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Reach</h3>
            <p className="text-gray-600">
              Scrape businesses from around the world and build a comprehensive 
              international business intelligence database.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div 
          className="card max-w-2xl mx-auto"
          style={{ 
            background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)',
            borderColor: '#dcfce7'
          }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Build Your Business Database?
          </h3>
          <p className="text-gray-600 mb-6">
            Start by entering any business website URL above, or explore existing businesses 
            in our database to see what insights you can discover.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {stats && stats.total_businesses > 0 ? (
              <button
                onClick={onViewBusinesses}
                className="btn-primary"
              >
                Explore {stats.total_businesses} Businesses
              </button>
            ) : (
              <button
                onClick={onViewBusinesses}
                className="btn-primary"
              >
                View Business Database
              </button>
            )}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn-secondary"
            >
              Start Scraping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage