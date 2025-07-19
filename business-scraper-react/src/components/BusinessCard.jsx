import React from 'react';
import { Eye, ExternalLink, Trash2, MapPin, Calendar } from 'lucide-react';

const BusinessCard = ({ business, onView, onDelete }) => {
  const companyName = business.company_name || 'Unknown Company';
  const businessType = business.business_type || 'Unknown';
  const industry = business.industry || 'Unknown';
  const location = business.location || 'Unknown';
  const foundedYear = business.founded_year || 'Unknown';
  const description = business.description || 'No description available';
  const businessModel = business.business_model || 'Unknown';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {companyName}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {businessType}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {industry}
            </span>
            {businessModel !== 'Unknown' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                {businessModel}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 ml-4">
          <button
            onClick={() => onView(business)}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => window.open(business.url, '_blank')}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Visit Website"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(business.id, companyName)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {description.length > 120 ? `${description.substring(0, 120)}...` : description}
      </p>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          <span>{location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          <span>Founded {foundedYear}</span>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;