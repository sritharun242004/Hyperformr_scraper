import os
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class BusinessDatabase:
    def __init__(self):
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_KEY')
        
        if not self.url or not self.key:
            raise ValueError("Missing Supabase credentials in .env file")
        
        self.supabase: Client = create_client(self.url, self.key)
        print(f"✅ Connected to Business Database")
        
        self.setup_database()
    
    def setup_database(self):
        try:
            print("📋 Database schema ready for business data")
        except Exception as e:
            print(f"⚠️  Database setup note: {e}")
    
    def insert_business(self, business_data):
        try:
            data = {
                'url': business_data['url'],
                'company_name': business_data.get('company_name', ''),
                'business_type': business_data.get('business_type', ''),
                'industry': business_data.get('industry', ''),
                'company_size': business_data.get('company_size', ''),
                'estimated_revenue': business_data.get('estimated_revenue', ''),
                'founded_year': business_data.get('founded_year', ''),
                'location': business_data.get('location', ''),
                'description': business_data.get('description', ''),
                'summary': business_data.get('summary', ''),
                'content': business_data.get('content', ''),
                'key_services': business_data.get('key_services', ''),
                'target_market': business_data.get('target_market', ''),
                'contact_info': business_data.get('contact_info', ''),
                'social_media': business_data.get('social_media', ''),
                'technologies': business_data.get('technologies', ''),
                'employee_count': business_data.get('employee_count', ''),
                
                # Business intelligence fields
                'business_model': business_data.get('business_model', ''),
                'competitive_advantages': business_data.get('competitive_advantages', ''),
                'key_executives': business_data.get('key_executives', ''),
                'awards_recognition': business_data.get('awards_recognition', ''),
                'recent_news': business_data.get('recent_news', ''),
                'product_categories': business_data.get('product_categories', ''),
                'client_testimonials': business_data.get('client_testimonials', ''),
                'partnerships': business_data.get('partnerships', ''),
                'certifications': business_data.get('certifications', ''),
                'market_focus': business_data.get('market_focus', ''),
                'business_maturity': business_data.get('business_maturity', ''),
                
                'last_updated': datetime.now().isoformat()
            }
            
            existing = self.supabase.table('businesses').select('id').eq('url', data['url']).execute()
            
            if existing.data:
                result = self.supabase.table('businesses').update(data).eq('url', data['url']).execute()
                print(f"💾 Updated: {data['company_name']}")
                return {"success": True, "data": result.data, "action": "updated"}
            else:
                data['scraped_date'] = datetime.now().isoformat()
                result = self.supabase.table('businesses').insert(data).execute()
                print(f"💾 Inserted: {data['company_name']}")
                return {"success": True, "data": result.data, "action": "inserted"}
            
        except Exception as e:
            print(f"❌ Database error: {e}")
            return {"success": False, "error": str(e)}
    
    def get_businesses(self, search='', sort_by='company_name', page=1, per_page=12, filters=None):
        try:
            offset = (page - 1) * per_page
            
            query = self.supabase.table('businesses').select('*')
            
            if search:
                search_conditions = [
                    f'company_name.ilike.%{search}%',
                    f'business_type.ilike.%{search}%',
                    f'industry.ilike.%{search}%',
                    f'location.ilike.%{search}%',
                    f'description.ilike.%{search}%',
                    f'key_services.ilike.%{search}%',
                    f'business_model.ilike.%{search}%',
                    f'technologies.ilike.%{search}%'
                ]
                query = query.or_(','.join(search_conditions))
            
            if filters:
                if filters.get('business_type'):
                    query = query.eq('business_type', filters['business_type'])
                if filters.get('industry'):
                    query = query.eq('industry', filters['industry'])
                if filters.get('company_size'):
                    query = query.eq('company_size', filters['company_size'])
                if filters.get('location'):
                    query = query.ilike('location', f"%{filters['location']}%")
                if filters.get('founded_year_range'):
                    start_year, end_year = filters['founded_year_range']
                    query = query.gte('founded_year', start_year).lte('founded_year', end_year)
            
            if sort_by == 'relevance' and search:
                pass
            else:
                query = query.order(sort_by)
            
            count_query = self.supabase.table('businesses').select('id', count='exact')
            if search:
                count_query = count_query.or_(','.join(search_conditions))
            if filters:
                if filters.get('business_type'):
                    count_query = count_query.eq('business_type', filters['business_type'])
                if filters.get('industry'):
                    count_query = count_query.eq('industry', filters['industry'])
                if filters.get('company_size'):
                    count_query = count_query.eq('company_size', filters['company_size'])
                if filters.get('location'):
                    count_query = count_query.ilike('location', f"%{filters['location']}%")
            
            total_result = count_query.execute()
            total = total_result.count
            
            result = query.range(offset, offset + per_page - 1).execute()
            total_pages = (total + per_page - 1) // per_page
            
            return {
                "success": True,
                "data": result.data,
                "pagination": {
                    "current_page": page,
                    "per_page": per_page,
                    "total_items": total,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1
                }
            }
            
        except Exception as e:
            print(f"❌ Database query error: {e}")
            return {"success": False, "error": str(e)}
    
    def get_business_by_id(self, business_id):
        try:
            result = self.supabase.table('businesses').select('*').eq('id', business_id).execute()
            
            if result.data:
                return {"success": True, "data": result.data[0]}
            else:
                return {"success": False, "error": "Business not found"}
                
        except Exception as e:
            print(f"❌ Database error: {e}")
            return {"success": False, "error": str(e)}
    
    def delete_business(self, business_id):
        try:
            business = self.get_business_by_id(business_id)
            if not business['success']:
                return business
            
            company_name = business['data']['company_name']
            
            result = self.supabase.table('businesses').delete().eq('id', business_id).execute()
            
            return {"success": True, "message": f"Deleted {company_name}"}
            
        except Exception as e:
            print(f"❌ Database error: {e}")
            return {"success": False, "error": str(e)}
    
    def get_stats(self):
        try:
            total_result = self.supabase.table('businesses').select('id', count='exact').execute()
            total_businesses = total_result.count
            
            recent_date = (datetime.now() - timedelta(days=7)).isoformat()
            recent_result = self.supabase.table('businesses').select('id', count='exact').gte('scraped_date', recent_date).execute()
            recent_additions = recent_result.count
            
            business_types = self.supabase.table('businesses').select('business_type').execute()
            type_counts = {}
            for business in business_types.data:
                btype = business.get('business_type', 'Unknown')
                type_counts[btype] = type_counts.get(btype, 0) + 1
            
            industries = self.supabase.table('businesses').select('industry').execute()
            industry_counts = {}
            for business in industries.data:
                industry = business.get('industry', 'Unknown')
                industry_counts[industry] = industry_counts.get(industry, 0) + 1
            
            sizes = self.supabase.table('businesses').select('company_size').execute()
            size_counts = {}
            for business in sizes.data:
                size = business.get('company_size', 'Unknown')
                size_counts[size] = size_counts.get(size, 0) + 1
            
            locations = self.supabase.table('businesses').select('location').execute()
            location_counts = {}
            for business in locations.data:
                location = business.get('location', 'Unknown')
                if location != 'Unknown':
                    location_counts[location] = location_counts.get(location, 0) + 1
            
            top_locations = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            
            return {
                "success": True,
                "data": {
                    "total_businesses": total_businesses,
                    "recent_additions": recent_additions,
                    "business_types": type_counts,
                    "industries": industry_counts,
                    "company_sizes": size_counts,
                    "top_locations": dict(top_locations)
                }
            }
            
        except Exception as e:
            print(f"❌ Stats error: {e}")
            return {"success": False, "error": str(e)}
    
    def search_businesses_advanced(self, query_params):
        try:
            search_text = query_params.get('search', '')
            business_type = query_params.get('business_type', '')
            industry = query_params.get('industry', '')
            location = query_params.get('location', '')
            company_size = query_params.get('company_size', '')
            founded_year_min = query_params.get('founded_year_min', '')
            founded_year_max = query_params.get('founded_year_max', '')
            
            filters = {}
            if business_type:
                filters['business_type'] = business_type
            if industry:
                filters['industry'] = industry
            if company_size:
                filters['company_size'] = company_size
            if location:
                filters['location'] = location
            if founded_year_min and founded_year_max:
                filters['founded_year_range'] = (founded_year_min, founded_year_max)
            
            return self.get_businesses(
                search=search_text,
                sort_by=query_params.get('sort_by', 'company_name'),
                page=int(query_params.get('page', 1)),
                per_page=int(query_params.get('per_page', 12)),
                filters=filters if filters else None
            )
            
        except Exception as e:
            print(f"❌ Advanced search error: {e}")
            return {"success": False, "error": str(e)}
    
    def get_business_insights(self, business_id):
        try:
            business = self.get_business_by_id(business_id)
            if not business['success']:
                return business
            
            data = business['data']
            
            insights = {
                'company_overview': {
                    'name': data.get('company_name', 'Unknown'),
                    'industry': data.get('industry', 'Unknown'),
                    'founded': data.get('founded_year', 'Unknown'),
                    'location': data.get('location', 'Unknown'),
                    'size': data.get('company_size', 'Unknown')
                },
                'business_analysis': {
                    'business_model': data.get('business_model', 'Unknown'),
                    'target_market': data.get('target_market', 'Unknown'),
                    'competitive_advantages': data.get('competitive_advantages', 'Not specified'),
                    'market_position': data.get('market_focus', 'Unknown'),
                    'business_maturity': data.get('business_maturity', 'Unknown')
                },
                'operational_details': {
                    'key_services': data.get('key_services', 'Not specified'),
                    'technologies': data.get('technologies', 'Not specified'),
                    'partnerships': data.get('partnerships', 'Not specified'),
                    'certifications': data.get('certifications', 'Not specified')
                },
                'contact_and_social': {
                    'contact_info': data.get('contact_info', 'Not available'),
                    'social_media': data.get('social_media', 'Not available'),
                    'website': data.get('url', '')
                },
                'recent_activity': {
                    'recent_news': data.get('recent_news', 'No recent updates'),
                    'awards': data.get('awards_recognition', 'No awards mentioned'),
                    'testimonials': data.get('client_testimonials', 'No testimonials')
                }
            }
            
            return {"success": True, "data": insights}
            
        except Exception as e:
            print(f"❌ Insights error: {e}")
            return {"success": False, "error": str(e)}
    
    def get_similar_businesses(self, business_id, limit=5):
        try:
            business = self.get_business_by_id(business_id)
            if not business['success']:
                return business
            
            reference = business['data']
            
            query = self.supabase.table('businesses').select('*').neq('id', business_id)
            
            if reference.get('industry'):
                query = query.eq('industry', reference['industry'])
            
            if reference.get('business_type'):
                query = query.eq('business_type', reference['business_type'])
            
            result = query.limit(limit).execute()
            
            return {"success": True, "data": result.data}
            
        except Exception as e:
            print(f"❌ Similar businesses error: {e}")
            return {"success": False, "error": str(e)}

# Global instance
db = None

def get_db():
    global db
    if db is None:
        db = BusinessDatabase()
    return db

def test_database():
    print("🧪 Testing Business Database...")
    
    try:
        db = get_db()
        
        stats = db.get_stats()
        if stats['success']:
            print(f"✅ Total businesses: {stats['data']['total_businesses']}")
            print(f"📊 Business types: {stats['data']['business_types']}")
            print(f"🏭 Industries: {stats['data']['industries']}")
        
        search_result = db.get_businesses(search="technology", per_page=5)
        if search_result['success']:
            print(f"🔍 Found {search_result['pagination']['total_items']} businesses matching 'technology'")
        
        print("✅ Database test completed!")
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")

if __name__ == "__main__":
    test_database()