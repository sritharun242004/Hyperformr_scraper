import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const StatusMessage = ({ message, type, onClose, autoClose = true, duration = 5000 }) => {
  // Auto close after duration
  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, autoClose, duration, onClose]);

  // Don't render if no message
  if (!message) return null;

  // Get styles based on message type
  const getMessageStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          iconBg: 'bg-green-100'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          iconBg: 'bg-red-100'
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: <Info className="h-5 w-5 text-blue-600" />,
          iconBg: 'bg-blue-100'
        };
    }
  };

  const styles = getMessageStyles();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-fadeIn">
      <div className={`${styles.container} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          {/* Icon */}
          <div className={`${styles.iconBg} rounded-full p-1 mr-3 flex-shrink-0`}>
            {styles.icon}
          </div>
          
          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {message}
            </p>
            
            {/* Progress bar for auto-close */}
            {autoClose && (
              <div className="mt-2 w-full bg-white bg-opacity-50 rounded-full h-1">
                <div 
                  className="h-1 rounded-full bg-current opacity-60"
                  style={{
                    animation: `shrink ${duration}ms linear forwards`
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="ml-3 text-current opacity-60 hover:opacity-80 transition-opacity flex-shrink-0"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Inline CSS for animation */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default StatusMessage;