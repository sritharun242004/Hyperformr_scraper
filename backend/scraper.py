import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from database import get_db
import logging
from urllib.parse import urljoin, urlparse
import time

# Setup logging
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
        """Main scraping function with enhanced data extraction"""
        try:
            logger.info(f"🔍 Starting scrape for: {url}")
            
            # Clean and validate URL
            cleaned_url = self._clean_url(url)
            
            # Get the website content
            response = self.session.get(cleaned_url, timeout=15)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract comprehensive business information
            business_data = {
                'url': cleaned_url,
                'company_name': self._get_company_name(soup, cleaned_url),
                'business_type': self._get_business_type(soup),
                'industry': self._get_industry(soup),
                'description': self._get_description(soup),
                'location': self._get_location(soup),
                'founded_year': self._get_founded_year(soup),
                'contact_info': self._get_contact_info(soup),
                'social_media': self._get_social_media(soup),
                'content': self._get_content(soup),
                'company_size': self._get_company_size(soup),
                'estimated_revenue': self._get_revenue(soup),
                'employee_count': self._get_employee_count(soup),
                'key_services': self._get_services(soup),
                'target_market': self._get_target_market(soup),
                'technologies': self._get_technologies(soup),
                'summary': self._get_summary(soup),
                'business_model': self._get_business_model(soup),
                'competitive_advantages': self._get_advantages(soup),
                'key_executives': self._get_executives(soup),
                'awards_recognition': self._get_awards(soup),
                'recent_news': self._get_news(soup),
                'product_categories': self._get_products(soup),
                'client_testimonials': self._get_testimonials(soup),
                'partnerships': self._get_partnerships(soup),
                'certifications': self._get_certifications(soup),
                'market_focus': self._get_market_focus(soup),
                'business_maturity': self._get_maturity(soup)
            }
            
            # Save to database
            db_result = self.db.insert_business(business_data)
            
            if db_result['success']:
                logger.info(f"✅ Successfully scraped and saved: {business_data['company_name']}")
                return {"success": True, "data": db_result['data']}
            else:
                logger.error(f"❌ Database save error: {db_result['error']}")
                return {"success": False, "error": f"Failed to save: {db_result['error']}"}
            
        except requests.exceptions.Timeout:
            error_msg = "Website took too long to respond"
            logger.error(f"❌ Timeout error: {error_msg}")
            return {"success": False, "error": error_msg}
        except requests.exceptions.ConnectionError:
            error_msg = "Failed to connect to website"
            logger.error(f"❌ Connection error: {error_msg}")
            return {"success": False, "error": error_msg}
        except requests.exceptions.RequestException as e:
            error_msg = f"Failed to access website: {str(e)}"
            logger.error(f"❌ Request error: {error_msg}")
            return {"success": False, "error": error_msg}
        except Exception as e:
            error_msg = f"Scraping failed: {str(e)}"
            logger.error(f"❌ Scraping error: {error_msg}")
            return {"success": False, "error": error_msg}
    
    def _clean_url(self, url):
        """Clean and validate URL"""
        url = url.strip()
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
        return url
    
    def _get_company_name(self, soup, url):
        """Enhanced company name extraction"""
        # Try multiple strategies
        strategies = [
            # Meta property og:site_name
            lambda: soup.find('meta', {'property': 'og:site_name'}),
            # Meta name application-name
            lambda: soup.find('meta', {'name': 'application-name'}),
            # Title tag (cleaned)
            lambda: soup.find('title'),
            # H1 with company indicators
            lambda: soup.find('h1', string=re.compile(r'(company|business|corporation|inc|ltd)', re.I)),
            # Logo alt text
            lambda: soup.find('img', {'alt': re.compile(r'logo', re.I)}),
            # Navigation brand
            lambda: soup.find('a', {'class': re.compile(r'(brand|logo|company)', re.I)})
        ]
        
        for strategy in strategies:
            try:
                element = strategy()
                if element:
                    if element.name == 'meta':
                        name = element.get('content', '').strip()
                    elif element.name == 'img':
                        name = element.get('alt', '').strip()
                    else:
                        name = element.get_text().strip()
                    
                    if name and len(name) > 2:
                        # Clean up common suffixes
                        name = re.sub(r'\s*[-|–]\s*(Home|Welcome|Official|Website).*$', '', name, flags=re.I)
                        name = re.sub(r'\s*\|\s*.*$', '', name)
                        if name and len(name) > 2:
                            return name
            except:
                continue
        
        # Fallback to domain
        domain = urlparse(url).netloc.replace('www.', '')
        return domain.split('.')[0].title()
    
    def _get_business_type(self, soup):
        """Enhanced business type detection"""
        content = soup.get_text().lower()
        
        type_mapping = {
            'SaaS/Software': ['saas', 'software', 'platform', 'api', 'cloud', 'app'],
            'E-commerce': ['shop', 'store', 'buy', 'sell', 'retail', 'ecommerce', 'marketplace'],
            'Consulting': ['consulting', 'advisory', 'professional services', 'consultancy'],
            'Healthcare': ['healthcare', 'medical', 'health', 'hospital', 'clinic', 'pharma'],
            'Education': ['education', 'learning', 'training', 'university', 'school', 'course'],
            'Finance': ['finance', 'banking', 'investment', 'insurance', 'fintech'],
            'Technology': ['technology', 'tech', 'digital', 'innovation', 'startup'],
            'Manufacturing': ['manufacturing', 'production', 'factory', 'industrial'],
            'Real Estate': ['real estate', 'property', 'realty', 'housing'],
            'Marketing': ['marketing', 'advertising', 'agency', 'digital marketing'],
            'Non-profit': ['non-profit', 'nonprofit', 'charity', 'foundation', 'ngo']
        }
        
        for business_type, keywords in type_mapping.items():
            if any(keyword in content for keyword in keywords):
                return business_type
        
        return 'Business Services'
    
    def _get_industry(self, soup):
        """Enhanced industry classification"""
        content = soup.get_text().lower()
        
        industry_mapping = {
            'Technology': ['software', 'tech', 'ai', 'cloud', 'cybersecurity', 'blockchain'],
            'Healthcare': ['healthcare', 'medical', 'pharma', 'biotech', 'wellness'],
            'Finance': ['finance', 'banking', 'investment', 'fintech', 'cryptocurrency'],
            'Education': ['education', 'learning', 'university', 'training', 'edtech'],
            'Retail': ['retail', 'ecommerce', 'shopping', 'consumer goods'],
            'Manufacturing': ['manufacturing', 'automotive', 'aerospace', 'chemicals'],
            'Real Estate': ['real estate', 'construction', 'architecture', 'property'],
            'Energy': ['energy', 'renewable', 'oil', 'gas', 'solar', 'wind'],
            'Media': ['media', 'publishing', 'entertainment', 'news', 'broadcasting'],
            'Transportation': ['transportation', 'logistics', 'shipping', 'automotive'],
            'Agriculture': ['agriculture', 'farming', 'food', 'agriculture technology'],
            'Government': ['government', 'public sector', 'municipal', 'federal']
        }
        
        for industry, keywords in industry_mapping.items():
            if any(keyword in content for keyword in keywords):
                return industry
        
        return 'Other'
    
    def _get_description(self, soup):
        """Enhanced description extraction"""
        strategies = [
            # Meta description
            lambda: soup.find('meta', {'name': 'description'}),
            # Open Graph description
            lambda: soup.find('meta', {'property': 'og:description'}),
            # Twitter description
            lambda: soup.find('meta', {'name': 'twitter:description'}),
            # Schema.org description
            lambda: soup.find('meta', {'itemprop': 'description'})
        ]
        
        for strategy in strategies:
            try:
                element = strategy()
                if element:
                    desc = element.get('content', '').strip()
                    if 20 <= len(desc) <= 500:
                        return desc
            except:
                continue
        
        # Look for descriptive paragraphs
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = p.get_text().strip()
            if 50 <= len(text) <= 300 and not any(skip in text.lower() for skip in ['cookie', 'privacy', 'terms']):
                return text
        
        return 'No description available'
    
    def _get_location(self, soup):
        """Enhanced location extraction"""
        content = soup.get_text()
        
        # Look for structured data
        structured_location = soup.find('span', {'itemprop': 'address'})
        if structured_location:
            return structured_location.get_text().strip()
        
        # Address patterns
        patterns = [
            r'(?:located|based|headquartered)\s+(?:in|at)\s+([A-Z][a-z]+(?:,\s*[A-Z]{2,3})?)',
            r'([A-Z][a-z]+,\s*[A-Z]{2,3}\s*\d{5})',
            r'([A-Z][a-z]+,\s*[A-Z]{2})',
            r'(\d+\s+[A-Z][a-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)(?:,\s*[A-Z][a-z]+)?)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content)
            if matches:
                return matches[0]
        
        return 'Location not specified'
    
    def _get_founded_year(self, soup):
        """Enhanced founding year extraction"""
        content = soup.get_text()
        
        patterns = [
            r'founded\s+in\s+(\d{4})',
            r'established\s+in\s+(\d{4})',
            r'started\s+in\s+(\d{4})',
            r'since\s+(\d{4})',
            r'©\s*(\d{4})',
            r'copyright\s+(\d{4})'
        ]
        
        current_year = datetime.now().year
        
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                year = int(match)
                if 1800 <= year <= current_year:
                    return str(year)
        
        return 'Not specified'
    
    def _get_contact_info(self, soup):
        """Enhanced contact information extraction"""
        content = soup.get_text()
        contact_info = []
        
        # Email patterns
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, content)
        if emails:
            # Filter out common non-business emails
            business_emails = [e for e in emails if not any(skip in e.lower() for skip in ['noreply', 'no-reply', 'support@wordpress'])]
            if business_emails:
                contact_info.append(f"Email: {business_emails[0]}")
        
        # Phone patterns
        phone_patterns = [
            r'(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            r'\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}'
        ]
        
        for pattern in phone_patterns:
            phones = re.findall(pattern, content)
            if phones:
                if isinstance(phones[0], tuple):
                    phone = f"({phones[0][0]}) {phones[0][1]}-{phones[0][2]}"
                else:
                    phone = phones[0]
                contact_info.append(f"Phone: {phone}")
                break
        
        return ', '.join(contact_info) if contact_info else 'Contact information not found'
    
    def _get_social_media(self, soup):
        """Enhanced social media extraction"""
        social_links = []
        social_platforms = {
            'linkedin.com': 'LinkedIn',
            'twitter.com': 'Twitter',
            'x.com': 'Twitter/X',
            'facebook.com': 'Facebook',
            'instagram.com': 'Instagram',
            'youtube.com': 'YouTube',
            'github.com': 'GitHub'
        }
        
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            for platform_url, platform_name in social_platforms.items():
                if platform_url in href and 'share' not in href:
                    social_links.append(f"{platform_name}: {link['href']}")
                    break
        
        # Remove duplicates and limit
        unique_links = list(dict.fromkeys(social_links))
        return ', '.join(unique_links[:3]) if unique_links else 'Social media not found'
    
    def _get_content(self, soup):
        """Enhanced content extraction"""
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            element.decompose()
        
        # Try to find main content area
        main_content = (
            soup.find('main') or 
            soup.find('article') or 
            soup.find('div', {'id': re.compile(r'content|main', re.I)}) or
            soup.find('div', {'class': re.compile(r'content|main', re.I)}) or
            soup.find('body')
        )
        
        if main_content:
            text = main_content.get_text(separator=' ', strip=True)
            # Clean up text
            text = re.sub(r'\s+', ' ', text)
            return text[:2000] + '...' if len(text) > 2000 else text
        
        return 'Content not extracted'
    
    def _get_employee_count(self, soup):
        """Extract employee count"""
        content = soup.get_text()
        
        patterns = [
            r'(\d+(?:,\d{3})*)\s+employees',
            r'team\s+of\s+(\d+)',
            r'staff\s+of\s+(\d+)',
            r'(\d+)\s+people'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                return matches[0].replace(',', '')
        
        return 'Not specified'
    
    def _get_services(self, soup):
        """Extract key services"""
        content = soup.get_text().lower()
        
        # Look for services section
        services_section = soup.find(['div', 'section'], string=re.compile(r'services|solutions|offerings', re.I))
        if services_section:
            parent = services_section.find_parent()
            if parent:
                services_text = parent.get_text()
                # Extract service list
                services = re.findall(r'([A-Z][a-z\s]+(?:Services?|Solutions?|Consulting|Development|Design|Management))', services_text)
                if services:
                    return ', '.join(services[:5])
        
        # Fallback to common service keywords
        service_keywords = ['consulting', 'development', 'design', 'marketing', 'support', 'training', 'implementation']
        found_services = [keyword.title() for keyword in service_keywords if keyword in content]
        
        return ', '.join(found_services[:3]) if found_services else 'Services not specified'
    
    # Simplified implementations for other methods to keep the code manageable
    def _get_company_size(self, soup):
        content = soup.get_text().lower()
        if any(word in content for word in ['startup', 'small team', 'boutique']):
            return 'Small (1-50 employees)'
        elif any(word in content for word in ['medium', 'growing', 'expanding']):
            return 'Medium (51-200 employees)'
        elif any(word in content for word in ['large', 'enterprise', 'corporation', 'multinational']):
            return 'Large (200+ employees)'
        return 'Size not specified'
    
    def _get_revenue(self, soup):
        content = soup.get_text()
        revenue_pattern = r'\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|M|B)'
        matches = re.findall(revenue_pattern, content, re.IGNORECASE)
        return f"${matches[0]}" if matches else 'Revenue not disclosed'
    
    def _get_target_market(self, soup): return 'Target market not specified'
    def _get_technologies(self, soup): return 'Technologies not specified'
    def _get_summary(self, soup): return self._get_description(soup)
    def _get_business_model(self, soup): return 'Business model not specified'
    def _get_advantages(self, soup): return 'Competitive advantages not specified'
    def _get_executives(self, soup): return 'Executive information not found'
    def _get_awards(self, soup): return 'Awards not mentioned'
    def _get_news(self, soup): return 'Recent news not found'
    def _get_products(self, soup): return 'Product categories not specified'
    def _get_testimonials(self, soup): return 'Testimonials not found'
    def _get_partnerships(self, soup): return 'Partnerships not mentioned'
    def _get_certifications(self, soup): return 'Certifications not mentioned'
    def _get_market_focus(self, soup): return 'Market focus not specified'
    def _get_maturity(self, soup): return 'Business maturity not determined'