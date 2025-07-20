import { useState } from 'react'
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Trash2, 
  Eye,
  Users,
  DollarSign,
  Globe,
  Tag
} from 'lucide-react'

function BusinessCard({ business, onView, onDelete, viewMode = 'grid' }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation() // Prevent card click
    setIsDeleting(true)
    try {
      await onDelete(business.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCardClick = () => {
    onView(business)
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Unknown'
    }
  }

  const getBusinessTypeColor = (type) => {
    const colors = {
      'Technology': 'badge-blue',
      'SaaS/Software': 'badge-purple',
      'E-commerce': 'badge-green',
      'Consulting': 'badge-yellow',
      'Healthcare': 'badge-red',
      'Education': 'badge-indigo',
      'Finance': 'badge-emerald',
      'Manufacturing': 'badge-orange',
      'Real Estate': 'badge-cyan',
      'Marketing': 'badge-pink'
    }
    return colors[type] || 'badge-gray'
  }

  const getIndustryIcon = (industry) => {
    const icons = {
      'Technology': '💻',
      'Healthcare': '🏥',
      'Finance': '💰',
      'Education': '🎓',
      'Retail': '🛍️',
      'Manufacturing': '🏭',
      'Real Estate': '🏢',
      'Energy': '⚡',
      'Media': '📺',
      'Transportation': '🚚'
    }
    return icons[industry] || '🏢'
  }

  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleCardClick}
        className="card-hover p-6 animate-slide-in"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                  {business.company_name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {business.description}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={handleCardClick}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <a
                  href={business.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Visit Website"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete Business"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>{business.business_type || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Tag className="h-4 w-4" />
                <span>{business.industry || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{business.location || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Added {formatDate(business.scraped_date)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {business.business_type && (
                <span className={`badge ${getBusinessTypeColor(business.business_type)}`}>
                  {business.business_type}
                </span>
              )}
              {business.industry && business.industry !== business.business_type && (
                <span className="badge badge-gray">
                  {getIndustryIcon(business.industry)} {business.industry}
                </span>
              )}
              {business.company_size && (
                <span className="badge badge-green">
                  <Users className="h-3 w-3 mr-1" />
                  {business.company_size}
                </span>
              )}
              {business.estimated_revenue && business.estimated_revenue !== 'Not disclosed' && (
                <span className="badge badge-yellow">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {business.estimated_revenue}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div 
      onClick={handleCardClick}
      className="card-hover p-6 animate-scale-in relative group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{getIndustryIcon(business.industry)}</span>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-2">
              {business.company_name}
            </h3>
          </div>
          
          {business.business_type && (
            <span className={`badge ${getBusinessTypeColor(business.business_type)} text-xs`}>
              {business.business_type}
            </span>
          )}
        </div>

        {/* Action buttons - show on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <a
            href={business.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Visit Website"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {business.description || 'No description available'}
      </p>

      {/* Key Info */}
      <div className="space-y-2 mb-4">
        {business.location && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{business.location}</span>
          </div>
        )}
        
        {business.industry && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Tag className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{business.industry}</span>
          </div>
        )}
        
        {business.founded_year && business.founded_year !== 'Unknown' && business.founded_year !== 'Not specified' && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Founded {business.founded_year}</span>
          </div>
        )}
      </div>

      {/* Additional badges */}
      <div className="flex flex-wrap gap-1 mb-4">
        {business.company_size && business.company_size !== 'Unknown' && (
          <span className="badge badge-blue text-xs">
            <Users className="h-3 w-3 mr-1" />
            {business.company_size.replace(' employees', '')}
          </span>
        )}
        
        {business.estimated_revenue && business.estimated_revenue !== 'Not disclosed' && business.estimated_revenue !== 'Revenue not disclosed' && (
          <span className="badge badge-green text-xs">
            <DollarSign className="h-3 w-3 mr-1" />
            {business.estimated_revenue}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
        <div className="flex items-center space-x-1">
          <Globe className="h-3 w-3" />
          <span>Scraped {formatDate(business.scraped_date)}</span>
        </div>
        
        <button
          onClick={handleCardClick}
          className="text-green-600 hover:text-green-800 font-medium"
        >
          View Details →
        </button>
      </div>
      
      {/* Loading overlay for delete */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="flex items-center space-x-2 text-red-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            <span className="text-sm">Deleting...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessCard