#!/usr/bin/env python3
"""
Backend Authentication Testing for Adltrack
Tests signup, login, and dashboard access flows
"""

import requests
import json
import time
from datetime import datetime

# Get backend URL from frontend env
BACKEND_URL = "https://fullscreen-hero-2.preview.emergentagent.com/api"

def test_client_signup():
    """Test 1: Client Signup Flow"""
    print("\n=== Test 1: Client Signup Flow ===")
    
    # Create unique email with timestamp
    timestamp = int(time.time())
    email = f"testfamily_{timestamp}@test.com"
    
    signup_data = {
        "name": "Test Family User",
        "email": email,
        "password": "password123",
        "role": "client"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/signup", json=signup_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                print("✅ PASS: Signup successful - contains access_token and user object")
                return {
                    "success": True,
                    "email": email,
                    "password": "password123",
                    "token": data["access_token"],
                    "user": data["user"]
                }
            else:
                print("❌ FAIL: Response missing access_token or user object")
                return {"success": False}
        else:
            print(f"❌ FAIL: Signup failed with status {response.status_code}")
            return {"success": False}
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return {"success": False}

def test_client_login(email, password):
    """Test 2: Login Flow"""
    print("\n=== Test 2: Login Flow ===")
    
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                print("✅ PASS: Login successful - contains access_token and user object")
                return {
                    "success": True,
                    "token": data["access_token"],
                    "user": data["user"]
                }
            else:
                print("❌ FAIL: Response missing access_token or user object")
                return {"success": False}
        else:
            print(f"❌ FAIL: Login failed with status {response.status_code}")
            return {"success": False}
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return {"success": False}

def test_dashboard_access(token):
    """Test 3: Dashboard Access with Authorization"""
    print("\n=== Test 3: Dashboard Access ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BACKEND_URL}/bookings", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ PASS: Dashboard access successful - returns 200")
            return {"success": True}
        else:
            print(f"❌ FAIL: Dashboard access failed with status {response.status_code}")
            return {"success": False}
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return {"success": False}

def test_agency_signup():
    """Test 4: Agency Signup"""
    print("\n=== Test 4: Agency Signup ===")
    
    # Create unique email with timestamp
    timestamp = int(time.time())
    email = f"testagency_{timestamp}@test.com"
    
    signup_data = {
        "name": "Test Care Agency",
        "email": email,
        "password": "agency123",
        "role": "agency"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/signup", json=signup_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print("✅ PASS: Agency signup successful - contains access_token")
                return {"success": True, "token": data["access_token"]}
            else:
                print("❌ FAIL: Response missing access_token")
                return {"success": False}
        else:
            print(f"❌ FAIL: Agency signup failed with status {response.status_code}")
            return {"success": False}
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return {"success": False}

def main():
    """Run all authentication tests"""
    print("🚀 Starting Adltrack Authentication Testing")
    print(f"Backend URL: {BACKEND_URL}")
    
    results = {
        "client_signup": False,
        "client_login": False,
        "dashboard_access": False,
        "agency_signup": False
    }
    
    # Test 1: Client Signup
    signup_result = test_client_signup()
    results["client_signup"] = signup_result["success"]
    
    if signup_result["success"]:
        # Test 2: Login with same credentials
        login_result = test_client_login(signup_result["email"], signup_result["password"])
        results["client_login"] = login_result["success"]
        
        if login_result["success"]:
            # Test 3: Dashboard access with token
            dashboard_result = test_dashboard_access(login_result["token"])
            results["dashboard_access"] = dashboard_result["success"]
    
    # Test 4: Agency Signup (independent test)
    agency_result = test_agency_signup()
    results["agency_signup"] = agency_result["success"]
    
    # Summary
    print("\n" + "="*50)
    print("🏁 AUTHENTICATION TEST SUMMARY")
    print("="*50)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All authentication tests PASSED!")
        return True
    else:
        print("⚠️  Some authentication tests FAILED!")
        return False

if __name__ == "__main__":
    main()