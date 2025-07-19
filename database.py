import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        """Initialize simple in-memory database for testing"""
        self.businesses = []
        self.next_id = 1
        logger.info("✅ Test database initialized (in-memory)")
        
        # Add some sample data for testing
        self._add_sample_data()
    
    def _add_sample_data(self):
        """Add sample businesses for testing"""
        sample_businesses = [
            {
                'id': 1,
                'url': 'https://google.com',
                'company_name': 'Google',
                'business_type': 'Technology',
                'industry': 'Internet Services',
                'location': 'Mountain View, CA',
                'founded_year': '1998',
                'description': 'Search engine and technology company',
                'business_model': 'Advertising',
                'company_size': 'Enterprise (1000+ employees)',
                'estimated_revenue': '$280B',
                'scraped_date': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            },
            {
                'id': 2,
                'url': 'https://microsoft.com',
                'company_name': 'Microsoft',
                'business_type': 'Technology',
                'industry': 'Software',
                'location': 'Redmond, WA',
                'founded_year': '1975',
                'description': 'Software and cloud computing company',
                'business_model': 'SaaS',
                'company_size': 'Enterprise (1000+ employees)',
                'estimated_revenue': '$200B',
                'scraped_date': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            }
        ]
        
        self.businesses = sample_businesses
        self.next_id = 3

    def insert_business(self, business_data):
        """Insert a new business record"""
        try:
            # Create new business with ID
            new_business = {
                'id': self.next_id,
                'url': business_data.get('url'),
                'company_name': business_data.get('company_name', 'Unknown Company'),
                'business_type': business_data.get('business_type', 'Unknown'),
                'industry': business_data.get('industry', 'Unknown'),
                'location': business_data.get('location', 'Unknown'),
                'founded_year': business_data.get('founded_year', 'Unknown'),
                'description': business_data.get('description', 'No description available'),
                'business_model': business_data.get('business_model', 'Unknown'),
                'company_size': business_data.get('company_size', 'Unknown'),
                'estimated_revenue': business_data.get('estimated_revenue', 'Not disclosed'),
                'employee_count': business_data.get('employee_count', 'Not specified'),
                'target_market': business_data.get('target_market', 'General Market'),
                'key_services': business_data.get('key_services', 'Services not specified'),
                'contact_info': business_data.get('contact_info', 'Contact info not found'),
                'social_media': business_data.get('social_media', 'No social media found'),
                'technologies': business_data.get('technologies', 'Not specified'),
                'competitive_advantages': business_data.get('competitive_advantages', 'Not specified'),
                'key_executives': business_data.get('key_executives', 'Leadership info not found'),
                'awards_recognition': business_data.get('awards_recognition', 'No awards mentioned'),
                'recent_news': business_data.get('recent_news', 'No recent updates found'),
                'product_categories': business_data.get('product_categories', 'Product categories not specified'),
                'client_testimonials': business_data.get('client_testimonials', 'No testimonials found'),
                'partnerships': business_data.get('partnerships', 'No partnerships mentioned'),
                'certifications': business_data.get('certifications', 'No certifications mentioned'),
                'market_focus': business_data.get('market_focus', 'Unknown'),
                'business_maturity': business_data.get('business_maturity', 'Unknown'),
                'content': business_data.get('content', 'No content extracted'),
                'summary': business_data.get('summary', 'Business summary not available'),
                'scraped_date': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            }
            
            # Add to businesses list
            self.businesses.append(new_business)
            self.next_id += 1
            
            logger.info(f"✅ Business inserted: {new_business['company_name']}")
            return {"success": True, "data": new_business}
                
        except Exception as e:
            logger.error(f"❌ Insert error: {e}")
            return {"success": False, "error": str(e)}

    def get_businesses(self, search='', sort_by='scraped_date', page=1, per_page=12, filters=None):
        """Get businesses with search, sort, and pagination"""
        try:
            # Filter businesses based on search
            filtered_businesses = self.businesses.copy()
            
            if search and search.strip():
                search_term = search.strip().lower()
                filtered_businesses = [
                    b for b in filtered_businesses 
                    if (search_term in b.get('company_name', '').lower() or
                        search_term in b.get('business_type', '').lower() or
                        search_term in b.get('industry', '').lower() or
                        search_term in b.get('location', '').lower() or
                        search_term in b.get('description', '').lower())
                ]
                logger.info(f"🔍 Searching for: '{search_term}', found {len(filtered_businesses)} results")
            
            # Apply filters
            if filters:
                if filters.get('business_type'):
                    filtered_businesses = [b for b in filtered_businesses if b.get('business_type') == filters['business_type']]
                if filters.get('industry'):
                    filtered_businesses = [b for b in filtered_businesses if b.get('industry') == filters['industry']]
                if filters.get('location'):
                    location_filter = filters['location'].lower()
                    filtered_businesses = [b for b in filtered_businesses if location_filter in b.get('location', '').lower()]
            
            # Sort businesses
            if sort_by == 'company_name':
                filtered_businesses.sort(key=lambda x: x.get('company_name', '').lower())
            elif sort_by == 'business_type':
                filtered_businesses.sort(key=lambda x: x.get('business_type', '').lower())
            elif sort_by == 'industry':
                filtered_businesses.sort(key=lambda x: x.get('industry', '').lower())
            elif sort_by == 'founded_year':
                filtered_businesses.sort(key=lambda x: x.get('founded_year', '0'), reverse=True)
            else:  # Default to scraped_date
                filtered_businesses.sort(key=lambda x: x.get('scraped_date', ''), reverse=True)
            
            # Pagination
            total = len(filtered_businesses)
            total_pages = (total + per_page - 1) // per_page if total > 0 else 1
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            page_businesses = filtered_businesses[start_idx:end_idx]
            
            logger.info(f"✅ Found {total} businesses, showing page {page}")
            
            return {
                "success": True,
                "data": page_businesses,
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
            logger.error(f"❌ Database query error: {e}")
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
        """Get a single business by ID"""
        try:
            business = next((b for b in self.businesses if b['id'] == business_id), None)
            
            if business:
                # Format dates
                business['last_updated_formatted'] = self._format_date(business.get('last_updated'))
                business['scraped_date_formatted'] = self._format_date(business.get('scraped_date'))
                
                return {"success": True, "data": business}
            else:
                return {"success": False, "error": "Business not found"}
                
        except Exception as e:
            logger.error(f"❌ Get business by ID error: {e}")
            return {"success": False, "error": str(e)}

    def delete_business(self, business_id):
        """Delete a business by ID"""
        try:
            # Find and remove business
            original_count = len(self.businesses)
            self.businesses = [b for b in self.businesses if b['id'] != business_id]
            
            if len(self.businesses) < original_count:
                logger.info(f"✅ Deleted business ID: {business_id}")
                return {"success": True, "message": "Business deleted successfully"}
            else:
                return {"success": False, "error": "Business not found"}
            
        except Exception as e:
            logger.error(f"❌ Delete business error: {e}")
            return {"success": False, "error": str(e)}

    def search_suggestions(self, search_term, limit=5):
        """Get search suggestions based on partial input"""
        try:
            if not search_term or len(search_term) < 2:
                return {"success": True, "suggestions": []}
            
            search_lower = search_term.lower()
            suggestions = []
            seen = set()
            
            for business in self.businesses:
                company_name = business.get('company_name', '')
                if (company_name and 
                    search_lower in company_name.lower() and 
                    company_name not in seen):
                    suggestions.append(company_name)
                    seen.add(company_name)
                    if len(suggestions) >= limit:
                        break
            
            return {"success": True, "suggestions": suggestions}
            
        except Exception as e:
            logger.error(f"❌ Search suggestions error: {e}")
            return {"success": False, "suggestions": []}

    def get_stats(self):
        """Get application statistics"""
        try:
            total_businesses = len(self.businesses)
            
            # Count by business type
            business_types = {}
            industries = {}
            
            for business in self.businesses:
                # Business types
                btype = business.get('business_type', 'Unknown')
                business_types[btype] = business_types.get(btype, 0) + 1
                
                # Industries
                industry = business.get('industry', 'Unknown')
                industries[industry] = industries.get(industry, 0) + 1
            
            # Recent businesses (for demo, just count all)
            recent_count = total_businesses
            
            return {
                "success": True,
                "stats": {
                    "total_businesses": total_businesses,
                    "recent_businesses": recent_count,
                    "business_types": business_types,
                    "industries": industries,
                    "top_business_type": max(business_types.items(), key=lambda x: x[1])[0] if business_types else "Unknown",
                    "top_industry": max(industries.items(), key=lambda x: x[1])[0] if industries else "Unknown"
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Get stats error: {e}")
            return {"success": False, "error": str(e)}

    def _format_date(self, date_string):
        """Format date string for display"""
        if not date_string:
            return 'Unknown'
        
        try:
            from datetime import datetime
            date_obj = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
            return date_obj.strftime('%B %d, %Y at %I:%M %p')
        except:
            return date_string

# Singleton instance
_db_instance = None

def get_db():
    """Get database instance (singleton pattern)"""
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
    return _db_instance