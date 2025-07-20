import { useState } from 'react'
import { 
  ArrowLeft, 
  ExternalLink, 
  Trash2, 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Globe,
  Mail,
  Phone,
  Award,
  Target,
  Briefcase,
  TrendingUp,
  Star,
  Shield,
  Users2,
  MessageSquare,
  Copy,
  CheckCircle
} from 'lucide-react'

function BusinessDetail({ business, onDelete, onBack }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedField, setCopiedField] = useState('')

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${business.company_name}?`)) {
      setIsDeleting(true)
      try {
        const result = await onDelete(business.id)
        if (result.success) {
          onBack() // Go back to list after successful deletion
        }
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
      'Education': 'badge-indigo'
    }
    return colors[type] || 'badge-gray'
  }

  const InfoField = ({ icon: Icon, label, value, copyable = false }) => {
    // More permissive filtering - only exclude truly empty values
    if (!value || value === '' || value === 'Unknown' || value === 'Not specified' || value === 'Not found' || value === 'None' || value === 'Not disclosed' || value === 'No description available' || value === 'No content' || value === 'Content not extracted' || value === 'No summary' || value === 'Business summary not available') {
      return null
    }

    return (
      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
        <Icon className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-gray-700 break-words">{value}</p>
        </div>
        {copyable && (
          <button
            onClick={() => copyToClipboard(value, label)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Copy to clipboard"
          >
            {copiedField === label ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    )
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
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {business.company_name}
              </h1>
              <p className="text-lg text-gray-600 mb-4 max-w-3xl">
                {business.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {business.business_type && (
                  <span className={`badge ${getBusinessTypeColor(business.business_type)}`}>
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
            </div>
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
              <div className="text-2xl font-bold text-gray-900">{formatDate(business.scraped_date).split(',')[0]}</div>
              <div className="text-sm text-gray-600">Date Added</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business Information */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Business Information
            </h2>
            <div className="space-y-3">
              <InfoField icon={Globe} label="Website" value={business.url} copyable />
              <InfoField icon={Briefcase} label="Business Model" value={business.business_model} />
              <InfoField icon={Target} label="Target Market" value={business.target_market} />
              <InfoField icon={TrendingUp} label="Market Focus" value={business.market_focus} />
              <InfoField icon={Shield} label="Business Maturity" value={business.business_maturity} />
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <InfoField icon={Mail} label="Contact Info" value={business.contact_info} copyable />
              <InfoField icon={Globe} label="Social Media" value={business.social_media} copyable />
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Services & Products
            </h2>
            <div className="space-y-3">
              <InfoField icon={Briefcase} label="Key Services" value={business.key_services} />
              <InfoField icon={Star} label="Product Categories" value={business.product_categories} />
              <InfoField icon={TrendingUp} label="Competitive Advantages" value={business.competitive_advantages} />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Company Details
            </h2>
            <div className="space-y-3">
              <InfoField icon={Users} label="Key Executives" value={business.key_executives} />
              <InfoField icon={Globe} label="Technologies" value={business.technologies} />
              <InfoField icon={Shield} label="Certifications" value={business.certifications} />
              <InfoField icon={Handshake} label="Partnerships" value={business.partnerships} />
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Recognition & News
            </h2>
            <div className="space-y-3">
              <InfoField icon={Award} label="Awards & Recognition" value={business.awards_recognition} />
              <InfoField icon={TrendingUp} label="Recent News" value={business.recent_news} />
              <InfoField icon={MessageSquare} label="Client Testimonials" value={business.client_testimonials} />
            </div>
          </div>

          {business.summary && business.summary !== 'No summary' && business.summary !== 'Business summary not available' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {business.summary}
              </p>
            </div>
          )}

          {business.content && business.content !== 'No content' && business.content !== 'Content not extracted' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Website Content Preview
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

          {/* All Available Data Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              All Available Data
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(business).map(([key, value]) => {
                // Skip internal fields and already displayed fields
                if (['id', 'scraped_date', 'last_updated'].includes(key)) return null
                
                // Format the key name for display
                const formatKey = (key) => {
                  return key
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())
                }

                const displayValue = value || 'Not available'
                
                return (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {formatKey(key)}
                    </div>
                    <div className="text-gray-700 text-sm break-words">
                      {typeof displayValue === 'string' && displayValue.length > 100 
                        ? `${displayValue.substring(0, 100)}...`
                        : displayValue
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-8 pt-6 border-t">
        <div className="text-sm text-gray-500 space-y-1">
          <p><strong>Scraped:</strong> {formatDate(business.scraped_date)}</p>
          <p><strong>Last Updated:</strong> {formatDate(business.last_updated)}</p>
          <p><strong>Business ID:</strong> {business.id}</p>
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