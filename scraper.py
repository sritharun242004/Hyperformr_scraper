import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from urllib.parse import urlparse, urljoin
from database import get_db
import json
import time
from collections import Counter

class BusinessScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.db = get_db()
        print("🔍 Business Scraper initialized")
    
    def scrape_business(self, url):
        try:
            print(f"🔍 Analyzing: {url}")
            
            response = self.session.get(url, timeout=20)
            response.raise_for_status()
            
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
                
                # Business intelligence fields
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
            
            # Scrape additional pages for more data
            additional_data = self._scrape_additional_pages(url, soup)
            business_data.update(additional_data)
            
            # Save to database
            db_result = self.db.insert_business(business_data)
            
            if db_result['success']:
                return {"success": True, "data": business_data}
            else:
                return {"success": False, "error": f"Database error: {db_result['error']}"}
            
        except Exception as e:
            print(f"❌ Scraping error: {e}")
            return {"success": False, "error": str(e)}
    
    def _extract_company_name(self, soup, url):
        # JSON-LD structured data
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
        
        # Meta tags
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
        
        # Header elements
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
        
        # Title tag
        title = soup.find('title')
        if title:
            title_text = title.get_text().strip()
            patterns = [
                r'\s*[-|–]\s*(Home|Welcome|Official|Website|About|Contact).*$',
                r'\s*[-|–]\s*.*$'
            ]
            for pattern in patterns:
                cleaned = re.sub(pattern, '', title_text, flags=re.IGNORECASE)
                if cleaned and len(cleaned) > 2:
                    return self._clean_company_name(cleaned)
        
        # Domain fallback
        domain = urlparse(url).netloc.replace('www.', '')
        return domain.split('.')[0].title()
    
    def _clean_company_name(self, name):
        name = re.sub(r'\s*[-|–]\s*(Inc|LLC|Corp|Ltd|Company|Co|Corporation|Limited)\.?\s*$', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\s*[-|–]\s*(Official Website|Home|Welcome|About).*$', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\s*[|–]\s*.*$', '', name)
        return name.strip()
    
    def _extract_founded_year(self, soup):
        content = soup.get_text()
        
        # JSON-LD structured data
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and 'foundingDate' in data:
                    year = re.search(r'(\d{4})', data['foundingDate'])
                    if year:
                        return year.group(1)
            except:
                continue
        
        # Year patterns
        year_patterns = [
            r'founded\s+in\s+(\d{4})',
            r'established\s+in\s+(\d{4})',
            r'since\s+(\d{4})',
            r'started\s+in\s+(\d{4})',
            r'began\s+in\s+(\d{4})',
            r'launched\s+in\s+(\d{4})',
            r'incorporated\s+in\s+(\d{4})',
            r'company\s+founded\s+(\d{4})',
            r'est\.?\s+(\d{4})',
            r'established\s+(\d{4})',
            r'founded:?\s+(\d{4})',
            r'inception:?\s+(\d{4})',
            r'©\s*(\d{4})',
            r'copyright\s+(\d{4})',
            r'history.*?(\d{4})',
            r'our\s+story.*?(\d{4})',
            r'about\s+us.*?(\d{4})'
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
    
    def _extract_industry(self, soup):
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
    
    def _extract_business_model(self, soup):
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
    
    def _extract_competitive_advantages(self, soup):
        content = soup.get_text().lower()
        
        advantages = []
        advantage_patterns = [
            r'(?:why choose us|advantages|benefits|what makes us|unique|differentiators)[:\s]*(.*?)(?:\.|$)',
            r'(?:our strengths|competitive edge|value proposition)[:\s]*(.*?)(?:\.|$)',
            r'(?:leading|industry-leading|award-winning|certified|proven)'
        ]
        
        for pattern in advantage_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, str) and 10 < len(match) < 200:
                    advantages.append(match.strip())
        
        advantage_keywords = [
            'award-winning', 'industry-leading', 'certified', 'proven track record',
            'innovative', 'cutting-edge', 'proprietary', 'patent', 'exclusive'
        ]
        
        found_advantages = [adv for adv in advantage_keywords if adv in content]
        advantages.extend(found_advantages)
        
        return ', '.join(advantages[:3]) if advantages else 'Not specified'
    
    def _extract_key_people(self, soup):
        people = []
        
        team_sections = soup.find_all(['div', 'section'], class_=re.compile(r'team|leadership|about.*team|executives', re.I))
        
        for section in team_sections:
            names = section.find_all(['h3', 'h4', 'h5'], string=re.compile(r'[A-Z][a-z]+\s+[A-Z][a-z]+'))
            for name in names[:5]:
                person_info = name.get_text().strip()
                title_element = name.find_next(['p', 'div', 'span'])
                if title_element:
                    title = title_element.get_text().strip()
                    if len(title) < 50:
                        people.append(f"{person_info} - {title}")
                else:
                    people.append(person_info)
        
        return ', '.join(people[:3]) if people else 'Leadership info not found'
    
    def _extract_awards(self, soup):
        content = soup.get_text().lower()
        
        award_patterns = [
            r'(?:award|recognition|certified|accredited|winner|best|top)[:\s]*(.*?)(?:\.|$)',
            r'(?:iso|soc|gdpr|hipaa|certified)',
            r'(?:forbes|techcrunch|inc\.|award|medal|trophy)'
        ]
        
        awards = []
        for pattern in award_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, str) and 5 < len(match) < 100:
                    awards.append(match.strip())
        
        return ', '.join(awards[:3]) if awards else 'No awards mentioned'
    
    def _extract_recent_updates(self, soup):
        news_sections = soup.find_all(['div', 'section'], class_=re.compile(r'news|blog|updates|announcements', re.I))
        
        updates = []
        for section in news_sections:
            headlines = section.find_all(['h3', 'h4', 'h5', 'a'])
            for headline in headlines[:3]:
                text = headline.get_text().strip()
                if 10 < len(text) < 150:
                    updates.append(text)
        
        return ', '.join(updates[:3]) if updates else 'No recent updates found'
    
    def _extract_product_categories(self, soup):
        content = soup.get_text().lower()
        
        product_sections = soup.find_all(['div', 'section'], class_=re.compile(r'products|services|solutions|offerings', re.I))
        
        categories = []
        for section in product_sections:
            category_elements = section.find_all(['h3', 'h4', 'h5'])
            for elem in category_elements:
                category = elem.get_text().strip()
                if 5 < len(category) < 50:
                    categories.append(category)
        
        return ', '.join(categories[:5]) if categories else 'Product categories not specified'
    
    def _extract_testimonials(self, soup):
        testimonial_sections = soup.find_all(['div', 'section'], class_=re.compile(r'testimonial|review|feedback|client', re.I))
        
        testimonials = []
        for section in testimonial_sections:
            quotes = section.find_all(['blockquote', 'q', 'div'], class_=re.compile(r'quote|testimonial', re.I))
            for quote in quotes:
                text = quote.get_text().strip()
                if 20 < len(text) < 200:
                    testimonials.append(text)
        
        return ', '.join(testimonials[:2]) if testimonials else 'No testimonials found'
    
    def _extract_partnerships(self, soup):
        content = soup.get_text().lower()
        
        partnership_patterns = [
            r'(?:partners|partnerships|integrations|collaborations)[:\s]*(.*?)(?:\.|$)',
            r'(?:works with|integrates with|partners with)[:\s]*(.*?)(?:\.|$)'
        ]
        
        partnerships = []
        for pattern in partnership_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, str) and 5 < len(match) < 100:
                    partnerships.append(match.strip())
        
        return ', '.join(partnerships[:3]) if partnerships else 'No partnerships mentioned'
    
    def _extract_certifications(self, soup):
        content = soup.get_text().lower()
        
        cert_keywords = [
            'iso 9001', 'iso 27001', 'soc 2', 'gdpr', 'hipaa', 'pci dss',
            'certified', 'accredited', 'compliance', 'security certified'
        ]
        
        found_certs = [cert for cert in cert_keywords if cert in content]
        return ', '.join(found_certs) if found_certs else 'No certifications mentioned'
    
    def _analyze_market_focus(self, soup):
        content = soup.get_text().lower()
        
        market_indicators = {
            'Global': ['global', 'worldwide', 'international', 'countries'],
            'National': ['nationwide', 'across the country', 'national'],
            'Regional': ['regional', 'local', 'city', 'state', 'area'],
            'Niche': ['specialized', 'niche', 'specific industry', 'vertical']
        }
        
        for market, indicators in market_indicators.items():
            if any(indicator in content for indicator in indicators):
                return market
        
        return 'Unknown'
    
    def _assess_business_maturity(self, soup):
        content = soup.get_text().lower()
        
        maturity_indicators = {
            'Startup': ['startup', 'new company', 'recently founded', 'emerging'],
            'Growth': ['growing', 'expanding', 'scaling', 'raising funds'],
            'Mature': ['established', 'leading', 'industry leader', 'decades'],
            'Enterprise': ['enterprise', 'fortune 500', 'public company', 'nasdaq']
        }
        
        for stage, indicators in maturity_indicators.items():
            if any(indicator in content for indicator in indicators):
                return stage
        
        return 'Unknown'
    
    def _create_summary(self, soup):
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
    
    def _scrape_additional_pages(self, base_url, main_soup):
        additional_data = {}
        pages_to_check = ['/about', '/company', '/about-us', '/team', '/leadership']
        
        for page in pages_to_check[:2]:
            try:
                page_url = urljoin(base_url, page)
                response = self.session.get(page_url, timeout=10)
                if response.status_code == 200:
                    page_soup = BeautifulSoup(response.content, 'html.parser')
                    
                    year = self._extract_founded_year(page_soup)
                    if year != 'Unknown':
                        additional_data['founded_year'] = year
                    
                    if '/about' in page:
                        desc = self._extract_description(page_soup)
                        if len(desc) > 50:
                            additional_data['description'] = desc
                
                time.sleep(1)
            except:
                continue
        
        return additional_data
    
    # Basic extraction methods
    def _extract_business_type(self, soup):
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
    
    def _extract_location(self, soup):
        # JSON-LD structured data
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
        
        content = soup.get_text()
        location_patterns = [
            r'(?:located|based|headquartered)\s+(?:in|at)\s+([A-Z][a-z]+(?:,\s*[A-Z]{2,3})?)',
            r'(?:offices?\s+in|locations?\s+in)\s+([A-Z][a-z]+(?:,\s*[A-Z]{2,3})?)',
            r'([A-Z][a-z]+,\s*[A-Z]{2})\s+(?:headquarters|office|location)',
            r'(?:address|location):\s*([A-Z][a-zA-Z\s,]+)',
            r'(?:city|town):\s*([A-Z][a-z]+)',
        ]
        
        for pattern in location_patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if isinstance(match, str) and len(match) > 2:
                    return match.strip()
        
        return 'Unknown'
    
    def _extract_description(self, soup):
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
        
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = p.get_text().strip()
            if 50 <= len(text) <= 400:
                return text
        
        return 'No description available'
    
    def _extract_company_size(self, soup):
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
        content = soup.get_text()
        
        revenue_patterns = [
            r'\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|M|B)(?:\s+(?:revenue|sales|annual))?',
            r'(?:revenue|sales)\s*:?\s*\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|M|B)?',
            r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|M|B)\s+(?:in\s+)?(?:revenue|sales)'
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
        contact_info = []
        content = soup.get_text()
        
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
        
        phone_pattern = r'(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}'
        phones = re.findall(phone_pattern, content)
        if phones:
            contact_info.append(f"Phone: {phones[0]}")
        
        return ', '.join(contact_info[:2]) if contact_info else 'Contact info not found'
    
    def _extract_social_media(self, soup):
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
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            element.decompose()
        
        main_content = soup.find('main') or soup.find('body')
        if main_content:
            text = main_content.get_text(separator=' ', strip=True)
            text = ' '.join(text.split())
            return text[:2000]
        
        return 'No content extracted'
    
    def _extract_services(self, soup):
        service_keywords = ['services', 'solutions', 'products', 'what we do']
        
        for keyword in service_keywords:
            sections = soup.find_all(['div', 'section'], class_=re.compile(keyword, re.I))
            for section in sections:
                items = section.find_all(['li', 'h3', 'h4'])
                if items:
                    services = [item.get_text().strip() for item in items[:3]]
                    return ', '.join(services)
        
        return 'Services not specified'
    
    def _extract_target_market(self, soup):
        content = soup.get_text().lower()
        
        markets = {
            'Enterprise': ['enterprise', 'large companies', 'corporations'],
            'SMB': ['small business', 'smb', 'startups'],
            'Consumer': ['consumer', 'individual', 'personal'],
            'Developers': ['developers', 'engineers', 'technical']
        }
        
        for market, keywords in markets.items():
            if any(keyword in content for keyword in keywords):
                return market
        
        return 'General Market'
    
    def _extract_technologies(self, soup):
        content = soup.get_text().lower()
        
        tech_keywords = [
            'react', 'vue', 'angular', 'javascript', 'python', 'java',
            'aws', 'azure', 'api', 'cloud', 'mobile', 'web'
        ]
        
        found_tech = [tech for tech in tech_keywords if tech in content]
        return ', '.join(found_tech[:6]) if found_tech else 'Not specified'
    
    def _extract_employees(self, soup):
        content = soup.get_text()
        
        employee_patterns = [
            r'(\d+(?:,\d{3})*)\s*(?:employees?|staff|team members)',
            r'(?:team|staff)\s+(?:of\s+)?(\d+(?:,\d{3})*)'
        ]
        
        for pattern in employee_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                count = match.group(1).replace(',', '')
                return f"{count} employees"
        
        return 'Not specified'

def test_scraper():
    print("🧪 Testing Business Scraper...")
    scraper = BusinessScraper()
    
    result = scraper.scrape_business("https://google.com")
    
    if result['success']:
        data = result['data']
        print(f"✅ Company: {data['company_name']}")
        print(f"🏢 Type: {data['business_type']}")
        print(f"📍 Location: {data['location']}")
        print(f"📅 Founded: {data['founded_year']}")
        print(f"💼 Business Model: {data['business_model']}")
        print(f"🎯 Competitive Advantages: {data['competitive_advantages']}")
        print(f"👥 Key People: {data['key_executives']}")
    else:
        print(f"❌ Failed: {result['error']}")

if __name__ == "__main__":
    test_scraper()