import { useState } from 'react'
import { 
  ArrowLeft, 
  ExternalLink, 
  Trash2, 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  Globe,
  Mail,
  Briefcase,
  Star
} from 'lucide-react'

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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Businesses</span>
          </button>

          <div className="flex items-center space-x-3">
            <a
              href={business.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Visit Website</span>
            </a>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-danger flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>

        {/* Business Header Info */}
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {business.company_name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {business.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {business.business_type && (
              <span className="badge badge-blue">
                {business.business_type}
              </span>
            )}
            {business.industry && (
              <span className="badge badge-gray">
                {business.industry}
              </span>
            )}
            {business.location && (
              <span className="badge badge-green">
                <MapPin className="h-3 w-3 mr-1" />
                {business.location}
              </span>
            )}
            {business.founded_year && business.founded_year !== 'Unknown' && (
              <span className="badge badge-blue">
                <Calendar className="h-3 w-3 mr-1" />
                Founded {business.founded_year}
              </span>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t">
            {business.company_size && business.company_size !== 'Unknown' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{business.company_size}</div>
                <div className="text-sm text-gray-600">Company Size</div>
              </div>
            )}
            {business.estimated_revenue && business.estimated_revenue !== 'Not disclosed' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{business.estimated_revenue}</div>
                <div className="text-sm text-gray-600">Est. Revenue</div>
              </div>
            )}
            {business.employee_count && business.employee_count !== 'Not specified' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{business.employee_count}</div>
                <div className="text-sm text-gray-600">Employees</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatDate(business.scraped_date)}</div>
              <div className="text-sm text-gray-600">Date Added</div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Business Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Website</p>
              <p className="text-gray-700">{business.url}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Business Model</p>
              <p className="text-gray-700">{business.business_model || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Target Market</p>
              <p className="text-gray-700">{business.target_market || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Contact Info</p>
              <p className="text-gray-700">{business.contact_info || 'Not found'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Social Media</p>
              <p className="text-gray-700">{business.social_media || 'Not found'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Services & Products
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Key Services</p>
              <p className="text-gray-700">{business.key_services || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Technologies</p>
              <p className="text-gray-700">{business.technologies || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Additional Info
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Key Executives</p>
              <p className="text-gray-700">{business.key_executives || 'Not found'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Partnerships</p>
              <p className="text-gray-700">{business.partnerships || 'None mentioned'}</p>
            </div>
          </div>
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