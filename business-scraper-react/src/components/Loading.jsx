import React from 'react';
import { Loader } from 'lucide-react';

const Loading = ({ message = "Loading...", size = "default" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8", 
    large: "h-12 w-12"
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="flex flex-col items-center space-y-3">
        <Loader className={`${sizeClasses[size]} animate-spin text-green-600`} />
        <span className="text-gray-600 text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

// Alternative spinner versions
export const LoadingSpinner = ({ className = "h-8 w-8" }) => (
  <div className={`animate-spin rounded-full border-b-2 border-green-600 ${className}`}></div>
);

export const LoadingDots = () => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
  </div>
);

export const LoadingInline = ({ text = "Loading businesses..." }) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner className="h-5 w-5" />
    <span className="text-gray-600">{text}</span>
  </div>
);

export default Loading;