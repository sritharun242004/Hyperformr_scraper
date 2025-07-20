from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        """Simple database for demo"""
        self.businesses = []
        self.next_id = 1
        print("✅ Database initialized")
        self._add_sample_data()
    
    def _add_sample_data(self):
        """Add sample businesses"""
        sample_businesses = [
            {
                'id': 1,
                'url': 'https://google.com',
                'company_name': 'Google LLC',
                'business_type': 'Technology',
                'industry': 'Internet Services',
                'location': 'Mountain View, CA',
                'founded_year': '1998',
                'description': 'Search engine and technology company providing internet-related services and products',
                'business_model': 'Advertising',
                'company_size': 'Enterprise (1000+ employees)',
                'estimated_revenue': '$280B',
                'employee_count': '139,995',
                'target_market': 'Global Consumer and Enterprise',
                'key_services': 'Search, Advertising, Cloud Computing, Mobile OS',
                'technologies': 'AI, Machine Learning, Cloud Infrastructure',
                'competitive_advantages': 'Dominant search market share, massive data collection',
                'key_executives': 'Sundar Pichai (CEO), Ruth Porat (CFO)',
                'awards_recognition': 'Fortune 500, Best Places to Work',
                'recent_news': 'Continued AI development and cloud expansion',
                'product_categories': 'Search, Ads, Cloud, Hardware',
                'client_testimonials': 'Excellent search experience and reliable services',
                'partnerships': 'Apple, Samsung, Mozilla',
                'certifications': 'ISO 27001, SOC 2',
                'market_focus': 'Global Technology Leadership',
                'business_maturity': 'Mature Enterprise',
                'contact_info': 'contact@google.com, 1-650-253-0000',
                'social_media': 'Twitter: @Google, LinkedIn: Google',
                'content': 'Google comprehensive technology services',
                'summary': 'Google is a multinational technology company specializing in internet-related services.',
                'scraped_date': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            },
            {
                'id': 2,
                'url': 'https://microsoft.com',
                'company_name': 'Microsoft Corporation',
                'business_type': 'Technology',
                'industry': 'Software',
                'location': 'Redmond, WA',
                'founded_year': '1975',
                'description': 'Software and cloud computing company providing enterprise and consumer solutions',
                'business_model': 'SaaS',
                'company_size': 'Enterprise (1000+ employees)',
                'estimated_revenue': '$200B',
                'employee_count': '221,000',
                'target_market': 'Enterprise and Consumer',
                'key_services': 'Cloud Computing, Software, Gaming, Hardware',
                'technologies': 'Azure, AI, Machine Learning, Quantum Computing',
                'competitive_advantages': 'Enterprise dominance, strong cloud platform',
                'key_executives': 'Satya Nadella (CEO), Amy Hood (CFO)',
                'awards_recognition': 'Fortune 500, Most Valuable Brand',
                'recent_news': 'AI integration across products, Teams growth',
                'product_categories': 'Operating Systems, Office Suite, Cloud, Gaming',
                'client_testimonials': 'Reliable enterprise solutions and support',
                'partnerships': 'OpenAI, Intel, AMD',
                'certifications': 'ISO 27001, FedRAMP, HIPAA',
                'market_focus': 'Enterprise Cloud Leadership',
                'business_maturity': 'Mature Enterprise',
                'contact_info': 'support@microsoft.com, 1-425-882-8080',
                'social_media': 'Twitter: @Microsoft, LinkedIn: Microsoft',
                'content': 'Microsoft enterprise and consumer software solutions',
                'summary': 'Microsoft is leading technology corporation known for Windows, Office, and Azure.',
                'scraped_date': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            },
            {
                'id': 3,
                'url': 'https://apple.com',
                'company_name': 'Apple Inc.',
                'business_type': 'Technology',
                'industry': 'Consumer Electronics',
                'location': 'Cupertino, CA',
                'founded_year': '1976',
                'description': 'Consumer electronics company designing smartphones, computers, and digital services',
                'business_model': 'Hardware and Services',
                'company_size': 'Enterprise (1000+ employees)',
                'estimated_revenue': '$394B',
                'employee_count': '164,000',
                'target_market': 'Premium Consumer Market',
                'key_services': 'iPhone, Mac, iPad, Apple Services',
                'technologies': 'iOS, macOS, Apple Silicon, AR/VR',
                'competitive_advantages': 'Premium brand, ecosystem integration',
                'key_executives': 'Tim Cook (CEO), Luca Maestri (CFO)',
                'awards_recognition': 'Most Valuable Company, Design Awards',
                'recent_news': 'Vision Pro launch, Apple Intelligence AI',
                'product_categories': 'Smartphones, Computers, Tablets, Wearables',
                'client_testimonials': 'Exceptional build quality and user experience',
                'partnerships': 'Intel, TSMC, Samsung',
                'certifications': 'ISO 14001, Carbon Neutral',
                'market_focus': 'Premium Consumer Electronics',
                'business_maturity': 'Mature Enterprise',
                'contact_info': 'support@apple.com, 1-800-275-2273',
                'social_media': 'Twitter: @Apple, LinkedIn: Apple',
                'content': 'Apple innovative consumer electronics',
                'summary': 'Apple is a premium consumer electronics company known for iPhone and Mac.',
                'scraped_date': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            }
        ]
        
        self.businesses = sample_businesses
        self.next_id = 4

    def _simple_search(self, search_term, business):
        """Simple search function"""
        if not search_term:
            return True
        
        search_term = search_term.lower()
        
        # Search in these fields
        searchable_text = (
            str(business.get('company_name', '')).lower() + ' ' +
            str(business.get('business_type', '')).lower() + ' ' +
            str(business.get('industry', '')).lower() + ' ' +
            str(business.get('location', '')).lower() + ' ' +
            str(business.get('description', '')).lower()
        )
        
        # Check if search term is in any of the text
        return search_term in searchable_text

    def insert_business(self, business_data):
        """Add new business"""
        try:
            new_business = {
                'id': self.next_id,
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
                'contact_info': business_data.get('contact_info', 'Not found'),
                'social_media': business_data.get('social_media', 'Not found'),
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
                'content': business_data.get('content', 'No content'),
                'summary': business_data.get('summary', 'No summary'),
                'scraped_date': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            }
            
            self.businesses.append(new_business)
            self.next_id += 1
            
            print(f"✅ Added business: {new_business['company_name']}")
            return {"success": True, "data": new_business}
                
        except Exception as e:
            print(f"❌ Error adding business: {e}")
            return {"success": False, "error": str(e)}

    def get_businesses(self, search='', sort_by='scraped_date', page=1, per_page=12):
        """Get businesses with search and pagination"""
        try:
            # Start with all businesses
            filtered_businesses = self.businesses.copy()
            
            print(f"📊 Total businesses: {len(filtered_businesses)}")
            
            # Apply search
            if search and search.strip():
                search_term = search.strip()
                filtered_businesses = [
                    b for b in filtered_businesses 
                    if self._simple_search(search_term, b)
                ]
                print(f"🔍 Search '{search_term}' found {len(filtered_businesses)} results")
            
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
            
            print(f"✅ Returning {len(page_businesses)} businesses on page {page}")
            
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
            print(f"❌ Database error: {e}")
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

    def delete_business(self, business_id):
        """Delete business by ID"""
        try:
            original_count = len(self.businesses)
            self.businesses = [b for b in self.businesses if b['id'] != business_id]
            
            if len(self.businesses) < original_count:
                print(f"✅ Deleted business ID: {business_id}")
                return {"success": True, "message": "Business deleted"}
            else:
                return {"success": False, "error": "Business not found"}
            
        except Exception as e:
            print(f"❌ Delete error: {e}")
            return {"success": False, "error": str(e)}

# Single database instance
_db_instance = None

def get_db():
    """Get database instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
    return _db_instance