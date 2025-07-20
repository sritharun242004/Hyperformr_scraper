import os
from supabase import create_client, Client
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        """Initialize Supabase client"""
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        
        try:
            self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
            logger.info("✅ Supabase database connected successfully")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Supabase: {e}")
            raise

    def insert_business(self, business_data):
        """Insert new business into database"""
        try:
            # Prepare data for insertion
            insert_data = {
                'url': business_data.get('url'),
                'company_name': business_data.get('company_name', 'Unknown Company'),
                'business_type': business_data.get('business_type', 'Unknown'),
                'industry': business_data.get('industry', 'Unknown'),
                'location': business_data.get('location', 'Unknown'),
                'founded_year': business_data.get('founded_year', 'Unknown'),
                'description': business_data.get('description', 'No description'),
                'business_model': business_data.get('business_model', 'Unknown'),
                'company_size': business_data.get('company_size', 'Unknown'),
                'estimated_revenue': business_data.get('estimated_revenue', 'Not disclosed'),
                'employee_count': business_data.get('employee_count', 'Not specified'),
                'target_market': business_data.get('target_market', 'General Market'),
                'key_services': business_data.get('key_services', 'Not specified'),
                'technologies': business_data.get('technologies', 'Not specified'),
                'competitive_advantages': business_data.get('competitive_advantages', 'Not specified'),
                'key_executives': business_data.get('key_executives', 'Not found'),
                'awards_recognition': business_data.get('awards_recognition', 'None'),
                'recent_news': business_data.get('recent_news', 'None'),
                'product_categories': business_data.get('product_categories', 'Not specified'),
                'client_testimonials': business_data.get('client_testimonials', 'None'),
                'partnerships': business_data.get('partnerships', 'None'),
                'certifications': business_data.get('certifications', 'None'),
                'market_focus': business_data.get('market_focus', 'Unknown'),
                'business_maturity': business_data.get('business_maturity', 'Unknown'),
                'contact_info': business_data.get('contact_info', 'Not found'),
                'social_media': business_data.get('social_media', 'Not found'),
                'content': business_data.get('content', 'No content'),
                'summary': business_data.get('summary', 'No summary'),
            }
            
            # Insert into Supabase
            result = self.supabase.table('businesses').insert(insert_data).execute()
            
            if result.data:
                inserted_business = result.data[0]
                logger.info(f"✅ Added business: {inserted_business['company_name']}")
                return {"success": True, "data": inserted_business}
            else:
                logger.error(f"❌ Failed to insert business: No data returned")
                return {"success": False, "error": "Failed to insert business"}
                
        except Exception as e:
            logger.error(f"❌ Error adding business: {e}")
            return {"success": False, "error": str(e)}

    def get_businesses(self, search='', sort_by='scraped_date', page=1, per_page=12):
        """Get businesses with search, sort and pagination"""
        try:
            # Start with base query
            query = self.supabase.table('businesses').select('*')
            
            # Apply search filter
            if search and search.strip():
                search_term = f"%{search.strip()}%"
                query = query.or_(f"company_name.ilike.{search_term},business_type.ilike.{search_term},industry.ilike.{search_term},location.ilike.{search_term},description.ilike.{search_term}")
            
            # Apply sorting
            if sort_by == 'company_name':
                query = query.order('company_name')
            elif sort_by == 'business_type':
                query = query.order('business_type')
            elif sort_by == 'industry':
                query = query.order('industry')
            elif sort_by == 'founded_year':
                query = query.order('founded_year', desc=True)
            else:  # Default to scraped_date
                query = query.order('scraped_date', desc=True)
            
            # Get total count for pagination
            count_query = self.supabase.table('businesses').select('id', count='exact')
            if search and search.strip():
                search_term = f"%{search.strip()}%"
                count_query = count_query.or_(f"company_name.ilike.{search_term},business_type.ilike.{search_term},industry.ilike.{search_term},location.ilike.{search_term},description.ilike.{search_term}")
            
            count_result = count_query.execute()
            total = count_result.count if count_result.count is not None else 0
            
            # Apply pagination
            start_idx = (page - 1) * per_page
            query = query.range(start_idx, start_idx + per_page - 1)
            
            # Execute query
            result = query.execute()
            
            # Calculate pagination info
            total_pages = (total + per_page - 1) // per_page if total > 0 else 1
            
            logger.info(f"✅ Returning {len(result.data)} businesses (page {page}/{total_pages})")
            
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
            logger.error(f"❌ Database error: {e}")
            return {
                "success": False, 
                "error": str(e), 
                "data": [], 
                "pagination": {
                    "current_page": page,
                    "per_page": per_page,
                    "total_items": 0,
                    "total_pages": 1,
                    "has_next": False,
                    "has_prev": False
                }
            }

    def get_business_by_id(self, business_id):
        """Get single business by ID"""
        try:
            result = self.supabase.table('businesses').select('*').eq('id', business_id).execute()
            
            if result.data and len(result.data) > 0:
                return {"success": True, "data": result.data[0]}
            else:
                return {"success": False, "error": "Business not found"}
                
        except Exception as e:
            logger.error(f"❌ Error getting business: {e}")
            return {"success": False, "error": str(e)}

    def delete_business(self, business_id):
        """Delete business by ID"""
        try:
            result = self.supabase.table('businesses').delete().eq('id', business_id).execute()
            
            if result.data and len(result.data) > 0:
                logger.info(f"✅ Deleted business ID: {business_id}")
                return {"success": True, "message": "Business deleted"}
            else:
                return {"success": False, "error": "Business not found"}
                
        except Exception as e:
            logger.error(f"❌ Delete error: {e}")
            return {"success": False, "error": str(e)}

    def check_url_exists(self, url):
        """Check if URL already exists in database"""
        try:
            result = self.supabase.table('businesses').select('*').eq('url', url).execute()
            
            if result.data and len(result.data) > 0:
                return {
                    "success": True, 
                    "exists": True, 
                    "business": result.data[0]
                }
            else:
                return {
                    "success": True, 
                    "exists": False, 
                    "business": None
                }
                
        except Exception as e:
            logger.error(f"❌ Error checking URL: {e}")
            return {"success": False, "error": str(e)}

    def get_stats(self):
        """Get database statistics"""
        try:
            # Total businesses
            total_result = self.supabase.table('businesses').select('id', count='exact').execute()
            total_businesses = total_result.count if total_result.count is not None else 0
            
            # Businesses by type
            types_result = self.supabase.table('businesses').select('business_type', count='exact').execute()
            business_types = {}
            if types_result.data:
                for item in types_result.data:
                    btype = item.get('business_type', 'Unknown')
                    business_types[btype] = business_types.get(btype, 0) + 1
            
            # Recent businesses (last 7 days)
            recent_result = self.supabase.table('businesses').select('id', count='exact').gte('scraped_date', (datetime.now().isoformat())).execute()
            recent_count = recent_result.count if recent_result.count is not None else 0
            
            return {
                "success": True,
                "data": {
                    "total_businesses": total_businesses,
                    "business_types": business_types,
                    "recent_businesses": recent_count
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Stats error: {e}")
            return {"success": False, "error": str(e)}

# Single database instance
_db_instance = None

def get_db():
    """Get database instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
    return _db_instance