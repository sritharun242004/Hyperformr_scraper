import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const StatusMessage = ({ message, type, onClose }) => {
  // Auto close after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  // Don't show if no message
  if (!message) {
    return null;
  }

  // Get styles based on type
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          closeButton: 'text-green-600 hover:text-green-800'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          closeButton: 'text-red-600 hover:text-red-800'
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          closeButton: 'text-blue-600 hover:text-blue-800'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className={`border rounded-lg p-4 shadow-lg ${styles.container}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={onClose}
              className={`p-1 rounded-md ${styles.closeButton}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusMessage;