#!/usr/bin/env python3
"""
Express Housing Backend API Test Suite
Tests all backend endpoints for the Express Housing platform
"""
import requests
import json
from datetime import datetime, timedelta

# Backend URL from frontend/.env
BASE_URL = "https://fullscreen-hero-2.preview.emergentagent.com/api"

# Test credentials from /app/memory/test_credentials.md
TEST_EMAIL = "guest@expresshousing.com"
TEST_PASSWORD = "stay2025"
TEST_NAME = "Test Guest"

# Global token storage
auth_token = None
test_apartment_id = None
test_booking_id = None

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_result(passed, message):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {message}")

def print_response(response):
    print(f"Status: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

# ===== TEST 1: Health Check =====
def test_health_check():
    print_test("GET /api/ - Health Check")
    try:
        response = requests.get(f"{BASE_URL}/")
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if "Express Housing" in data.get("message", ""):
                print_result(True, "Health check passed - Express Housing API is running")
                return True
            else:
                print_result(False, f"Health check message incorrect: {data.get('message')}")
                return False
        else:
            print_result(False, f"Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Health check error: {str(e)}")
        return False

# ===== TEST 2: Get All Apartments =====
def test_get_apartments():
    print_test("GET /api/apartments - Get All Apartments")
    global test_apartment_id
    try:
        response = requests.get(f"{BASE_URL}/apartments")
        print_response(response)
        
        if response.status_code == 200:
            apartments = response.json()
            if len(apartments) == 12:
                print_result(True, f"Found 12 seeded apartments")
                
                # Verify structure of first apartment
                apt = apartments[0]
                required_fields = ["id", "title", "building_name", "neighborhood", "apt_type", 
                                 "bedrooms", "bathrooms", "max_guests", "sqft", "nightly_rate", 
                                 "monthly_rate", "amenities", "images", "stay_paths", "rating", 
                                 "is_featured", "is_new", "min_nights", "reviews"]
                
                missing_fields = [f for f in required_fields if f not in apt]
                if missing_fields:
                    print_result(False, f"Missing fields: {missing_fields}")
                    return False
                
                print_result(True, f"All required fields present in apartment data")
                test_apartment_id = apt["id"]
                print(f"Saved test apartment ID: {test_apartment_id}")
                return True
            else:
                print_result(False, f"Expected 12 apartments, got {len(apartments)}")
                return False
        else:
            print_result(False, f"Failed with status {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

# ===== TEST 3: Filter Tests =====
def test_filters():
    print_test("GET /api/apartments - Filter Tests")
    all_passed = True
    
    # Test 3a: Featured filter
    print("\n--- Filter: featured=true ---")
    try:
        response = requests.get(f"{BASE_URL}/apartments?featured=true")
        print_response(response)
        if response.status_code == 200:
            apartments = response.json()
            if len(apartments) == 5:
                print_result(True, f"Featured filter: 5 results")
            else:
                print_result(False, f"Featured filter: expected 5, got {len(apartments)}")
                all_passed = False
        else:
            print_result(False, f"Featured filter failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Featured filter error: {str(e)}")
        all_passed = False
    
    # Test 3b: Apartment type filter
    print("\n--- Filter: apt_type=Studio ---")
    try:
        response = requests.get(f"{BASE_URL}/apartments?apt_type=Studio")
        print_response(response)
        if response.status_code == 200:
            apartments = response.json()
            studios = [a for a in apartments if a["apt_type"] == "Studio"]
            if len(studios) == len(apartments) and len(studios) > 0:
                print_result(True, f"Studio filter: {len(studios)} studios only")
            else:
                print_result(False, f"Studio filter: got non-studio apartments")
                all_passed = False
        else:
            print_result(False, f"Studio filter failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Studio filter error: {str(e)}")
        all_passed = False
    
    # Test 3c: Neighborhood filter
    print("\n--- Filter: neighborhood=Old City ---")
    try:
        response = requests.get(f"{BASE_URL}/apartments?neighborhood=Old City")
        print_response(response)
        if response.status_code == 200:
            apartments = response.json()
            if len(apartments) == 2:
                print_result(True, f"Old City filter: 2 results")
            else:
                print_result(False, f"Old City filter: expected 2, got {len(apartments)}")
                all_passed = False
        else:
            print_result(False, f"Old City filter failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Old City filter error: {str(e)}")
        all_passed = False
    
    # Test 3d: Guests filter
    print("\n--- Filter: guests=5 ---")
    try:
        response = requests.get(f"{BASE_URL}/apartments?guests=5")
        print_response(response)
        if response.status_code == 200:
            apartments = response.json()
            valid = all(a["max_guests"] >= 5 for a in apartments)
            if valid and len(apartments) > 0:
                print_result(True, f"Guests filter: {len(apartments)} apartments with max_guests >= 5")
            else:
                print_result(False, f"Guests filter: invalid results")
                all_passed = False
        else:
            print_result(False, f"Guests filter failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Guests filter error: {str(e)}")
        all_passed = False
    
    # Test 3e: Price range filter
    print("\n--- Filter: min_price=150&max_price=250 ---")
    try:
        response = requests.get(f"{BASE_URL}/apartments?min_price=150&max_price=250")
        print_response(response)
        if response.status_code == 200:
            apartments = response.json()
            valid = all(150 <= a["nightly_rate"] <= 250 for a in apartments)
            if valid and len(apartments) > 0:
                print_result(True, f"Price filter: {len(apartments)} apartments in $150-$250 range")
            else:
                print_result(False, f"Price filter: invalid results")
                all_passed = False
        else:
            print_result(False, f"Price filter failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Price filter error: {str(e)}")
        all_passed = False
    
    # Test 3f: Stay path filter
    print("\n--- Filter: stay_path=medical ---")
    try:
        response = requests.get(f"{BASE_URL}/apartments?stay_path=medical")
        print_response(response)
        if response.status_code == 200:
            apartments = response.json()
            valid = all("medical" in a["stay_paths"] for a in apartments)
            if valid and len(apartments) > 0:
                print_result(True, f"Stay path filter: {len(apartments)} apartments with medical stay path")
            else:
                print_result(False, f"Stay path filter: invalid results")
                all_passed = False
        else:
            print_result(False, f"Stay path filter failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Stay path filter error: {str(e)}")
        all_passed = False
    
    # Test 3g: Search filter
    print("\n--- Filter: search=rittenhouse ---")
    try:
        response = requests.get(f"{BASE_URL}/apartments?search=rittenhouse")
        print_response(response)
        if response.status_code == 200:
            apartments = response.json()
            if len(apartments) > 0:
                print_result(True, f"Search filter: {len(apartments)} apartments matching 'rittenhouse'")
            else:
                print_result(False, f"Search filter: no results for 'rittenhouse'")
                all_passed = False
        else:
            print_result(False, f"Search filter failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Search filter error: {str(e)}")
        all_passed = False
    
    # Test 3h: Sort filter
    print("\n--- Filter: sort=price_asc ---")
    try:
        response = requests.get(f"{BASE_URL}/apartments?sort=price_asc")
        print_response(response)
        if response.status_code == 200:
            apartments = response.json()
            prices = [a["nightly_rate"] for a in apartments]
            if prices == sorted(prices):
                print_result(True, f"Sort filter: apartments sorted by price ascending")
            else:
                print_result(False, f"Sort filter: apartments not properly sorted")
                all_passed = False
        else:
            print_result(False, f"Sort filter failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Sort filter error: {str(e)}")
        all_passed = False
    
    return all_passed

# ===== TEST 4: Get Single Apartment =====
def test_get_apartment_by_id():
    print_test("GET /api/apartments/{id} - Get Single Apartment")
    global test_apartment_id
    
    if not test_apartment_id:
        print_result(False, "No test apartment ID available")
        return False
    
    all_passed = True
    
    # Test 4a: Valid ID
    print("\n--- Valid apartment ID ---")
    try:
        response = requests.get(f"{BASE_URL}/apartments/{test_apartment_id}")
        print_response(response)
        if response.status_code == 200:
            apartment = response.json()
            if apartment["id"] == test_apartment_id:
                print_result(True, f"Retrieved apartment: {apartment['title']}")
            else:
                print_result(False, f"Wrong apartment returned")
                all_passed = False
        else:
            print_result(False, f"Failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 4b: Invalid ID
    print("\n--- Invalid apartment ID ---")
    try:
        response = requests.get(f"{BASE_URL}/apartments/invalid-id-12345")
        print_response(response)
        if response.status_code == 404:
            print_result(True, f"Invalid ID correctly returns 404")
        else:
            print_result(False, f"Invalid ID should return 404, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    return all_passed

# ===== TEST 5: Get Neighborhoods =====
def test_get_neighborhoods():
    print_test("GET /api/neighborhoods - Get Neighborhoods")
    try:
        response = requests.get(f"{BASE_URL}/neighborhoods")
        print_response(response)
        
        if response.status_code == 200:
            neighborhoods = response.json()
            if len(neighborhoods) > 0:
                # Verify structure
                n = neighborhoods[0]
                required_fields = ["name", "count", "image", "min_rate"]
                missing_fields = [f for f in required_fields if f not in n]
                
                if missing_fields:
                    print_result(False, f"Missing fields: {missing_fields}")
                    return False
                
                print_result(True, f"Found {len(neighborhoods)} neighborhoods with correct structure")
                return True
            else:
                print_result(False, f"No neighborhoods returned")
                return False
        else:
            print_result(False, f"Failed with status {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

# ===== TEST 6: Auth Flow =====
def test_auth_flow():
    print_test("Auth Flow - Signup/Login/Me")
    global auth_token
    all_passed = True
    
    # Test 6a: Signup (or use existing account)
    print("\n--- POST /api/auth/signup ---")
    try:
        signup_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "role": "guest"
        }
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            auth_token = data.get("access_token")
            print_result(True, f"Signup successful, got token")
        elif response.status_code == 400 and "already registered" in response.text:
            print_result(True, f"User already exists, will use login")
        else:
            print_result(False, f"Signup failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Signup error: {str(e)}")
        all_passed = False
    
    # Test 6b: Login
    print("\n--- POST /api/auth/login ---")
    try:
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            auth_token = data.get("access_token")
            user = data.get("user")
            if auth_token and user:
                print_result(True, f"Login successful, user: {user.get('name')}")
            else:
                print_result(False, f"Login response missing token or user")
                all_passed = False
        else:
            print_result(False, f"Login failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Login error: {str(e)}")
        all_passed = False
    
    # Test 6c: Get Me
    print("\n--- GET /api/auth/me ---")
    if auth_token:
        try:
            headers = {"Authorization": f"Bearer {auth_token}"}
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            print_response(response)
            
            if response.status_code == 200:
                user = response.json()
                if user.get("email") == TEST_EMAIL:
                    print_result(True, f"Auth/me successful, verified user: {user.get('name')}")
                else:
                    print_result(False, f"Auth/me returned wrong user")
                    all_passed = False
            else:
                print_result(False, f"Auth/me failed with status {response.status_code}")
                all_passed = False
        except Exception as e:
            print_result(False, f"Auth/me error: {str(e)}")
            all_passed = False
    else:
        print_result(False, f"No auth token available")
        all_passed = False
    
    return all_passed

# ===== TEST 7: Bookings =====
def test_bookings():
    print_test("Bookings - Create and Retrieve")
    global auth_token, test_apartment_id, test_booking_id
    
    if not auth_token:
        print_result(False, "No auth token available")
        return False
    
    if not test_apartment_id:
        print_result(False, "No test apartment ID available")
        return False
    
    all_passed = True
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test 7a: Create booking without token
    print("\n--- POST /api/bookings without token (should fail) ---")
    try:
        check_in = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        check_out = (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d")
        booking_data = {
            "apartment_id": test_apartment_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2,
            "purpose": "business"
        }
        response = requests.post(f"{BASE_URL}/bookings", json=booking_data)
        print_response(response)
        
        if response.status_code == 401:
            print_result(True, f"Booking without token correctly returns 401")
        else:
            print_result(False, f"Booking without token should return 401, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 7b: Create valid booking (5 nights)
    print("\n--- POST /api/bookings with valid data (5 nights) ---")
    try:
        check_in = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        check_out = (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d")
        booking_data = {
            "apartment_id": test_apartment_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2,
            "purpose": "business"
        }
        response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)
        print_response(response)
        
        if response.status_code == 200:
            booking = response.json()
            test_booking_id = booking.get("id")
            
            # Verify booking details
            if booking.get("status") == "pending":
                print_result(True, f"Booking status is 'pending'")
            else:
                print_result(False, f"Booking status should be 'pending', got {booking.get('status')}")
                all_passed = False
            
            if booking.get("nights") == 5:
                print_result(True, f"Booking nights calculated correctly: 5")
            else:
                print_result(False, f"Booking nights should be 5, got {booking.get('nights')}")
                all_passed = False
            
            # Get apartment to verify price calculation
            apt_response = requests.get(f"{BASE_URL}/apartments/{test_apartment_id}")
            if apt_response.status_code == 200:
                apt = apt_response.json()
                expected_price = round(apt["nightly_rate"] * 5, 2)
                if booking.get("total_price") == expected_price:
                    print_result(True, f"Booking price calculated correctly: ${expected_price}")
                else:
                    print_result(False, f"Booking price should be ${expected_price}, got ${booking.get('total_price')}")
                    all_passed = False
        else:
            print_result(False, f"Booking creation failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 7c: Create long stay booking (30 nights - monthly rate)
    print("\n--- POST /api/bookings with 30 nights (monthly pro-rate) ---")
    try:
        check_in = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")
        check_out = (datetime.now() + timedelta(days=44)).strftime("%Y-%m-%d")
        booking_data = {
            "apartment_id": test_apartment_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2,
            "purpose": "relocation"
        }
        response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)
        print_response(response)
        
        if response.status_code == 200:
            booking = response.json()
            
            # Get apartment to verify monthly price calculation
            apt_response = requests.get(f"{BASE_URL}/apartments/{test_apartment_id}")
            if apt_response.status_code == 200:
                apt = apt_response.json()
                expected_price = round(apt["monthly_rate"] / 30 * 30, 2)
                if booking.get("total_price") == expected_price:
                    print_result(True, f"Long stay price calculated with monthly rate: ${expected_price}")
                else:
                    print_result(False, f"Long stay price should be ${expected_price}, got ${booking.get('total_price')}")
                    all_passed = False
        else:
            print_result(False, f"Long stay booking failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 7d: Validation - check_out before check_in
    print("\n--- POST /api/bookings with check_out before check_in (should fail) ---")
    try:
        check_in = (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d")
        check_out = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        booking_data = {
            "apartment_id": test_apartment_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2
        }
        response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)
        print_response(response)
        
        if response.status_code == 400:
            print_result(True, f"Invalid dates correctly return 400")
        else:
            print_result(False, f"Invalid dates should return 400, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 7e: Validation - nights below min_nights
    print("\n--- POST /api/bookings with nights below min_nights (should fail) ---")
    try:
        check_in = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        check_out = (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d")  # 1 night
        booking_data = {
            "apartment_id": test_apartment_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2
        }
        response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)
        print_response(response)
        
        if response.status_code == 400 and "Minimum stay" in response.text:
            print_result(True, f"Below min_nights correctly returns 400")
        else:
            print_result(False, f"Below min_nights should return 400 with 'Minimum stay' message")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 7f: Validation - guests > max_guests
    print("\n--- POST /api/bookings with guests > max_guests (should fail) ---")
    try:
        # Get apartment max_guests
        apt_response = requests.get(f"{BASE_URL}/apartments/{test_apartment_id}")
        if apt_response.status_code == 200:
            apt = apt_response.json()
            max_guests = apt["max_guests"]
            
            check_in = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            check_out = (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d")
            booking_data = {
                "apartment_id": test_apartment_id,
                "check_in": check_in,
                "check_out": check_out,
                "guests": max_guests + 10  # Exceed max
            }
            response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)
            print_response(response)
            
            if response.status_code == 400 and "Maximum" in response.text:
                print_result(True, f"Exceeding max_guests correctly returns 400")
            else:
                print_result(False, f"Exceeding max_guests should return 400 with 'Maximum' message")
                all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 7g: Validation - bad apartment_id
    print("\n--- POST /api/bookings with invalid apartment_id (should fail) ---")
    try:
        check_in = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        check_out = (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d")
        booking_data = {
            "apartment_id": "invalid-apartment-id-12345",
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2
        }
        response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)
        print_response(response)
        
        if response.status_code == 404:
            print_result(True, f"Invalid apartment_id correctly returns 404")
        else:
            print_result(False, f"Invalid apartment_id should return 404, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 7h: Get user bookings
    print("\n--- GET /api/bookings (retrieve user bookings) ---")
    try:
        response = requests.get(f"{BASE_URL}/bookings", headers=headers)
        print_response(response)
        
        if response.status_code == 200:
            bookings = response.json()
            if len(bookings) >= 2:  # We created 2 valid bookings
                # Verify sorted by newest first
                dates = [b["created_at"] for b in bookings]
                if dates == sorted(dates, reverse=True):
                    print_result(True, f"Retrieved {len(bookings)} bookings, sorted newest first")
                else:
                    print_result(False, f"Bookings not sorted newest first")
                    all_passed = False
            else:
                print_result(False, f"Expected at least 2 bookings, got {len(bookings)}")
                all_passed = False
        else:
            print_result(False, f"Get bookings failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    return all_passed

# ===== TEST 8: Wishlist =====
def test_wishlist():
    print_test("Wishlist - Toggle and Retrieve")
    global auth_token, test_apartment_id
    
    if not auth_token:
        print_result(False, "No auth token available")
        return False
    
    if not test_apartment_id:
        print_result(False, "No test apartment ID available")
        return False
    
    all_passed = True
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test 8a: Add to wishlist
    print("\n--- POST /api/wishlist/{apartment_id} (add) ---")
    try:
        response = requests.post(f"{BASE_URL}/wishlist/{test_apartment_id}", headers=headers)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("saved") == True:
                print_result(True, f"Apartment added to wishlist")
            else:
                print_result(False, f"Expected saved=true, got {data.get('saved')}")
                all_passed = False
        else:
            print_result(False, f"Add to wishlist failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 8b: Remove from wishlist (toggle again)
    print("\n--- POST /api/wishlist/{apartment_id} (remove) ---")
    try:
        response = requests.post(f"{BASE_URL}/wishlist/{test_apartment_id}", headers=headers)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("saved") == False:
                print_result(True, f"Apartment removed from wishlist")
            else:
                print_result(False, f"Expected saved=false, got {data.get('saved')}")
                all_passed = False
        else:
            print_result(False, f"Remove from wishlist failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 8c: Add back to wishlist for next tests
    print("\n--- POST /api/wishlist/{apartment_id} (add again) ---")
    try:
        response = requests.post(f"{BASE_URL}/wishlist/{test_apartment_id}", headers=headers)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("saved") == True:
                print_result(True, f"Apartment added back to wishlist")
            else:
                print_result(False, f"Expected saved=true")
                all_passed = False
        else:
            print_result(False, f"Add to wishlist failed")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 8d: Get wishlist IDs
    print("\n--- GET /api/wishlist/ids ---")
    try:
        response = requests.get(f"{BASE_URL}/wishlist/ids", headers=headers)
        print_response(response)
        
        if response.status_code == 200:
            ids = response.json()
            if test_apartment_id in ids:
                print_result(True, f"Wishlist IDs retrieved, contains test apartment")
            else:
                print_result(False, f"Wishlist IDs missing test apartment")
                all_passed = False
        else:
            print_result(False, f"Get wishlist IDs failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    # Test 8e: Get wishlist apartments
    print("\n--- GET /api/wishlist (get apartment docs) ---")
    try:
        response = requests.get(f"{BASE_URL}/wishlist", headers=headers)
        print_response(response)
        
        if response.status_code == 200:
            apartments = response.json()
            if len(apartments) > 0:
                apt_ids = [a["id"] for a in apartments]
                if test_apartment_id in apt_ids:
                    print_result(True, f"Wishlist apartments retrieved, contains test apartment")
                else:
                    print_result(False, f"Wishlist apartments missing test apartment")
                    all_passed = False
            else:
                print_result(False, f"Wishlist is empty")
                all_passed = False
        else:
            print_result(False, f"Get wishlist failed with status {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        all_passed = False
    
    return all_passed

# ===== TEST 9: Contact Form =====
def test_contact():
    print_test("POST /api/contact - Contact Form")
    try:
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Inquiry",
            "message": "This is a test message from the automated test suite."
        }
        response = requests.post(f"{BASE_URL}/contact", json=contact_data)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") == True:
                print_result(True, f"Contact form submitted successfully")
                return True
            else:
                print_result(False, f"Contact form response missing success flag")
                return False
        else:
            print_result(False, f"Contact form failed with status {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

# ===== MAIN TEST RUNNER =====
def main():
    print("\n" + "="*80)
    print("EXPRESS HOUSING BACKEND API TEST SUITE")
    print("="*80)
    print(f"Backend URL: {BASE_URL}")
    print(f"Test User: {TEST_EMAIL}")
    print("="*80)
    
    results = {}
    
    # Run all tests
    results["Health Check"] = test_health_check()
    results["Get All Apartments"] = test_get_apartments()
    results["Apartment Filters"] = test_filters()
    results["Get Apartment by ID"] = test_get_apartment_by_id()
    results["Get Neighborhoods"] = test_get_neighborhoods()
    results["Auth Flow"] = test_auth_flow()
    results["Bookings"] = test_bookings()
    results["Wishlist"] = test_wishlist()
    results["Contact Form"] = test_contact()
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("="*80)
    print(f"TOTAL: {passed}/{total} tests passed")
    print("="*80)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
