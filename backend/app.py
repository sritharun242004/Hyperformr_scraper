from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from database import get_db
from scraper import BusinessScraper
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

# Initialize database and scraper
db = get_db()
scraper = BusinessScraper()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'message': 'Hyperformr Scraper API is running',
        'version': '1.0.0'
    })

@app.route('/api/businesses', methods=['GET'])
def get_businesses():
    """Get businesses with search, sort and pagination"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 12))
        search = request.args.get('search', '').strip()
        sort_by = request.args.get('sort_by', 'scraped_date')
        
        logger.info(f"🔍 API Request: page={page}, search='{search}', sort_by={sort_by}")
        
        # Get businesses from database
        result = db.get_businesses(
            search=search,
            sort_by=sort_by,
            page=page,
            per_page=per_page
        )
        
        if result['success']:
            logger.info(f"✅ Returning {len(result['data'])} businesses")
            return jsonify(result)
        else:
            logger.error(f"❌ Database error: {result['error']}")
            return jsonify({'success': False, 'error': result['error']}), 500
            
    except Exception as e:
        logger.error(f"❌ API error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

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

@app.route('/api/businesses/<int:business_id>', methods=['DELETE'])
def delete_business(business_id):
    """Delete a business"""
    try:
        result = db.delete_business(business_id)
        
        if result['success']:
            logger.info(f"🗑️ Deleted business ID: {business_id}")
            return jsonify({'success': True, 'message': 'Business deleted successfully'})
        else:
            return jsonify({'success': False, 'error': result['error']}), 404
            
    except Exception as e:
        logger.error(f"❌ Delete error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

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
        
        # Add https if missing
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
        
        logger.info(f"🔍 Scraping URL: {url}")
        
        # Check if URL already exists
        existing = db.check_url_exists(url)
        if existing['success'] and existing['exists']:
            return jsonify({
                'success': False, 
                'error': 'This business URL has already been scraped',
                'existing_business': existing['business']
            }), 400
        
        # Scrape the business
        result = scraper.scrape_business(url)
        
        if result['success']:
            logger.info(f"✅ Successfully scraped: {result['data']['company_name']}")
            return jsonify(result)
        else:
            logger.error(f"❌ Scraping failed: {result['error']}")
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Scrape error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get database statistics"""
    try:
        result = db.get_stats()
        return jsonify(result)
    except Exception as e:
        logger.error(f"❌ Stats error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting Hyperformr Scraper API...")
    print("🌐 API running on: http://localhost:5003")
    print("📋 Health check: http://localhost:5003/api/health")
    print("📊 Frontend should connect to: http://localhost:5173")
    
    app.run(
        host='0.0.0.0',
        port=5003,
        debug=True
    )