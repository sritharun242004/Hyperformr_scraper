from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from datetime import datetime
import traceback
import time

from scraper import BusinessScraper
from database import get_db

app = Flask(__name__)

# Enhanced CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

scraper = BusinessScraper()
db = get_db()

@app.route('/')
def home():
    return '''
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>🚀 Hyperformr.scraper API</h1>
        <p style="font-size: 18px; color: #666;">Advanced business intelligence and analysis platform</p>
        
        <h2>🎯 Core Endpoints:</h2>
        <ul style="line-height: 1.8;">
            <li><strong>POST /api/analyze</strong> - Deep business analysis with 20+ data points</li>
            <li><strong>GET /api/businesses</strong> - List businesses with advanced filtering</li>
            <li><strong>GET /api/business/&lt;id&gt;</strong> - Get comprehensive business details</li>
            <li><strong>DELETE /api/business/&lt;id&gt;</strong> - Delete business</li>
            <li><strong>GET /api/stats</strong> - Statistics and insights</li>
        </ul>
        
        <h2>🔍 Advanced Endpoints:</h2>
        <ul style="line-height: 1.8;">
            <li><strong>GET /api/search/advanced</strong> - Advanced search with filters</li>
            <li><strong>GET /api/business/&lt;id&gt;/insights</strong> - Business insights</li>
            <li><strong>GET /api/business/&lt;id&gt;/similar</strong> - Find similar businesses</li>
            <li><strong>GET /api/analytics/dashboard</strong> - Dashboard analytics</li>
        </ul>
        
        <h2>✨ Features:</h2>
        <ul style="line-height: 1.8;">
            <li>✅ 20+ business data points extracted</li>
            <li>✅ Competitive advantage analysis</li>
            <li>✅ Leadership team extraction</li>
            <li>✅ Business model identification</li>
            <li>✅ Market position analysis</li>
            <li>✅ Awards and recognition tracking</li>
            <li>✅ Partnership identification</li>
            <li>✅ Advanced search and filtering</li>
            <li>✅ Business insights and analytics</li>
        </ul>
        
        <h2>🎨 Frontend:</h2>
        <p>Open <code>frontend/index.html</code> in your browser for the UI experience.</p>
    </div>
    '''

@app.route('/api/analyze', methods=['POST'])
def analyze_business():
    """Enhanced business analysis endpoint with better error handling"""
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({'success': False, 'error': 'URL is required'}), 400
        
        url = data['url'].strip()
        
        # URL validation
        if not url:
            return jsonify({'success': False, 'error': 'URL cannot be empty'}), 400
        
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Validate URL format
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            if not parsed.netloc:
                return jsonify({'success': False, 'error': 'Invalid URL format'}), 400
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid URL format'}), 400
        
        print(f"🔍 Starting analysis for: {url}")
        start_time = time.time()
        
        # Enhanced scraping with timeout handling
        try:
            result = scraper.scrape_business(url)
        except Exception as scrape_error:
            print(f"❌ Scraping failed: {scrape_error}")
            return jsonify({
                'success': False, 
                'error': f'Failed to analyze website: {str(scrape_error)}'
            }), 500
        
        analysis_time = time.time() - start_time
        
        if result['success']:
            # Add analysis metadata
            result['data']['analysis_time'] = round(analysis_time, 2)
            result['data']['analysis_date'] = datetime.now().isoformat()
            result['data']['data_points_extracted'] = len([v for v in result['data'].values() if v and v != 'Unknown' and v != 'Not specified'])
            
            return jsonify({
                'success': True,
                'data': result['data'],
                'message': f"Successfully analyzed {result['data']['company_name']} with {result['data']['data_points_extracted']} data points",
                'analysis_time': analysis_time
            })
        else:
            return jsonify({'success': False, 'error': result['error']}), 400
            
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        print(traceback.format_exc())
        return jsonify({
            'success': False, 
            'error': f'Server error during analysis: {str(e)}'
        }), 500

@app.route('/api/businesses', methods=['GET'])
def get_businesses():
    try:
        search = request.args.get('search', '').strip()
        sort_by = request.args.get('sort', 'company_name')
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 12)), 50)
        
        filters = {}
        if request.args.get('business_type'):
            filters['business_type'] = request.args.get('business_type')
        if request.args.get('industry'):
            filters['industry'] = request.args.get('industry')
        if request.args.get('company_size'):
            filters['company_size'] = request.args.get('company_size')
        if request.args.get('location'):
            filters['location'] = request.args.get('location')
        
        result = db.get_businesses(
            search=search, 
            sort_by=sort_by, 
            page=page, 
            per_page=per_page,
            filters=filters if filters else None
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'businesses': result['data'],
                'pagination': result['pagination'],
                'filters_applied': filters
            })
        else:
            return jsonify({'success': False, 'error': result['error']}), 500
        
    except Exception as e:
        print(f"❌ Error getting businesses: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/search/advanced', methods=['GET'])
def advanced_search():
    try:
        query_params = {
            'search': request.args.get('search', ''),
            'business_type': request.args.get('business_type', ''),
            'industry': request.args.get('industry', ''),
            'location': request.args.get('location', ''),
            'company_size': request.args.get('company_size', ''),
            'founded_year_min': request.args.get('founded_year_min', ''),
            'founded_year_max': request.args.get('founded_year_max', ''),
            'sort_by': request.args.get('sort_by', 'company_name'),
            'page': request.args.get('page', '1'),
            'per_page': request.args.get('per_page', '12')
        }
        
        result = db.search_businesses_advanced(query_params)
        
        if result['success']:
            return jsonify({
                'success': True,
                'businesses': result['data'],
                'pagination': result['pagination'],
                'search_params': query_params
            })
        else:
            return jsonify({'success': False, 'error': result['error']}), 500
            
    except Exception as e:
        print(f"❌ Advanced search error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/<int:business_id>', methods=['GET'])
def get_business_detail(business_id):
    try:
        result = db.get_business_by_id(business_id)
        
        if result['success']:
            business_data = result['data']
            
            business_data['data_completeness'] = calculate_data_completeness(business_data)
            business_data['last_updated_formatted'] = format_datetime(business_data.get('last_updated'))
            business_data['scraped_date_formatted'] = format_datetime(business_data.get('scraped_date'))
            
            return jsonify({'success': True, 'business': business_data})
        else:
            return jsonify({'success': False, 'error': result['error']}), 404
            
    except Exception as e:
        print(f"❌ Error getting business detail: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/<int:business_id>/insights', methods=['GET'])
def get_business_insights(business_id):
    try:
        result = db.get_business_insights(business_id)
        
        if result['success']:
            return jsonify({'success': True, 'insights': result['data']})
        else:
            return jsonify({'success': False, 'error': result['error']}), 404
            
    except Exception as e:
        print(f"❌ Error getting insights: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/<int:business_id>/similar', methods=['GET'])
def get_similar_businesses(business_id):
    try:
        limit = min(int(request.args.get('limit', 5)), 10)
        
        result = db.get_similar_businesses(business_id, limit)
        
        if result['success']:
            return jsonify({'success': True, 'similar_businesses': result['data']})
        else:
            return jsonify({'success': False, 'error': result['error']}), 404
            
    except Exception as e:
        print(f"❌ Error getting similar businesses: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/<int:business_id>', methods=['DELETE'])
def delete_business(business_id):
    try:
        result = db.delete_business(business_id)
        
        if result['success']:
            return jsonify({'success': True, 'message': result['message']})
        else:
            return jsonify({'success': False, 'error': result['error']}), 404
            
    except Exception as e:
        print(f"❌ Error deleting business: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        result = db.get_stats()
        
        if result['success']:
            return jsonify({'success': True, 'stats': result['data']})
        else:
            return jsonify({'success': False, 'error': result['error']}), 500
        
    except Exception as e:
        print(f"❌ Error getting stats: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/dashboard', methods=['GET'])
def get_dashboard_analytics():
    try:
        stats = db.get_stats()
        
        if not stats['success']:
            return jsonify({'success': False, 'error': stats['error']}), 500
        
        # Process data for dashboard - simplified version
        dashboard_data = {
            'overview': {
                'total_businesses': stats['data']['total_businesses'],
                'recent_additions': stats['data']['recent_additions']
            },
            'business_types': stats['data']['business_types'],
            'industries': stats['data']['industries'],
            'company_sizes': stats['data']['company_sizes'],
            'locations': stats['data']['top_locations']
        }
        
        return jsonify({'success': True, 'dashboard': dashboard_data})
        
    except Exception as e:
        print(f"❌ Dashboard analytics error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/filters/options', methods=['GET'])
def get_filter_options():
    try:
        all_businesses = db.get_businesses(per_page=1000)
        
        if not all_businesses['success']:
            return jsonify({'success': False, 'error': all_businesses['error']}), 500
        
        businesses = all_businesses['data']
        
        filter_options = {
            'business_types': sorted(list(set(b.get('business_type', '') for b in businesses if b.get('business_type')))),
            'industries': sorted(list(set(b.get('industry', '') for b in businesses if b.get('industry')))),
            'company_sizes': sorted(list(set(b.get('company_size', '') for b in businesses if b.get('company_size')))),
            'locations': sorted(list(set(b.get('location', '') for b in businesses if b.get('location') and b.get('location') != 'Unknown')))[:50]
        }
        
        return jsonify({'success': True, 'options': filter_options})
        
    except Exception as e:
        print(f"❌ Filter options error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Simple test endpoint to verify API is working"""
    return jsonify({
        'success': True,
        'message': 'API is working correctly!',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        stats = db.get_stats()
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'version': '2.0.0',
            'components': {
                'database': 'connected' if stats['success'] else 'disconnected',
                'scraper': 'ready',
                'api': 'running',
                'features': {
                    'business_scraping': True,
                    'advanced_search': True,
                    'business_insights': True,
                    'analytics_dashboard': True
                }
            },
            'performance': {
                'total_businesses': stats['data']['total_businesses'] if stats['success'] else 0,
                'recent_activity': stats['data']['recent_additions'] if stats['success'] else 0
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Utility functions
def calculate_data_completeness(business_data):
    total_fields = len(business_data)
    filled_fields = sum(1 for v in business_data.values() if v and v != 'Unknown' and v != 'Not specified' and v != 'Not available')
    return round((filled_fields / total_fields) * 100, 1)

def format_datetime(datetime_str):
    if not datetime_str:
        return 'N/A'
    
    try:
        dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except:
        return datetime_str

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'success': False, 'error': 'Bad request'}), 400

if __name__ == '__main__':
    print("🚀 Starting Hyperformr.scraper API...")
    print("🌐 Server: http://localhost:5001")
    print("📱 Frontend: Open frontend/index.html")
    print("💡 Features:")
    print("   - 20+ business data points extraction")
    print("   - Advanced search and filtering")
    print("   - Business insights and analytics")
    print("   - Competitive advantage analysis")
    print("   - Leadership team identification")
    print("   - Market position analysis")
    print("   - Partnership and certification tracking")
    print("   - Dashboard analytics")
    print("   - Similar business recommendations")
    
    app.run(debug=True, host='0.0.0.0', port=5001)