from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import logging
from database import get_db
from scraper import BusinessScraper

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Enable CORS for all domains and all routes
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

# Initialize database and scraper
db = get_db()
scraper = BusinessScraper()

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'message': 'Business Scraper API is running'
    })

# Get businesses with search, sort, and pagination
@app.route('/api/businesses', methods=['GET'])
def get_businesses():
    """Get paginated list of businesses with search and filters"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 12))
        search = request.args.get('search', '').strip()
        sort_by = request.args.get('sort_by', 'scraped_date')
        
        # Get filters
        filters = {}
        if request.args.get('business_type'):
            filters['business_type'] = request.args.get('business_type')
        if request.args.get('industry'):
            filters['industry'] = request.args.get('industry')
        if request.args.get('company_size'):
            filters['company_size'] = request.args.get('company_size')
        if request.args.get('location'):
            filters['location'] = request.args.get('location')
        
        logger.info(f"📊 API Request: page={page}, search='{search}', sort_by={sort_by}")
        
        # Get businesses from database
        result = db.get_businesses(
            search=search,
            sort_by=sort_by,
            page=page,
            per_page=per_page,
            filters=filters if filters else None
        )
        
        if result['success']:
            logger.info(f"✅ Retrieved {len(result['data'])} businesses")
            return jsonify(result)
        else:
            logger.error(f"❌ Database error: {result['error']}")
            return jsonify({'success': False, 'error': result['error']}), 500
            
    except Exception as e:
        logger.error(f"❌ API error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Get single business by ID
@app.route('/api/businesses/<int:business_id>', methods=['GET'])
def get_business(business_id):
    """Get single business by ID"""
    try:
        result = db.get_business_by_id(business_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify({'success': False, 'error': result['error']}), 404
            
    except Exception as e:
        logger.error(f"❌ Get business error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Delete business by ID
@app.route('/api/businesses/<int:business_id>', methods=['DELETE'])
def delete_business(business_id):
    """Delete business by ID"""
    try:
        result = db.delete_business(business_id)
        
        if result['success']:
            logger.info(f"🗑️ Deleted business ID: {business_id}")
            return jsonify({'success': True, 'message': 'Business deleted successfully'})
        else:
            return jsonify({'success': False, 'error': result['error']}), 404
            
    except Exception as e:
        logger.error(f"❌ Delete business error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Scrape a business website
@app.route('/api/scrape', methods=['POST'])
def scrape_business():
    """Scrape a business website"""
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'success': False, 'error': 'URL is required'}), 400
        
        url = data['url'].strip()
        if not url:
            return jsonify({'success': False, 'error': 'URL cannot be empty'}), 400
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
        
        logger.info(f"🔍 Scraping URL: {url}")
        
        # Scrape the business
        result = scraper.scrape_business(url)
        
        if result['success']:
            logger.info(f"✅ Successfully scraped: {result['data']['company_name']}")
            return jsonify(result)
        else:
            logger.error(f"❌ Scraping failed: {result['error']}")
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Scrape API error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Get search suggestions
@app.route('/api/search-suggestions', methods=['GET'])
def get_search_suggestions():
    """Get search suggestions for autocomplete"""
    try:
        search_term = request.args.get('q', '').strip()
        
        if len(search_term) < 2:
            return jsonify({'success': True, 'suggestions': []})
        
        result = db.search_suggestions(search_term, limit=5)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Search suggestions error: {e}")
        return jsonify({'success': False, 'suggestions': []}), 500

# Get application statistics
@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get application statistics"""
    try:
        result = db.get_stats()
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Stats error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'success': False, 'error': 'API endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"❌ Internal server error: {error}")
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({'success': False, 'error': 'Method not allowed'}), 405

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    print("🚀 Starting Business Scraper API...")
    print("🌐 API: http://localhost:5003")
    print("📋 Health: http://localhost:5003/api/health")
    print("🔗 Endpoints: /api/businesses, /api/scrape, /api/stats")
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5003,
        debug=True,
        threaded=True
    )