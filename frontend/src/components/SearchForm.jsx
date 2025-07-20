import { useState } from 'react'
import { Search, Globe, AlertCircle, CheckCircle } from 'lucide-react'

function SearchForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    // Clear previous messages
    setError('')
    setSuccess('')

    try {
      const result = await onSubmit(url.trim())
      
      if (result.success) {
        setSuccess(`Successfully scraped ${result.data.company_name}!`)
        setUrl('')
      } else {
        setError(result.error || 'Failed to scrape website')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  const handleInputChange = (e) => {
    setUrl(e.target.value)
    // Clear error when user starts typing
    if (error) setError('')
    if (success) setSuccess('')
  }

  const exampleUrls = [
    'google.com',
    'microsoft.com',
    'apple.com',
    'amazon.com',
    'tesla.com'
  ]

  const handleExampleClick = (exampleUrl) => {
    setUrl(exampleUrl)
    setError('')
    setSuccess('')
  }

  return (
    <div className="w-full">
      {/* Main Search Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={url}
            onChange={handleInputChange}
            placeholder="Enter business website URL"
            className="input-primary pl-12 pr-32 py-4 text-lg"
            disabled={loading}
          />
          
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="absolute right-2 top-2 bottom-2 px-6 btn-primary rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            style={{
              background: loading || !url.trim() ? '#9ca3af' : 'linear-gradient(to right, #84cc16, #65a30d)',
              color: 'white',
              border: 'none'
            }}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Extract Intelligence</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 animate-scale-in">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-red-800 font-medium">Analysis Failed</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3 animate-scale-in">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-green-800 font-medium">Intelligence Extracted!</h4>
            <p className="text-green-700 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Example URLs */}
      <div className="text-center">
        <p className="text-gray-600 mb-3">Try these example companies:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {exampleUrls.map((exampleUrl) => (
            <button
              key={exampleUrl}
              onClick={() => handleExampleClick(exampleUrl)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-green-100 hover:text-green-700 transition-colors"
              disabled={loading}
            >
              {exampleUrl}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchForm