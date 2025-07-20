import React, { useState } from 'react';
import { Globe, Plus, Loader } from 'lucide-react';

const UrlAnalyzer = ({ onAnalyze, onStatusMessage }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      onStatusMessage('Please enter a URL', 'error');
      return;
    }

    setIsAnalyzing(true);
    onStatusMessage('Analyzing website...', 'info');

    try {
      console.log('🔍 Analyzing:', url);
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Success:', result.data.company_name);
        onStatusMessage(`Successfully analyzed ${result.data.company_name}`, 'success');
        setUrl('');
        setShowForm(false);
        onAnalyze();
      } else {
        console.error('❌ Failed:', result.error);
        onStatusMessage(`Analysis failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      onStatusMessage(`Error: ${error.message}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!showForm ? (
          // Show button to add URL
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Analyze New Website
            </button>
          </div>
        ) : (
          // Show form
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <Globe className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold mb-2">Analyze Business Website</h2>
              <p className="text-gray-600">Enter a business website URL to extract company information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  disabled={isAnalyzing}
                  required
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !url.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isAnalyzing}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlAnalyzer;