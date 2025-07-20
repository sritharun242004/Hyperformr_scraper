import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from database import get_db

class BusinessScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.db = get_db()
        print("🔍 Business Scraper ready")
    
    def scrape_business(self, url):
        """Main scraping function"""
        try:
            print(f"🔍 Scraping: {url}")
            
            # Get the website
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract business info
            business_data = {
                'url': url,
                'company_name': self._get_company_name(soup, url),
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
                'key_services': self._get_services(soup),
                'target_market': self._get_target_market(soup),
                'technologies': self._get_technologies(soup),
                'employee_count': self._get_employees(soup),
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
                print(f"✅ Successfully scraped: {business_data['company_name']}")
                return {"success": True, "data": business_data}
            else:
                print(f"❌ Database error: {db_result['error']}")
                return {"success": False, "error": f"Database error: {db_result['error']}"}
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error: {e}")
            return {"success": False, "error": f"Failed to access website: {str(e)}"}
        except Exception as e:
            print(f"❌ Scraping error: {e}")
            return {"success": False, "error": f"Scraping failed: {str(e)}"}
    
    def _get_company_name(self, soup, url):
        """Get company name"""
        # Try title tag first
        title = soup.find('title')
        if title:
            title_text = title.get_text().strip()
            # Clean up title
            cleaned = re.sub(r'\s*[-|–]\s*(Home|Welcome|Official).*$', '', title_text)
            if cleaned and len(cleaned) > 2:
                return cleaned
        
        # Try meta tags
        meta_name = soup.find('meta', {'property': 'og:site_name'})
        if meta_name:
            return meta_name.get('content', '').strip()
        
        # Fallback to domain
        domain = url.replace('https://', '').replace('http://', '').replace('www.', '')
        return domain.split('.')[0].title()
    
    def _get_business_type(self, soup):
        """Get business type"""
        content = soup.get_text().lower()
        
        if any(word in content for word in ['software', 'saas', 'platform', 'api']):
            return 'SaaS/Software'
        elif any(word in content for word in ['shop', 'store', 'buy', 'sell', 'retail']):
            return 'E-commerce'
        elif any(word in content for word in ['consulting', 'advisory', 'services']):
            return 'Consulting'
        elif any(word in content for word in ['healthcare', 'medical', 'health']):
            return 'Healthcare'
        elif any(word in content for word in ['education', 'learning', 'training']):
            return 'Education'
        elif any(word in content for word in ['technology', 'tech', 'digital']):
            return 'Technology'
        else:
            return 'Business Services'
    
    def _get_industry(self, soup):
        """Get industry"""
        content = soup.get_text().lower()
        
        if any(word in content for word in ['software', 'tech', 'ai', 'cloud']):
            return 'Technology'
        elif any(word in content for word in ['healthcare', 'medical', 'pharma']):
            return 'Healthcare'
        elif any(word in content for word in ['finance', 'banking', 'investment']):
            return 'Finance'
        elif any(word in content for word in ['education', 'learning', 'university']):
            return 'Education'
        elif any(word in content for word in ['retail', 'ecommerce', 'shopping']):
            return 'Retail'
        else:
            return 'Other'
    
    def _get_description(self, soup):
        """Get description"""
        # Try meta description
        meta_desc = soup.find('meta', {'name': 'description'})
        if meta_desc:
            desc = meta_desc.get('content', '').strip()
            if len(desc) > 20:
                return desc
        
        # Try og:description
        og_desc = soup.find('meta', {'property': 'og:description'})
        if og_desc:
            desc = og_desc.get('content', '').strip()
            if len(desc) > 20:
                return desc
        
        # Try first paragraph
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = p.get_text().strip()
            if 50 <= len(text) <= 300:
                return text
        
        return 'No description available'
    
    def _get_location(self, soup):
        """Get location"""
        content = soup.get_text()
        
        # Look for location patterns
        patterns = [
            r'(?:located|based|headquartered)\s+(?:in|at)\s+([A-Z][a-z]+(?:,\s*[A-Z]{2,3})?)',
            r'([A-Z][a-z]+,\s*[A-Z]{2})'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content)
            if matches:
                return matches[0]
        
        return 'Unknown'
    
    def _get_founded_year(self, soup):
        """Get founding year"""
        content = soup.get_text()
        
        patterns = [
            r'founded\s+in\s+(\d{4})',
            r'established\s+in\s+(\d{4})',
            r'started\s+in\s+(\d{4})',
            r'since\s+(\d{4})'
        ]
        
        current_year = datetime.now().year
        
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                year = int(match)
                if 1800 <= year <= current_year:
                    return str(year)
        
        return 'Unknown'
    
    def _get_contact_info(self, soup):
        """Get contact info"""
        content = soup.get_text()
        
        # Look for email
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, content)
        
        # Look for phone
        phone_pattern = r'(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}'
        phones = re.findall(phone_pattern, content)
        
        contact_info = []
        if emails:
            contact_info.append(f"Email: {emails[0]}")
        if phones:
            contact_info.append(f"Phone: {phones[0]}")
        
        return ', '.join(contact_info) if contact_info else 'Contact info not found'
    
    def _get_social_media(self, soup):
        """Get social media"""
        social_links = []
        
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            if 'linkedin.com' in href:
                social_links.append(f"LinkedIn: {href}")
            elif 'twitter.com' in href or 'x.com' in href:
                social_links.append(f"Twitter: {href}")
            elif 'facebook.com' in href:
                social_links.append(f"Facebook: {href}")
        
        return ', '.join(social_links[:2]) if social_links else 'No social media found'
    
    def _get_content(self, soup):
        """Get main content"""
        # Remove scripts and styles
        for element in soup(['script', 'style', 'nav', 'header', 'footer']):
            element.decompose()
        
        main_content = soup.find('main') or soup.find('body')
        if main_content:
            text = main_content.get_text(separator=' ', strip=True)
            return ' '.join(text.split())[:1000]
        
        return 'No content extracted'
    
    def _get_company_size(self, soup):
        """Get company size"""
        content = soup.get_text().lower()
        
        if 'startup' in content or 'small team' in content:
            return 'Startup (1-10 employees)'
        elif 'small business' in content:
            return 'Small (11-50 employees)'
        elif 'medium' in content:
            return 'Medium (51-200 employees)'
        elif 'large' in content or 'enterprise' in content:
            return 'Large (201-1000 employees)'
        else:
            return 'Unknown'
    
    def _get_revenue(self, soup):
        """Get revenue estimate"""
        content = soup.get_text()
        
        revenue_pattern = r'\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|M|B)'
        matches = re.findall(revenue_pattern, content, re.IGNORECASE)
        
        if matches:
            return f"${matches[0]}"
        
        return 'Not disclosed'
    
    # Simple implementations for other methods
    def _get_services(self, soup): return 'Services not specified'
    def _get_target_market(self, soup): return 'General Market'
    def _get_technologies(self, soup): return 'Not specified'
    def _get_employees(self, soup): return 'Not specified'
    def _get_summary(self, soup): return 'Business summary not available'
    def _get_business_model(self, soup): return 'Unknown'
    def _get_advantages(self, soup): return 'Not specified'
    def _get_executives(self, soup): return 'Leadership info not found'
    def _get_awards(self, soup): return 'No awards mentioned'
    def _get_news(self, soup): return 'No recent updates found'
    def _get_products(self, soup): return 'Product categories not specified'
    def _get_testimonials(self, soup): return 'No testimonials found'
    def _get_partnerships(self, soup): return 'No partnerships mentioned'
    def _get_certifications(self, soup): return 'No certifications mentioned'
    def _get_market_focus(self, soup): return 'Unknown'
    def _get_maturity(self, soup): return 'Unknown'