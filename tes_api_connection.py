#!/usr/bin/env python3
"""
Test API connection and troubleshoot issues
"""
import requests
import json
from datetime import datetime

def test_api_connection():
    """Test API connection and endpoints"""
    print("🔍 Testing API Connection...")
    print("=" * 50)
    
    base_url = "http://localhost:5001"
    
    # Test 1: Basic connectivity
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print("✅ Basic connectivity: PASSED")
        print(f"   Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Basic connectivity: FAILED")
        print("   Error: Cannot connect to localhost:5001")
        print("   Solution: Make sure to run 'python app.py' first")
        return False
    except Exception as e:
        print(f"❌ Basic connectivity: FAILED - {e}")
        return False
    
    # Test 2: Test endpoint
    try:
        response = requests.get(f"{base_url}/api/test", timeout=5)
        if response.status_code == 200:
            print("✅ Test endpoint: PASSED")
            data = response.json()
            print(f"   Response: {data['message']}")
        else:
            print(f"❌ Test endpoint: FAILED - HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Test endpoint: FAILED - {e}")
    
    # Test 3: Health check
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check: PASSED")
            data = response.json()
            print(f"   Status: {data['status']}")
        else:
            print(f"❌ Health check: FAILED - HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Health check: FAILED - {e}")
    
    # Test 4: CORS headers
    try:
        response = requests.options(f"{base_url}/api/test", timeout=5)
        print("✅ CORS preflight: PASSED")
        print(f"   Status: {response.status_code}")
        
        # Check CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        for header, value in cors_headers.items():
            if value:
                print(f"   {header}: {value}")
            else:
                print(f"   {header}: NOT SET")
                
    except Exception as e:
        print(f"❌ CORS preflight: FAILED - {e}")
    
    # Test 5: Sample analyze request
    try:
        test_data = {"url": "https://google.com"}
        response = requests.post(
            f"{base_url}/api/analyze",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Sample analyze request: PASSED")
            data = response.json()
            if data.get('success'):
                print(f"   Analyzed: {data['data']['company_name']}")
            else:
                print(f"   Error: {data.get('error', 'Unknown error')}")
        else:
            print(f"❌ Sample analyze request: FAILED - HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Sample analyze request: FAILED - {e}")
    
    print("\n" + "=" * 50)
    print("🔧 Troubleshooting Tips:")
    print("1. Make sure Flask server is running: python app.py")
    print("2. Check that port 5001 is not blocked by firewall")
    print("3. Try accessing http://localhost:5001 directly in browser")
    print("4. Check console logs for detailed error messages")
    print("5. Ensure all dependencies are installed: pip install -r requirements.txt")
    
    return True

if __name__ == "__main__":
    print(f"🕐 API Connection Test started at: {datetime.now()}")
    test_api_connection()
    print(f"🕐 Test completed at: {datetime.now()}")