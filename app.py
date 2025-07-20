from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from database import get_db
from scraper import BusinessScraper

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

CORS(app, origins=[
    "http://localhost:3000", 
    "http://localhost:5173",
    "https://hyperformr-scraper.vercel.app",  # Your upcoming Vercel URL
    "https://*.vercel.app"  # Allow any Vercel subdomain for safety
])

# Initialize database and scraper
db = get_db()
scraper = BusinessScraper()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'message': 'Business Scraper API is running'
    })

@app.route('/api/businesses', methods=['GET'])
def get_businesses():
    """Get businesses with search and pagination"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 12))
        search = request.args.get('search', '').strip()
        sort_by = request.args.get('sort_by', 'scraped_date')
        
        print(f"🔍 API Request: page={page}, search='{search}', sort_by={sort_by}")
        
        result = db.get_businesses(
            search=search,
            sort_by=sort_by,
            page=page,
            per_page=per_page
        )
        
        if result['success']:
            print(f"✅ Returning {len(result['data'])} businesses")
            return jsonify(result)
        else:
            print(f"❌ Database error: {result['error']}")
            return jsonify({'success': False, 'error': result['error']}), 500
            
    except Exception as e:
        print(f"❌ API error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/businesses/<int:business_id>', methods=['DELETE'])
def delete_business(business_id):
    """Delete a business"""
    try:
        result = db.delete_business(business_id)
        
        if result['success']:
            print(f"🗑️ Deleted business ID: {business_id}")
            return jsonify({'success': True, 'message': 'Business deleted successfully'})
        else:
            return jsonify({'success': False, 'error': result['error']}), 404
            
    except Exception as e:
        print(f"❌ Delete error: {e}")
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
        
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
        
        print(f"🔍 Scraping URL: {url}")
        
        result = scraper.scrape_business(url)
        
        if result['success']:
            print(f"✅ Successfully scraped: {result['data']['company_name']}")
            return jsonify(result)
        else:
            print(f"❌ Scraping failed: {result['error']}")
            return jsonify(result), 400
            
    except Exception as e:
        print(f"❌ Scrape error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Business Scraper API...")
    print("🌐 API running on: http://localhost:5003")
    print("📋 Health check: http://localhost:5003/api/health")
    
    app.run(
        host='0.0.0.0',
        port=5003,
        debug=True
    )