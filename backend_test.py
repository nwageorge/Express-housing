#!/usr/bin/env python3
"""
Express Housing Backend Test Suite - NEW FEATURES
Tests: Admin Auth, Admin Bookings, Date Blocking, Photo Tours, Email Log (MOCKED)
"""
import requests
import json
from datetime import datetime, timedelta

# Base URL from frontend/.env
BASE_URL = "https://fullscreen-hero-2.preview.emergentagent.com/api"

# Test credentials from /app/memory/test_credentials.md
ADMIN_EMAIL = "admin@expresshousing.com"
ADMIN_PASSWORD = "admin2025"
GUEST_EMAIL = "guest@expresshousing.com"
GUEST_PASSWORD = "stay2025"

def log(msg):
    print(f"[TEST] {msg}")

def test_admin_auth():
    """Test 1: ADMIN AUTH - Login as admin and verify role, GET /api/admin/stats"""
    log("=" * 80)
    log("TEST 1: ADMIN AUTH")
    log("=" * 80)
    
    # 1.1: Admin login
    log("1.1: Admin login with admin@expresshousing.com/admin2025")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert resp.status_code == 200, f"Admin login failed: {resp.status_code} {resp.text}"
    data = resp.json()
    assert "access_token" in data, "No access_token in response"
    admin_token = data["access_token"]
    assert data["user"]["role"] == "admin", f"Expected role=admin, got {data['user']['role']}"
    log(f"✅ Admin login successful, token received, role=admin")
    
    # 1.2: GET /api/auth/me with admin token
    log("1.2: GET /api/auth/me with admin token")
    resp = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200, f"GET /api/auth/me failed: {resp.status_code}"
    me_data = resp.json()
    assert me_data["role"] == "admin", f"Expected role=admin in /auth/me, got {me_data['role']}"
    log(f"✅ GET /api/auth/me shows role=admin")
    
    # 1.3: GET /api/admin/stats without token → 401
    log("1.3: GET /api/admin/stats without token → expect 401")
    resp = requests.get(f"{BASE_URL}/admin/stats")
    assert resp.status_code == 401, f"Expected 401 without token, got {resp.status_code}"
    log(f"✅ GET /api/admin/stats without token returns 401")
    
    # 1.4: Guest login and try /api/admin/stats → 403
    log("1.4: Guest login and GET /api/admin/stats → expect 403")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": GUEST_EMAIL,
        "password": GUEST_PASSWORD
    })
    assert resp.status_code == 200, f"Guest login failed: {resp.status_code}"
    guest_token = resp.json()["access_token"]
    
    resp = requests.get(f"{BASE_URL}/admin/stats", headers={"Authorization": f"Bearer {guest_token}"})
    assert resp.status_code == 403, f"Expected 403 with guest token, got {resp.status_code}"
    log(f"✅ GET /api/admin/stats with guest token returns 403")
    
    # 1.5: GET /api/admin/stats with admin token → 200 with stats
    log("1.5: GET /api/admin/stats with admin token → expect 200 with stats")
    resp = requests.get(f"{BASE_URL}/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200, f"GET /api/admin/stats failed: {resp.status_code} {resp.text}"
    stats = resp.json()
    required_keys = ["pending", "confirmed", "completed", "cancelled", "revenue", "total", "apartments"]
    for key in required_keys:
        assert key in stats, f"Missing key '{key}' in stats response"
    log(f"✅ GET /api/admin/stats returns 200 with all required fields: {stats}")
    
    log("✅ TEST 1 PASSED: ADMIN AUTH\n")
    return admin_token, guest_token

def test_admin_bookings(admin_token, guest_token):
    """Test 2: ADMIN BOOKINGS - GET all bookings, filter by status, PATCH to update status, verify email log"""
    log("=" * 80)
    log("TEST 2: ADMIN BOOKINGS")
    log("=" * 80)
    
    # 2.1: Create a fresh booking as guest first (to ensure we have a pending booking)
    log("2.1: Create a fresh booking as guest (far-future dates to avoid conflicts)")
    
    # Get first apartment
    resp = requests.get(f"{BASE_URL}/apartments")
    assert resp.status_code == 200, f"GET /api/apartments failed: {resp.status_code}"
    apartments = resp.json()
    assert len(apartments) > 0, "No apartments found"
    apt = apartments[0]
    apt_id = apt["id"]
    log(f"Using apartment: {apt['title']} (id={apt_id})")
    
    # Create booking with far-future dates (2026-03-01 to 2026-03-06)
    check_in = "2026-03-01"
    check_out = "2026-03-06"
    resp = requests.post(f"{BASE_URL}/bookings", 
        headers={"Authorization": f"Bearer {guest_token}"},
        json={
            "apartment_id": apt_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2,
            "purpose": "business"
        }
    )
    assert resp.status_code == 200, f"Create booking failed: {resp.status_code} {resp.text}"
    booking = resp.json()
    booking_id = booking["id"]
    assert booking["status"] == "pending", f"Expected status=pending, got {booking['status']}"
    log(f"✅ Created booking {booking_id} with status=pending")
    
    # 2.2: GET /api/admin/bookings (admin) → all bookings
    log("2.2: GET /api/admin/bookings (admin) → all bookings")
    resp = requests.get(f"{BASE_URL}/admin/bookings", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200, f"GET /api/admin/bookings failed: {resp.status_code}"
    all_bookings = resp.json()
    assert isinstance(all_bookings, list), "Expected list of bookings"
    assert len(all_bookings) > 0, "Expected at least one booking"
    log(f"✅ GET /api/admin/bookings returns {len(all_bookings)} bookings")
    
    # 2.3: GET /api/admin/bookings?status=pending → filter works
    log("2.3: GET /api/admin/bookings?status=pending → filter works")
    resp = requests.get(f"{BASE_URL}/admin/bookings?status=pending", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200, f"GET /api/admin/bookings?status=pending failed: {resp.status_code}"
    pending_bookings = resp.json()
    assert isinstance(pending_bookings, list), "Expected list of bookings"
    # Verify all returned bookings have status=pending
    for b in pending_bookings:
        assert b["status"] == "pending", f"Expected status=pending, got {b['status']}"
    log(f"✅ GET /api/admin/bookings?status=pending returns {len(pending_bookings)} pending bookings")
    
    # 2.4: PATCH /api/admin/bookings/{id} with {"status":"confirmed"} → 200, status updated
    log(f"2.4: PATCH /api/admin/bookings/{booking_id} with status=confirmed")
    resp = requests.patch(f"{BASE_URL}/admin/bookings/{booking_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "confirmed"}
    )
    assert resp.status_code == 200, f"PATCH booking failed: {resp.status_code} {resp.text}"
    updated_booking = resp.json()
    assert updated_booking["status"] == "confirmed", f"Expected status=confirmed, got {updated_booking['status']}"
    log(f"✅ PATCH booking status to confirmed successful")
    
    # 2.5: Verify email was logged (GET /api/admin/emails contains "Your stay is confirmed")
    log("2.5: GET /api/admin/emails → verify confirmation email was logged")
    resp = requests.get(f"{BASE_URL}/admin/emails", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200, f"GET /api/admin/emails failed: {resp.status_code}"
    emails = resp.json()
    assert isinstance(emails, list), "Expected list of emails"
    
    # Find confirmation email for this booking
    confirmation_email = None
    for email in emails:
        if email.get("booking_id") == booking_id and "Your stay is confirmed" in email.get("subject", ""):
            confirmation_email = email
            break
    
    assert confirmation_email is not None, f"No confirmation email found for booking {booking_id}"
    assert confirmation_email["status"] == "sent (mocked)", f"Expected status='sent (mocked)', got {confirmation_email['status']}"
    log(f"✅ Confirmation email found in email log: {confirmation_email['subject']}")
    
    # 2.6: PATCH with invalid status "foo" → 400
    log("2.6: PATCH with invalid status 'foo' → expect 400")
    resp = requests.patch(f"{BASE_URL}/admin/bookings/{booking_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "foo"}
    )
    assert resp.status_code == 400, f"Expected 400 for invalid status, got {resp.status_code}"
    log(f"✅ PATCH with invalid status returns 400")
    
    # 2.7: PATCH with invalid booking id → 404
    log("2.7: PATCH with invalid booking id → expect 404")
    resp = requests.patch(f"{BASE_URL}/admin/bookings/invalid-id-12345",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "confirmed"}
    )
    assert resp.status_code == 404, f"Expected 404 for invalid booking id, got {resp.status_code}"
    log(f"✅ PATCH with invalid booking id returns 404")
    
    # 2.8: PATCH with guest token → 403
    log("2.8: PATCH with guest token → expect 403")
    resp = requests.patch(f"{BASE_URL}/admin/bookings/{booking_id}",
        headers={"Authorization": f"Bearer {guest_token}"},
        json={"status": "completed"}
    )
    assert resp.status_code == 403, f"Expected 403 with guest token, got {resp.status_code}"
    log(f"✅ PATCH with guest token returns 403")
    
    log("✅ TEST 2 PASSED: ADMIN BOOKINGS\n")
    return apt_id

def test_date_blocking(guest_token, apt_id):
    """Test 3: DATE BLOCKING - Overlapping bookings return 409, non-overlapping succeed"""
    log("=" * 80)
    log("TEST 3: DATE BLOCKING")
    log("=" * 80)
    
    # 3.1: Create first booking on apartment X for dates D1-D2 (far-future unused dates)
    log("3.1: Create first booking on apartment (2026-05-01 to 2026-05-06)")
    check_in_1 = "2026-05-01"
    check_out_1 = "2026-05-06"
    resp = requests.post(f"{BASE_URL}/bookings",
        headers={"Authorization": f"Bearer {guest_token}"},
        json={
            "apartment_id": apt_id,
            "check_in": check_in_1,
            "check_out": check_out_1,
            "guests": 2,
            "purpose": "leisure"
        }
    )
    assert resp.status_code == 200, f"First booking failed: {resp.status_code} {resp.text}"
    booking_1 = resp.json()
    log(f"✅ First booking created: {check_in_1} to {check_out_1}")
    
    # 3.2: Attempt second booking with overlapping dates (2026-05-03 to 2026-05-08) → 409
    log("3.2: Attempt overlapping booking (2026-05-03 to 2026-05-08) → expect 409")
    check_in_2 = "2026-05-03"
    check_out_2 = "2026-05-08"
    resp = requests.post(f"{BASE_URL}/bookings",
        headers={"Authorization": f"Bearer {guest_token}"},
        json={
            "apartment_id": apt_id,
            "check_in": check_in_2,
            "check_out": check_out_2,
            "guests": 2,
            "purpose": "leisure"
        }
    )
    assert resp.status_code == 409, f"Expected 409 for overlapping dates, got {resp.status_code}"
    assert "no longer available" in resp.text.lower(), f"Expected 'no longer available' message, got: {resp.text}"
    log(f"✅ Overlapping booking rejected with 409: {resp.json()['detail']}")
    
    # 3.3: Non-overlapping dates (2026-05-10 to 2026-05-15) → 200 success
    log("3.3: Attempt non-overlapping booking (2026-05-10 to 2026-05-15) → expect 200")
    check_in_3 = "2026-05-10"
    check_out_3 = "2026-05-15"
    resp = requests.post(f"{BASE_URL}/bookings",
        headers={"Authorization": f"Bearer {guest_token}"},
        json={
            "apartment_id": apt_id,
            "check_in": check_in_3,
            "check_out": check_out_3,
            "guests": 2,
            "purpose": "leisure"
        }
    )
    assert resp.status_code == 200, f"Non-overlapping booking failed: {resp.status_code} {resp.text}"
    booking_3 = resp.json()
    log(f"✅ Non-overlapping booking created successfully: {check_in_3} to {check_out_3}")
    
    # 3.4: GET /api/apartments/{id}/unavailable → contains the booked ranges
    log(f"3.4: GET /api/apartments/{apt_id}/unavailable → verify booked ranges")
    resp = requests.get(f"{BASE_URL}/apartments/{apt_id}/unavailable")
    assert resp.status_code == 200, f"GET unavailable dates failed: {resp.status_code}"
    unavailable = resp.json()
    assert isinstance(unavailable, list), "Expected list of unavailable date ranges"
    
    # Verify our bookings are in the unavailable list
    found_booking_1 = False
    found_booking_3 = False
    for range_item in unavailable:
        if range_item["check_in"] == check_in_1 and range_item["check_out"] == check_out_1:
            found_booking_1 = True
        if range_item["check_in"] == check_in_3 and range_item["check_out"] == check_out_3:
            found_booking_3 = True
    
    assert found_booking_1, f"First booking range not found in unavailable dates"
    assert found_booking_3, f"Third booking range not found in unavailable dates"
    log(f"✅ GET /api/apartments/{apt_id}/unavailable returns {len(unavailable)} booked ranges (pending+confirmed)")
    
    log("✅ TEST 3 PASSED: DATE BLOCKING\n")

def test_photo_tours():
    """Test 4: PHOTO TOURS - Verify apartments have photo_tour array with {url, room}"""
    log("=" * 80)
    log("TEST 4: PHOTO TOURS")
    log("=" * 80)
    
    # 4.1: GET /api/apartments → verify photo_tour array exists
    log("4.1: GET /api/apartments → verify photo_tour array")
    resp = requests.get(f"{BASE_URL}/apartments")
    assert resp.status_code == 200, f"GET /api/apartments failed: {resp.status_code}"
    apartments = resp.json()
    assert len(apartments) > 0, "No apartments found"
    
    # Check first apartment
    apt = apartments[0]
    assert "photo_tour" in apt, f"Missing 'photo_tour' field in apartment {apt['id']}"
    assert isinstance(apt["photo_tour"], list), "photo_tour should be a list"
    assert len(apt["photo_tour"]) > 0, "photo_tour should not be empty"
    
    # Verify structure: [{url, room}]
    for photo in apt["photo_tour"]:
        assert "url" in photo, "photo_tour item missing 'url' field"
        assert "room" in photo, "photo_tour item missing 'room' field"
        assert isinstance(photo["url"], str), "photo_tour url should be string"
        assert isinstance(photo["room"], str), "photo_tour room should be string"
    
    log(f"✅ Apartment '{apt['title']}' has photo_tour with {len(apt['photo_tour'])} photos")
    
    # 4.2: Verify photo_tour length matches images length
    log("4.2: Verify photo_tour length matches images length")
    assert len(apt["photo_tour"]) == len(apt["images"]), \
        f"photo_tour length ({len(apt['photo_tour'])}) != images length ({len(apt['images'])})"
    log(f"✅ photo_tour length ({len(apt['photo_tour'])}) matches images length")
    
    # 4.3: Verify room labels are correct (Living Room, Bedroom, Kitchen, Living Space)
    log("4.3: Verify room labels")
    valid_rooms = ["Living Room", "Bedroom", "Kitchen", "Living Space", "Interior"]
    room_labels = [photo["room"] for photo in apt["photo_tour"]]
    for room in room_labels:
        assert room in valid_rooms, f"Invalid room label: {room}"
    log(f"✅ Room labels are valid: {set(room_labels)}")
    
    # 4.4: Check multiple apartments
    log("4.4: Verify all apartments have photo_tour")
    for apt in apartments[:5]:  # Check first 5 apartments
        assert "photo_tour" in apt, f"Apartment {apt['id']} missing photo_tour"
        assert len(apt["photo_tour"]) == len(apt["images"]), \
            f"Apartment {apt['id']} photo_tour/images length mismatch"
    log(f"✅ All checked apartments have photo_tour with correct structure")
    
    log("✅ TEST 4 PASSED: PHOTO TOURS\n")

def test_email_log(admin_token, guest_token):
    """Test 5: EMAIL LOG (MOCKED) - Verify emails are logged on booking creation and status changes"""
    log("=" * 80)
    log("TEST 5: EMAIL LOG (MOCKED)")
    log("=" * 80)
    
    # 5.1: Create a new booking as guest → verify email is logged
    log("5.1: Create new booking as guest → verify 'Stay request received' email")
    
    # Get an apartment
    resp = requests.get(f"{BASE_URL}/apartments")
    apartments = resp.json()
    apt = apartments[1]  # Use second apartment to avoid conflicts
    apt_id = apt["id"]
    
    # Create booking with unique far-future dates
    check_in = "2026-07-01"
    check_out = "2026-07-05"
    resp = requests.post(f"{BASE_URL}/bookings",
        headers={"Authorization": f"Bearer {guest_token}"},
        json={
            "apartment_id": apt_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2,
            "purpose": "medical"
        }
    )
    assert resp.status_code == 200, f"Create booking failed: {resp.status_code} {resp.text}"
    booking = resp.json()
    booking_id = booking["id"]
    log(f"✅ Created booking {booking_id}")
    
    # 5.2: GET /api/admin/emails (admin) → verify "Stay request received" email exists
    log("5.2: GET /api/admin/emails → verify 'Stay request received' email")
    resp = requests.get(f"{BASE_URL}/admin/emails", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200, f"GET /api/admin/emails failed: {resp.status_code}"
    emails = resp.json()
    
    # Find the "Stay request received" email for this booking
    request_email = None
    for email in emails:
        if email.get("booking_id") == booking_id and "Stay request received" in email.get("subject", ""):
            request_email = email
            break
    
    assert request_email is not None, f"No 'Stay request received' email found for booking {booking_id}"
    assert request_email["status"] == "sent (mocked)", f"Expected status='sent (mocked)', got {request_email['status']}"
    log(f"✅ 'Stay request received' email found: {request_email['subject']}")
    log(f"   To: {request_email['to_email']}, Status: {request_email['status']}")
    
    # 5.3: GET /api/admin/emails with guest token → 403
    log("5.3: GET /api/admin/emails with guest token → expect 403")
    resp = requests.get(f"{BASE_URL}/admin/emails", headers={"Authorization": f"Bearer {guest_token}"})
    assert resp.status_code == 403, f"Expected 403 with guest token, got {resp.status_code}"
    log(f"✅ GET /api/admin/emails with guest token returns 403")
    
    log("✅ TEST 5 PASSED: EMAIL LOG (MOCKED)\n")

def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("EXPRESS HOUSING BACKEND TEST SUITE - NEW FEATURES")
    print("Testing: Admin Auth, Admin Bookings, Date Blocking, Photo Tours, Email Log")
    print("=" * 80 + "\n")
    
    try:
        # Test 1: Admin Auth
        admin_token, guest_token = test_admin_auth()
        
        # Test 2: Admin Bookings
        apt_id = test_admin_bookings(admin_token, guest_token)
        
        # Test 3: Date Blocking
        test_date_blocking(guest_token, apt_id)
        
        # Test 4: Photo Tours
        test_photo_tours()
        
        # Test 5: Email Log (MOCKED)
        test_email_log(admin_token, guest_token)
        
        print("\n" + "=" * 80)
        print("✅ ALL TESTS PASSED - EXPRESS HOUSING NEW FEATURES WORKING CORRECTLY")
        print("=" * 80 + "\n")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}\n")
        raise
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}\n")
        raise

if __name__ == "__main__":
    main()
