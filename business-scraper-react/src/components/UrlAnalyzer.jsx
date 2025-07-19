
import React, { useState } from 'react';
import { Plus, Loader, Globe, CheckCircle, AlertCircle } from 'lucide-react';

const UrlAnalyzer = ({ onAnalyze, onStatusMessage }) => {
  const [urlInput, setUrlInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Validate URL format
  const isValidUrl = (url) => {
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return urlPattern.test(url);
    } catch {
      return false;
    }
  };

  // Format URL (add https if missing)
  const formatUrl = (url) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return '';
    
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  // Handle URL analysis
  const handleAnalyze = async () => {
    const formattedUrl = formatUrl(urlInput);
    
    if (!formattedUrl) {
      onStatusMessage('Please enter a URL', 'error');
      return;
    }

    if (!isValidUrl(formattedUrl)) {
      onStatusMessage('Please enter a valid URL', 'error');
      return;
    }

    setAnalyzing(true);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl })
      });

      const result = await response.json();
      
      if (result.success) {
        onStatusMessage('Website analyzed successfully!', 'success');
        setUrlInput('');
        onAnalyze(); // Callback to refresh business list
      } else {
        onStatusMessage(result.error || 'Failed to analyze website', 'error');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      onStatusMessage('Error analyzing website. Please try again.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <section className="bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                <Globe className="h-8 w-8 text-green-600" />
                </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Hyperformr.scraper
            </h2>
            <p className="text-lg text-gray-600 mb-4">
                Business Intelligence Scraper
            </p>
            <p className="text-base text-gray-500">
                Enter any business website URL to extract comprehensive company information
            </p>
        </div>

        {/* URL Input Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* URL Input */}
            <div className="flex-1">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter business website URL (e.g., https://google.com)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-sm"
                disabled={analyzing}
              />
              
              {/* URL Validation Indicator */}
              <div className="mt-2 flex items-center text-xs">
                {urlInput && (
                  <>
                    {isValidUrl(formatUrl(urlInput)) ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span>Valid URL format</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>Please enter a valid URL</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !urlInput.trim() || !isValidUrl(formatUrl(urlInput))}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors min-w-fit"
            >
              {analyzing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Analyze URL</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Progress */}
          {analyzing && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <Loader className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Analyzing website...
                  </p>
                  <p className="text-xs text-blue-700">
                    This may take 10-30 seconds depending on the website complexity
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              💡 <strong>Tip:</strong> Works best with business websites that have clear company information
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UrlAnalyzer;