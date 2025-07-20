import { useState } from 'react'

function BusinessDetail({ business, onDelete, onBack }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${business.company_name}?`)) {
      setIsDeleting(true)
      try {
        const result = await onDelete(business.id)
        if (result.success) {
          onBack()
        }
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Unknown'
    }
  }

  // Helper function to check if value has meaningful content
  const hasContent = (value) => {
    if (!value) return false
    const meaninglessValues = [
      'unknown', 'not specified', 'not found', 'none', 'not disclosed', 
      'no description available', 'no content', 'content not extracted', 
      'no summary', 'business summary not available', 'not available',
      'services not specified', 'general market'
    ]
    return !meaninglessValues.includes(value.toLowerCase())
  }

  // Generate a comprehensive company summary
  const generateCompanySummary = () => {
    let summary = []
    
    // Basic info
    if (business.company_name) {
      summary.push(`${business.company_name} is`)
    }
    
    // Business type and industry
    if (hasContent(business.business_type) && hasContent(business.industry)) {
      summary.push(`a ${business.business_type.toLowerCase()} company operating in the ${business.industry.toLowerCase()} industry`)
    } else if (hasContent(business.business_type)) {
      summary.push(`a ${business.business_type.toLowerCase()} company`)
    } else if (hasContent(business.industry)) {
      summary.push(`a company in the ${business.industry.toLowerCase()} industry`)
    } else {
      summary.push(`a business`)
    }
    
    // Location and founding
    if (hasContent(business.location) && hasContent(business.founded_year)) {
      summary.push(`based in ${business.location}, founded in ${business.founded_year}`)
    } else if (hasContent(business.location)) {
      summary.push(`based in ${business.location}`)
    } else if (hasContent(business.founded_year)) {
      summary.push(`founded in ${business.founded_year}`)
    }
    
    // Main description
    if (hasContent(business.description)) {
      summary.push(`. ${business.description}`)
    }
    
    // Services
    if (hasContent(business.key_services)) {
      summary.push(` The company specializes in ${business.key_services.toLowerCase()}.`)
    }
    
    // Target market
    if (hasContent(business.target_market)) {
      summary.push(` They primarily serve ${business.target_market.toLowerCase()}.`)
    }
    
    // Company size and revenue
    let sizeInfo = []
    if (hasContent(business.company_size)) {
      sizeInfo.push(business.company_size.toLowerCase())
    }
    if (hasContent(business.estimated_revenue)) {
      sizeInfo.push(`estimated revenue of ${business.estimated_revenue}`)
    }
    if (hasContent(business.employee_count)) {
      sizeInfo.push(`${business.employee_count} employees`)
    }
    
    if (sizeInfo.length > 0) {
      summary.push(` The company is characterized as ${sizeInfo.join(', ')}.`)
    }
    
    return summary.join(' ')
  }

  if (!business) {
    return <div>No business data available</div>
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 border rounded-lg"
          >
            <span>← Back to Businesses</span>
          </button>

          <div className="flex items-center space-x-3">
            <a
              href={business.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              🌐 Visit Website
            </a>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : '🗑️ Delete'}
            </button>
          </div>
        </div>

        {/* Business Header Info */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {business.company_name}
          </h1>
          
          {/* Company Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {business.business_type && (
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {business.business_type}
              </span>
            )}
            {business.industry && (
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {business.industry}
              </span>
            )}
            {business.location && (
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                📍 {business.location}
              </span>
            )}
            {business.founded_year && business.founded_year !== 'Unknown' && (
              <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                📅 Founded {business.founded_year}
              </span>
            )}
            {hasContent(business.business_model) && (
              <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                💼 {business.business_model}
              </span>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            {business.company_size && business.company_size !== 'Unknown' && (
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{business.company_size}</div>
                <div className="text-sm text-gray-600">Company Size</div>
              </div>
            )}
            {business.estimated_revenue && business.estimated_revenue !== 'Not disclosed' && (
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{business.estimated_revenue}</div>
                <div className="text-sm text-gray-600">Est. Revenue</div>
              </div>
            )}
            {business.employee_count && business.employee_count !== 'Not specified' && (
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{business.employee_count}</div>
                <div className="text-sm text-gray-600">Employees</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{formatDate(business.scraped_date)}</div>
              <div className="text-sm text-gray-600">Date Added</div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Summary Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            📋 Company Overview
          </h2>
          <div className="text-lg text-gray-700 leading-relaxed">
            {generateCompanySummary()}
          </div>
          
          {/* Competitive Advantages */}
          {hasContent(business.competitive_advantages) && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">🏆 Competitive Advantages:</h3>
              <p className="text-gray-700">{business.competitive_advantages}</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Information Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🏢 Business Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Website</p>
              <a href={business.url} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:text-blue-800 break-all">{business.url}</a>
            </div>
            {hasContent(business.target_market) && (
              <div>
                <p className="text-sm font-medium text-gray-900">Target Market</p>
                <p className="text-gray-700">{business.target_market}</p>
              </div>
            )}
            {hasContent(business.market_focus) && (
              <div>
                <p className="text-sm font-medium text-gray-900">Market Focus</p>
                <p className="text-gray-700">{business.market_focus}</p>
              </div>
            )}
            {hasContent(business.business_maturity) && (
              <div>
                <p className="text-sm font-medium text-gray-900">Business Maturity</p>
                <p className="text-gray-700">{business.business_maturity}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📞 Contact Information
          </h2>
          <div className="space-y-4">
            {hasContent(business.contact_info) && (
              <div>
                <p className="text-sm font-medium text-gray-900">Contact Details</p>
                <p className="text-gray-700">{business.contact_info}</p>
              </div>
            )}
            {hasContent(business.social_media) && (
              <div>
                <p className="text-sm font-medium text-gray-900">Social Media</p>
                <p className="text-gray-700">{business.social_media}</p>
              </div>
            )}
          </div>
        </div>

        {/* Services & Products */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🛍️ Services & Products
          </h2>
          <div className="space-y-4">
            {hasContent(business.key_services) && (
              <div>
                <p className="text-sm font-medium text-gray-900">Key Services</p>
                <p className="text-gray-700">{business.key_services}</p>
              </div>
            )}
            {hasContent(business.product_categories) && (
              <div>
                <p className="text-sm font-medium text-gray-900">Product Categories</p>
                <p className="text-gray-700">{business.product_categories}</p>
              </div>
            )}
            {hasContent(business.technologies) && (
              <div>
                <p className="text-sm font-medium text-gray-900">Technologies Used</p>
                <p className="text-gray-700">{business.technologies}</p>
              </div>
            )}
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            👥 Company Details
          </h2>
          <div className="space-y-4">
            {hasContent(business.key_executives) && (
              <div>
                <p className="text-sm font-medium text-gray-900">Key Executives</p>
                <p className="text-gray-700">{business.key_executives}</p>
              </div>
            )}
            {hasContent(business.partnerships) && (
              <div>
                <p className="text-sm font-medium text-gray-900">Key Partnerships</p>
                <p className="text-gray-700">{business.partnerships}</p>
              </div>
            )}
            {hasContent(business.certifications) && (
              <div>
                <p className="text-sm font-medium text-gray-900">Certifications</p>
                <p className="text-gray-700">{business.certifications}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recognition & News */}
        {(hasContent(business.awards_recognition) || hasContent(business.recent_news) || hasContent(business.client_testimonials)) && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🏆 Recognition & Updates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hasContent(business.awards_recognition) && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Awards & Recognition</p>
                    <p className="text-gray-700 text-sm">{business.awards_recognition}</p>
                  </div>
                )}
                {hasContent(business.recent_news) && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Recent News</p>
                    <p className="text-gray-700 text-sm">{business.recent_news}</p>
                  </div>
                )}
                {hasContent(business.client_testimonials) && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Client Testimonials</p>
                    <p className="text-gray-700 text-sm">{business.client_testimonials}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Website Content Preview */}
      {hasContent(business.content) && (
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🌐 Website Content Preview
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {business.content.length > 1000 
                ? `${business.content.substring(0, 1000)}...` 
                : business.content
              }
            </p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-8 pt-6 border-t bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">📊 Scraping Information</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Date Scraped:</strong> {formatDate(business.scraped_date)}</p>
          <p><strong>Last Updated:</strong> {formatDate(business.last_updated)}</p>
          <p><strong>Business ID:</strong> {business.id}</p>
          <p><strong>Source URL:</strong> <a href={business.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{business.url}</a></p>
        </div>
      </div>

      {/* Loading overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <span className="text-gray-700">Deleting business...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessDetail