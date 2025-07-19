import React from 'react';
import { X, ExternalLink, MapPin, Calendar, Building, Users, DollarSign, Target } from 'lucide-react';

const BusinessModal = ({ isOpen, onClose, business }) => {
  // Don't render if modal is not open or no business data
  if (!isOpen || !business) {
    return null;
  }

  // Handle background click to close modal
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={handleBackgroundClick}
          aria-hidden="true"
        ></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {business.company_name || 'Unknown Company'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {business.business_type || 'Unknown'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {business.industry || 'Unknown'}
                  </span>
                  {business.business_model && business.business_model !== 'Unknown' && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                      {business.business_model}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg ml-4"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 max-h-96 overflow-y-auto">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <MapPin className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Location</p>
                <p className="text-sm font-medium text-gray-900">{business.location || 'Unknown'}</p>
              </div>
              <div className="text-center">
                <Calendar className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Founded</p>
                <p className="text-sm font-medium text-gray-900">{business.founded_year || 'Unknown'}</p>
              </div>
              <div className="text-center">
                <Users className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Size</p>
                <p className="text-sm font-medium text-gray-900">{business.company_size || 'Unknown'}</p>
              </div>
              <div className="text-center">
                <DollarSign className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Revenue</p>
                <p className="text-sm font-medium text-gray-900">{business.estimated_revenue || 'Not disclosed'}</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-green-600" />
                    Company Details
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Business Type:</span>
                      <span className="text-gray-900 text-right">{business.business_type || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Industry:</span>
                      <span className="text-gray-900 text-right">{business.industry || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Business Model:</span>
                      <span className="text-gray-900 text-right">{business.business_model || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Target Market:</span>
                      <span className="text-gray-900 text-right">{business.target_market || 'General Market'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-medium text-gray-600">Market Focus:</span>
                      <span className="text-gray-900 text-right">{business.market_focus || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Business Intelligence */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Business Intelligence
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Employee Count:</span>
                      <span className="text-gray-900 text-right">{business.employee_count || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Key Services:</span>
                      <span className="text-gray-900 text-right">{business.key_services || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Technologies:</span>
                      <span className="text-gray-900 text-right">{business.technologies || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Business Maturity:</span>
                      <span className="text-gray-900 text-right">{business.business_maturity || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-medium text-gray-600">Certifications:</span>
                      <span className="text-gray-900 text-right">{business.certifications || 'None mentioned'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {business.description || 'No description available'}
              </p>
            </div>

            {/* Additional Information */}
            {business.competitive_advantages && business.competitive_advantages !== 'Not specified' && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Competitive Advantages</h4>
                <p className="text-sm text-gray-600">{business.competitive_advantages}</p>
              </div>
            )}

            {business.key_executives && business.key_executives !== 'Leadership info not found' && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Key Leadership</h4>
                <p className="text-sm text-gray-600">{business.key_executives}</p>
              </div>
            )}

            {business.awards_recognition && business.awards_recognition !== 'No awards mentioned' && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Awards & Recognition</h4>
                <p className="text-sm text-gray-600">{business.awards_recognition}</p>
              </div>
            )}

            {business.contact_info && business.contact_info !== 'Contact info not found' && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                <p className="text-sm text-gray-600">{business.contact_info}</p>
              </div>
            )}

            {business.social_media && business.social_media !== 'No social media found' && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Social Media</h4>
                <p className="text-sm text-gray-600">{business.social_media}</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:items-center">
            <button
              onClick={() => window.open(business.url, '_blank')}
              className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessModal;