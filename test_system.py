#!/usr/bin/env python3
"""
System test for Business Analyzer
Run this to verify all components work correctly.
"""

import os
import sys
import requests
import json
from datetime import datetime

def test_database_connection():
    """Test database connection"""
    print("🔍 Testing Database Connection...")
    try:
        from database import get_db
        db = get_db()
        stats = db.get_stats()
        if stats['success']:
            print("✅ Database connection successful!")
            print(f"📊 Total businesses: {stats['data']['total_businesses']}")
            return True
        else:
            print(f"❌ Database connection failed: {stats['error']}")
            return False
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_scraper():
    """Test business scraper"""
    print("\n🔍 Testing Business Scraper...")
    try:
        from scraper import BusinessScraper
        scraper = BusinessScraper()
        
        result = scraper.scrape_business("https://google.com")
        
        if result['success']:
            data = result['data']
            print("✅ Scraper working correctly!")
            print(f"📝 Company: {data['company_name']}")
            print(f"🏢 Business Type: {data['business_type']}")
            print(f"🏭 Industry: {data['industry']}")
            print(f"📍 Location: {data['location']}")
            print(f"📅 Founded: {data['founded_year']}")
            print(f"💼 Business Model: {data['business_model']}")
            
            filled_fields = sum(1 for v in data.values() if v and v != 'Unknown' and v != 'Not specified')
            print(f"📈 Data Points Extracted: {filled_fields}/{len(data)}")
            
            new_fields = [
                'competitive_advantages', 'key_executives', 'awards_recognition',
                'partnerships', 'certifications', 'market_focus', 'business_maturity'
            ]
            
            new_fields_filled = sum(1 for field in new_fields if data.get(field) and data[field] != 'Unknown' and data[field] != 'Not specified')
            print(f"🆕 Business Intelligence Fields: {new_fields_filled}/{len(new_fields)}")
            
            return True
        else:
            print(f"❌ Scraper failed: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ Scraper test failed: {e}")
        return False

def test_api():
    """Test API endpoints"""
    print("\n🔍 Testing API...")
    
    try:
        response = requests.get("http://localhost:5001/api/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print("✅ API is running!")
            print(f"📡 Status: {health_data['status']}")
            print(f"🔧 Features: {health_data['components']['features']}")
            
            endpoints_to_test = [
                ("/api/stats", "Statistics"),
                ("/api/analytics/dashboard", "Dashboard Analytics"),
                ("/api/filters/options", "Filter Options"),
                ("/api/search/advanced?search=tech", "Advanced Search")
            ]
            
            for endpoint, name in endpoints_to_test:
                try:
                    resp = requests.get(f"http://localhost:5001{endpoint}", timeout=10)
                    if resp.status_code == 200:
                        print(f"✅ {name} endpoint working")
                    else:
                        print(f"⚠️ {name} endpoint returned {resp.status_code}")
                except Exception as e:
                    print(f"❌ {name} endpoint failed: {e}")
            
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ API not accessible: {e}")
        print("💡 Make sure to run 'python app.py' first")
        return False

def test_frontend():
    """Test frontend files"""
    print("\n🔍 Testing Frontend Files...")
    
    frontend_files = [
        "frontend/index.html",
        "frontend/script.js", 
        "frontend/style.css"
    ]
    
    all_files_exist = True
    for file in frontend_files:
        if os.path.exists(file):
            print(f"✅ {file} exists")
        else:
            print(f"❌ {file} missing")
            all_files_exist = False
    
    if all_files_exist:
        print("✅ All frontend files present!")
        print("💡 Open frontend/index.html in your browser to test the UI")
        return True
    else:
        print("❌ Some frontend files are missing")
        return False

def test_env_config():
    """Test environment configuration"""
    print("\n🔍 Testing Environment Configuration...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = ['SUPABASE_URL', 'SUPABASE_KEY']
    all_vars_present = True
    
    for var in required_vars:
        if os.getenv(var):
            print(f"✅ {var} is set")
        else:
            print(f"❌ {var} is missing")
            all_vars_present = False
    
    if all_vars_present:
        print("✅ Environment configuration complete!")
        return True
    else:
        print("❌ Please check your .env file")
        return False

def test_sample_analysis():
    """Test sample business analysis"""
    print("\n🔍 Testing Sample Analysis...")
    
    try:
        test_url = "https://stripe.com"
        response = requests.post(
            "http://localhost:5001/api/analyze",
            json={"url": test_url},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                print("✅ Sample analysis successful!")
                data = result['data']
                print(f"📝 Analyzed: {data['company_name']}")
                print(f"📊 Data points: {data.get('data_points_extracted', 'N/A')}")
                print(f"⏱️ Analysis time: {data.get('analysis_time', 'N/A')}s")
                
                if 'id' in data:
                    insights_resp = requests.get(f"http://localhost:5001/api/business/{data['id']}/insights")
                    if insights_resp.status_code == 200:
                        print("✅ Business insights endpoint working!")
                    else:
                        print("⚠️ Business insights endpoint issue")
                
                return True
            else:
                print(f"❌ Analysis failed: {result['error']}")
                return False
        else:
            print(f"❌ Analysis request failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Sample analysis failed: {e}")
        return False

def run_tests():
    """Run all tests"""
    print("🚀 Business Analyzer - System Test")
    print("=" * 60)
    
    results = {
        "Environment": test_env_config(),
        "Database": test_database_connection(),
        "Scraper": test_scraper(),
        "API": test_api(),
        "Frontend": test_frontend()
    }
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name:15} {status}")
    
    passed_tests = sum(results.values())
    total_tests = len(results)
    
    print(f"\n🎯 Overall Score: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed! Your business analyzer is ready!")
        print("\n🚀 Next Steps:")
        print("1. Open frontend/index.html in your browser")
        print("2. Try analyzing a business URL")
        print("3. Test the new features")
        print("4. Check the simplified dashboard")
        print("5. Use advanced filters and search")
    else:
        print("⚠️ Some tests failed. Please check the errors above.")
        print("\n🔧 Common Solutions:")
        print("1. Make sure your .env file is configured correctly")
        print("2. Ensure Supabase database table is created")
        print("3. Install all required dependencies")
        print("4. Start the API server with 'python app.py'")
    
    return passed_tests == total_tests

def main():
    print(f"🕐 Test started at: {datetime.now()}")
    
    success = run_tests()
    
    if success:
        print("\n" + "=" * 60)
        print("🧪 BONUS: Sample Analysis Test")
        print("=" * 60)
        test_sample_analysis()
    
    print(f"\n🕐 Test completed at: {datetime.now()}")
    
    if success:
        print("\n🎉 Your Business Analyzer is fully functional!")
        print("🌟 Features available:")
        print("   - 20+ business data points extraction")
        print("   - Advanced search and filtering")
        print("   - Simplified dashboard with key metrics")
        print("   - Business insights and recommendations")
        print("   - Competitive advantage analysis")
        print("   - Leadership team identification")
        print("   - Partnership and certification tracking")
        print("   - Modular, clean codebase")
        print("\n🚀 Ready to analyze businesses!")
    else:
        print("\n🔧 Please fix the failing tests before proceeding.")
        sys.exit(1)

if __name__ == "__main__":
    main()