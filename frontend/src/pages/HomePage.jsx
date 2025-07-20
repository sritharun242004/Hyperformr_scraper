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
            style={{ background: 'linear-gradient(to right,#84cc16, #65a30d)' }}
          >
            <span className="text-white font-bold text-3xl">H</span>    
          </div>
          <h1 
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ 
                background: 'linear-gradient(to right, #84cc16, #65a30d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
            }}
            >
            Hyperformr.scraper
            </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform any business website into comprehensive insights with Hyperformr.scraper. 
            Extract company data, analyze market position, and build your business intelligence database in seconds.
          </p>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            <div className="card text-center" style={{ borderColor: '#ecfccb' }}>
              <div 
                className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3"
                style={{ background: '#ecfccb' }}
              >
                <Database className="h-6 w-6" style={{ color: '#65a30d' }} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_businesses}</div>
              <div className="text-gray-600">Intelligence Reports</div>
            </div>
            <div className="card text-center" style={{ borderColor: '#d9f99d' }}>
              <div 
                className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3"
                style={{ background: '#d9f99d' }}
              >
                <TrendingUp className="h-6 w-6" style={{ color: '#84cc16' }} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{Object.keys(stats.business_types || {}).length}</div>
              <div className="text-gray-600">Market Sectors</div>
            </div>
            <div className="card text-center" style={{ borderColor: '#ecfccb' }}>
              <div 
                className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3"
                style={{ background: '#ecfccb' }}
              >
                <Zap className="h-6 w-6" style={{ color: '#65a30d' }} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.recent_businesses}</div>
              <div className="text-gray-600">Recent Analysis</div>
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
                ? `Access Intelligence Portal (${stats.total_businesses} Companies)` 
                : 'Launch Intelligence Dashboard'
              }
            </span>
          </button>
        </div>
      </div>

      {/* Business Intelligence Preview */}
      {recentScrape && (
        <div className="max-w-4xl mx-auto mb-16 animate-scale-in">
          <div className="card" style={{ borderColor: '#ecfccb', background: '#f0fdf4' }}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Business Intelligence Report
              </h3>
              <p className="text-gray-600">Successfully extracted data from {recentScrape.url}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Company Overview</h4>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {recentScrape.company_name || 'Not available'}</p>
                  <p><strong>Industry:</strong> {recentScrape.industry || 'Not specified'}</p>
                  <p><strong>Type:</strong> {recentScrape.business_type || 'Not specified'}</p>
                  <p><strong>Location:</strong> {recentScrape.location || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Business Details</h4>
                <div className="space-y-2">
                  <p><strong>Founded:</strong> {recentScrape.founded_year || 'Not specified'}</p>
                  <p><strong>Size:</strong> {recentScrape.company_size || 'Not specified'}</p>
                  <p><strong>Revenue:</strong> {recentScrape.estimated_revenue || 'Not disclosed'}</p>
                  <p><strong>Model:</strong> {recentScrape.business_model || 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700">{recentScrape.description || 'No description available'}</p>
            </div>
            
            <div className="mt-6 flex justify-center gap-4">
              <button onClick={onViewBusinesses} className="btn-primary">
                Launch Intelligence Dashboard
              </button>
              <button
                onClick={() => setRecentScrape(null)}
                className="btn-secondary"
              >
                Analyze Another Company
              </button>
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
          <div className="card hover-lift" style={{ borderColor: '#ecfccb' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#ecfccb' }}
            >
              <Search className="h-6 w-6" style={{ color: '#65a30d' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Analytics</h3>
            <p className="text-gray-600">
              Extract comprehensive company intelligence, financial insights, competitive positioning, 
              and strategic market data from any business website.
            </p>
          </div>

          <div className="card hover-lift" style={{ borderColor: '#d9f99d' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#d9f99d' }}
            >
              <Database className="h-6 w-6" style={{ color: '#84cc16' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Intelligence Repository</h3>
            <p className="text-gray-600">
              Centralize and organize all business intelligence in a powerful database with 
              advanced search, filtering, and analytical capabilities.
            </p>
          </div>

          <div className="card hover-lift" style={{ borderColor: '#ecfccb' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#ecfccb' }}
            >
              <Shield className="h-6 w-6" style={{ color: '#65a30d' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Enterprise-Grade Data</h3>
            <p className="text-gray-600">
              Access verified business insights including corporate structure, market classification, 
              and competitive intelligence for strategic decision-making.
            </p>
          </div>

          <div className="card hover-lift" style={{ borderColor: '#fef3c7' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#fef3c7' }}
            >
              <TrendingUp className="h-6 w-6" style={{ color: '#d97706' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Market Intelligence</h3>
            <p className="text-gray-600">
              Analyze business models, target markets, and competitive positioning 
              to understand market dynamics and opportunities.
            </p>
          </div>

          <div className="card hover-lift" style={{ borderColor: '#ecfccb' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#ecfccb' }}
            >
              <Zap className="h-6 w-6" style={{ color: '#65a30d' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Intelligence</h3>
            <p className="text-gray-600">
              Access up-to-date business information with real-time data extraction and 
              automated intelligence refresh capabilities.
            </p>
          </div>

          <div className="card hover-lift" style={{ borderColor: '#d9f99d' }}>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#d9f99d' }}
            >
              <span 
                className="text-2xl font-bold"
                style={{ color: '#84cc16' }}
              >
                H
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Intelligence Network</h3>
            <p className="text-gray-600">
              Build comprehensive international business intelligence across markets and 
              create a global competitive intelligence database.
            </p>
          </div>
        </div>
      </div>

      
    </div>
  )
}

export default HomePage