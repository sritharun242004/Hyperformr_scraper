import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from urllib.parse import urlparse, urljoin
from database import get_db
import json
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BusinessScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.db = get_db()
        logger.info("🔍 Business Scraper initialized")
    
    def scrape_business(self, url):
        """Main method to scrape business information from a URL"""
        try:
            logger.info(f"🔍 Analyzing: {url}")
            
            # Make request to the website
            response = self.session.get(url, timeout=20)
            response.raise_for_status()
            
            # Parse HTML content
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract comprehensive business data
            business_data = {
                'url': url,
                'company_name': self._extract_company_name(soup, url),
                'business_type': self._extract_business_type(soup),
                'industry': self._extract_industry(soup),
                'description': self._extract_description(soup),
                'location': self._extract_location(soup),
                'founded_year': self._extract_founded_year(soup),
                'contact_info': self._extract_contact_info(soup),
                'social_media': self._extract_social_media(soup),
                'content': self._extract_content(soup),
                'company_size': self._extract_company_size(soup),
                'estimated_revenue': self._extract_revenue(soup),
                'key_services': self._extract_services(soup),
                'target_market': self._extract_target_market(soup),
                'technologies': self._extract_technologies(soup),
                'employee_count': self._extract_employees(soup),
                'summary': self._create_summary(soup),
                'business_model': self._extract_business_model(soup),
                'competitive_advantages': self._extract_competitive_advantages(soup),
                'key_executives': self._extract_key_people(soup),
                'awards_recognition': self._extract_awards(soup),
                'recent_news': self._extract_recent_updates(soup),
                'product_categories': self._extract_product_categories(soup),
                'client_testimonials': self._extract_testimonials(soup),
                'partnerships': self._extract_partnerships(soup),
                'certifications': self._extract_certifications(soup),
                'market_focus': self._analyze_market_focus(soup),
                'business_maturity': self._assess_business_maturity(soup)
            }
            
            # Save to database
            db_result = self.db.insert_business(business_data)
            
            if db_result['success']:
                logger.info(f"✅ Successfully scraped and saved: {business_data['company_name']}")
                return {"success": True, "data": business_data}
            else:
                logger.error(f"❌ Database error: {db_result['error']}")
                return {"success": False, "error": f"Database error: {db_result['error']}"}
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Request error: {e}")
            return {"success": False, "error": f"Failed to access website: {str(e)}"}
        except Exception as e:
            logger.error(f"❌ Scraping error: {e}")
            return {"success": False, "error": f"Scraping failed: {str(e)}"}
    
    def _extract_company_name(self, soup, url):
        """Extract company name from various sources"""
        # Try JSON-LD structured data first
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and 'name' in data:
                    return self._clean_company_name(data['name'])
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and 'name' in item:
                            return self._clean_company_name(item['name'])
            except:
                continue
        
        # Try meta tags
        meta_selectors = [
            'meta[property="og:site_name"]',
            'meta[name="application-name"]',
            'meta[property="og:title"]',
            'meta[name="title"]'
        ]
        
        for selector in meta_selectors:
            element = soup.select_one(selector)
            if element:
                content = element.get('content', '').strip()
                if content and len(content) > 2:
                    return self._clean_company_name(content)
        
        # Try header elements
        header_selectors = [
            'header .logo', '.navbar-brand', '.site-title', '.company-name', 
            'header h1', '.header-title', '[class*="logo"]', '.brand'
        ]
        
        for selector in header_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text().strip()
                if text and 2 < len(text) < 100:
                    return self._clean_company_name(text)
        
        # Try title tag
        title = soup.find('title')
        if title:
            title_text = title.get_text().strip()
            # Clean up common title patterns
            cleaned = re.sub(r'\s*[-|–]\s*(Home|Welcome|Official|Website|About|Contact).*$', '', title_text, flags=re.IGNORECASE)
            if cleaned and len(cleaned) > 2:
                return self._clean_company_name(cleaned)
        
        # Domain fallback
        domain = urlparse(url).netloc.replace('www.', '')
        return domain.split('.')[0].title()
    
    def _clean_company_name(self, name):
        """Clean and format company name"""
        # Remove common suffixes and patterns
        name = re.sub(r'\s*[-|–]\s*(Inc|LLC|Corp|Ltd|Company|Co|Corporation|Limited)\.?\s*$', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\s*[-|–]\s*(Official Website|Home|Welcome|About).*$', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\s*[|–]\s*.*$', '', name)
        return name.strip()
    
    def _extract_business_type(self, soup):
        """Determine business type based on content analysis"""
        content = soup.get_text().lower()
        
        categories = {
            'SaaS/Software': ['software', 'saas', 'platform', 'api', 'cloud', 'application'],
            'E-commerce': ['shop', 'store', 'buy', 'sell', 'marketplace', 'retail'],
            'Fintech': ['fintech', 'financial', 'banking', 'payment', 'cryptocurrency'],
            'Consulting': ['consulting', 'consultant', 'advisory', 'services'],
            'Healthcare/Medtech': ['healthcare', 'medical', 'health', 'pharma', 'biotech'],
            'Education/EdTech': ['education', 'learning', 'training', 'course', 'edtech'],
            'Media/Content': ['media', 'content', 'publishing', 'news', 'journalism'],
            'Technology': ['technology', 'tech', 'innovation', 'digital', 'ai']
        }
        
        category_scores = {}
        for category, keywords in categories.items():
            score = sum(content.count(keyword) for keyword in keywords)
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            return max(category_scores, key=category_scores.get)
        
        return 'Other'
    
    def _extract_industry(self, soup):
        """Extract industry classification"""
        content = soup.get_text().lower()
        
        industries = {
            'Technology': ['software', 'tech', 'ai', 'machine learning', 'cloud', 'saas', 'platform'],
            'Healthcare': ['healthcare', 'medical', 'pharma', 'biotech', 'health', 'wellness'],
            'Finance': ['fintech', 'financial', 'banking', 'investment', 'trading', 'cryptocurrency'],
            'E-commerce': ['ecommerce', 'online store', 'retail', 'marketplace', 'shopping'],
            'Education': ['education', 'learning', 'training', 'edtech', 'courses', 'university'],
            'Marketing': ['marketing', 'advertising', 'seo', 'social media', 'digital marketing'],
            'Manufacturing': ['manufacturing', 'production', 'industrial', 'factory', 'automotive'],
            'Real Estate': ['real estate', 'property', 'housing', 'construction', 'architecture'],
            'Transportation': ['logistics', 'shipping', 'transport', 'delivery', 'mobility'],
            'Entertainment': ['entertainment', 'media', 'gaming', 'streaming', 'content']
        }
        
        industry_scores = {}
        for industry, keywords in industries.items():
            score = sum(content.count(keyword) for keyword in keywords)
            if score > 0:
                industry_scores[industry] = score
        
        if industry_scores:
            return max(industry_scores, key=industry_scores.get)
        
        return 'Other'
    
    def _extract_description(self, soup):
        """Extract business description"""
        # Try meta descriptions first
        meta_descriptions = [
            soup.find('meta', {'name': 'description'}),
            soup.find('meta', {'property': 'og:description'}),
            soup.find('meta', {'name': 'twitter:description'})
        ]
        
        for meta_desc in meta_descriptions:
            if meta_desc and meta_desc.get('content'):
                desc = meta_desc['content'].strip()
                if 20 <= len(desc) <= 500:
                    return desc
        
        # Try first paragraph with substantial content
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = p.get_text().strip()
            if 50 <= len(text) <= 400:
                return text
        
        return 'No description available'
    
    def _extract_location(self, soup):
        """Extract business location"""
        # Try JSON-LD structured data
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and 'address' in data:
                    addr = data['address']
                    if isinstance(addr, dict):
                        city = addr.get('addressLocality', '')
                        state = addr.get('addressRegion', '')
                        if city and state:
                            return f"{city}, {state}"
                        elif city:
                            return city
            except:
                continue
        
        # Try pattern matching in content
        content = soup.get_text()
        location_patterns = [
            r'(?:located|based|headquartered)\s+(?:in|at)\s+([A-Z][a-z]+(?:,\s*[A-Z]{2,3})?)',
            r'(?:offices?\s+in|locations?\s+in)\s+([A-Z][a-z]+(?:,\s*[A-Z]{2,3})?)',
            r'([A-Z][a-z]+,\s*[A-Z]{2})\s+(?:headquarters|office|location)',
        ]
        
        for pattern in location_patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if isinstance(match, str) and len(match) > 2:
                    return match.strip()
        
        return 'Unknown'
    
    def _extract_founded_year(self, soup):
        """Extract founding year"""
        content = soup.get_text()
        
        # Try JSON-LD structured data first
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and 'foundingDate' in data:
                    year = re.search(r'(\d{4})', data['foundingDate'])
                    if year:
                        return year.group(1)  # 👈 Make sure this line is properly indented inside the if block
            except:
                continue
            
        # Pattern matching for years
        year_patterns = [
            r'founded\s+in\s+(\d{4})',
            r'established\s+in\s+(\d{4})',
            r'started\s+in\s+(\d{4})',
            r'began\s+in\s+(\d{4})',
            r'launched\s+in\s+(\d{4})',
            r'incorporated\s+in\s+(\d{4})',
            r'company\s+founded\s+(\d{4})',
            r'est\.?\s+(\d{4})',
            r'established\s+(\d{4})',
            r'founded:?\s+(\d{4})',
            r'inception:?\s+(\d{4})',
            r'since\s+(\d{4})',
        ]
        
        current_year = datetime.now().year
        found_years = []
        
        for pattern in year_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                year = int(match)
                if 1800 <= year <= current_year:
                    found_years.append(year)
        
        if found_years:
            return str(min(found_years))
        
        return 'Unknown'
    
    def _extract_business_model(self, soup):
        """Extract business model"""
        content = soup.get_text().lower()
        
        models = {
            'SaaS': ['subscription', 'saas', 'monthly', 'annual plan', 'software as a service'],
            'E-commerce': ['buy now', 'add to cart', 'shop', 'products', 'checkout'],
            'Marketplace': ['marketplace', 'sellers', 'buyers', 'commission', 'platform'],
            'Consulting': ['consulting', 'services', 'consultation', 'advisory', 'expertise'],
            'Freemium': ['free trial', 'freemium', 'upgrade', 'premium', 'basic plan'],
            'B2B': ['enterprise', 'business', 'companies', 'organizations', 'corporate'],
            'B2C': ['consumers', 'individuals', 'personal', 'home', 'family']
        }
        
        for model, keywords in models.items():
            if any(keyword in content for keyword in keywords):
                return model
        
        return 'Unknown'
    
    def _extract_company_size(self, soup):
        """Extract company size"""
        content = soup.get_text().lower()
        
        employee_patterns = [
            r'(\d+(?:,\d{3})*)\s*(?:\+|plus)?\s*(?:employees|staff|team members|people)',
            r'(?:team|staff|workforce)\s+(?:of\s+)?(\d+(?:,\d{3})*)',
            r'employs\s+(\d+(?:,\d{3})*)'
        ]
        
        for pattern in employee_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                count = int(match.group(1).replace(',', ''))
                if count <= 10:
                    return 'Startup (1-10 employees)'
                elif count <= 50:
                    return 'Small (11-50 employees)'
                elif count <= 200:
                    return 'Medium (51-200 employees)'
                elif count <= 1000:
                    return 'Large (201-1000 employees)'
                else:
                    return 'Enterprise (1000+ employees)'
        
        return 'Unknown'
    
    def _extract_revenue(self, soup):
        """Extract estimated revenue"""
        content = soup.get_text()
        
        revenue_patterns = [
            r'\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|M|B)(?:\s+(?:revenue|sales|annual))?',
            r'(?:revenue|sales)\s*:?\s*\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|M|B)?',
        ]
        
        for pattern in revenue_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                amount = match.group(1)
                if 'billion' in match.group(0).lower() or 'B' in match.group(0):
                    return f"${amount}B"
                else:
                    return f"${amount}M"
        
        return 'Not disclosed'
    
    def _extract_contact_info(self, soup):
        """Extract contact information"""
        contact_info = []
        content = soup.get_text()
        
        # Email patterns
        email_patterns = [
            r'(?:email|contact):\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
            r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
        ]
        
        for pattern in email_patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if not any(exclude in match.lower() for exclude in ['example', 'test', 'noreply']):
                    contact_info.append(f"Email: {match}")
                    break
        
        # Phone patterns
        phone_pattern = r'(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}'
        phones = re.findall(phone_pattern, content)
        if phones:
            contact_info.append(f"Phone: {phones[0]}")
        
        return ', '.join(contact_info[:2]) if contact_info else 'Contact info not found'
    
    def _extract_social_media(self, soup):
        """Extract social media links"""
        social_links = []
        social_platforms = {
            'LinkedIn': r'linkedin\.com',
            'Twitter': r'twitter\.com|x\.com',
            'Facebook': r'facebook\.com',
            'Instagram': r'instagram\.com',
            'YouTube': r'youtube\.com'
        }
        
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            for platform, pattern in social_platforms.items():
                if re.search(pattern, href):
                    social_links.append(f"{platform}: {href}")
                    break
        
        return ', '.join(social_links[:3]) if social_links else 'No social media found'
    
    def _extract_content(self, soup):
        """Extract main content"""
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            element.decompose()
        
        main_content = soup.find('main') or soup.find('body')
        if main_content:
            text = main_content.get_text(separator=' ', strip=True)
            text = ' '.join(text.split())
            return text[:2000]  # Limit content length
        
        return 'No content extracted'
    
    def _create_summary(self, soup):
        """Create business summary"""
        content = soup.get_text()
        sentences = re.split(r'[.!?]+', content)
        
        good_sentences = []
        for sentence in sentences[:20]:
            sentence = sentence.strip()
            if (50 < len(sentence) < 300 and 
                any(word in sentence.lower() for word in ['we', 'company', 'business', 'our', 'provides', 'offers', 'helps'])):
                good_sentences.append(sentence)
        
        if good_sentences:
            return good_sentences[0] + '.'
        
        return 'Business summary not available'
    
    # Simplified extraction methods for additional fields
    def _extract_services(self, soup):
        return 'Services not specified'
    
    def _extract_target_market(self, soup):
        return 'General Market'
    
    def _extract_technologies(self, soup):
        return 'Not specified'
    
    def _extract_employees(self, soup):
        return 'Not specified'
    
    def _extract_competitive_advantages(self, soup):
        return 'Not specified'
    
    def _extract_key_people(self, soup):
        return 'Leadership info not found'
    
    def _extract_awards(self, soup):
        return 'No awards mentioned'
    
    def _extract_recent_updates(self, soup):
        return 'No recent updates found'
    
    def _extract_product_categories(self, soup):
        return 'Product categories not specified'
    
    def _extract_testimonials(self, soup):
        return 'No testimonials found'
    
    def _extract_partnerships(self, soup):
        return 'No partnerships mentioned'
    
    def _extract_certifications(self, soup):
        return 'No certifications mentioned'
    
    def _analyze_market_focus(self, soup):
        return 'Unknown'
    
    def _assess_business_maturity(self, soup):
        return 'Unknown'

# Test function
def test_scraper():
    """Test the business scraper"""
    logger.info("🧪 Testing Business Scraper...")
    scraper = BusinessScraper()
    
    result = scraper.scrape_business("https://google.com")
    
    if result['success']:
        data = result['data']
        logger.info(f"✅ Company: {data['company_name']}")
        logger.info(f"🏢 Type: {data['business_type']}")
        logger.info(f"📍 Location: {data['location']}")
        logger.info(f"📅 Founded: {data['founded_year']}")
    else:
        logger.error(f"❌ Failed: {result['error']}")

if __name__ == "__main__":
    test_scraper()