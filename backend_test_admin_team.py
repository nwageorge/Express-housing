#!/usr/bin/env python3
"""
Express Housing Backend Test Suite - ADMIN TEAM MANAGEMENT
Tests: Admin user creation, validation, authentication, and access control
"""
import requests
import json
import time

# Base URL from frontend/.env
BASE_URL = "https://fullscreen-hero-2.preview.emergentagent.com/api"

# Test credentials from /app/memory/test_credentials.md
ADMIN_EMAIL = "admin@expresshousing.com"
ADMIN_PASSWORD = "admin2025"
GUEST_EMAIL = "guest@expresshousing.com"
GUEST_PASSWORD = "stay2025"

def log(msg):
    print(f"[TEST] {msg}")

def test_admin_team_management():
    """
    Test admin team management endpoints:
    1. Login as admin → GET /api/admin/users → verify 200, array includes admin@expresshousing.com, NO password_hash
    2. POST /api/admin/users to create admin2@expresshousing.com → verify 200, role="admin", no password_hash
    3. Login as admin2@expresshousing.com → verify can access /api/auth/me and /api/admin/stats
    4. Validations: password "abc" → 400, duplicate email → 400, guest token → 403, no token → 401
    5. Regression: guest login works, GET /api/apartments returns 12
    """
    log("=" * 80)
    log("ADMIN TEAM MANAGEMENT TESTING")
    log("=" * 80)
    
    # TEST 1: Login as admin and GET /api/admin/users
    log("\n--- TEST 1: Admin login and GET /api/admin/users ---")
    log("1.1: Login as admin@expresshousing.com")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert resp.status_code == 200, f"Admin login failed: {resp.status_code} {resp.text}"
    data = resp.json()
    assert "access_token" in data, "No access_token in response"
    admin_token = data["access_token"]
    assert data["user"]["role"] == "admin", f"Expected role=admin, got {data['user']['role']}"
    log(f"✅ Admin login successful, token received")
    
    log("1.2: GET /api/admin/users")
    resp = requests.get(f"{BASE_URL}/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200, f"GET /api/admin/users failed: {resp.status_code} {resp.text}"
    admin_users = resp.json()
    assert isinstance(admin_users, list), f"Expected list, got {type(admin_users)}"
    assert len(admin_users) > 0, "Expected at least one admin user"
    log(f"✅ GET /api/admin/users returns 200 with {len(admin_users)} admin users")
    
    # Verify admin@expresshousing.com is in the list
    admin_found = False
    for user in admin_users:
        if user["email"] == ADMIN_EMAIL:
            admin_found = True
            log(f"✅ Found admin@expresshousing.com in admin users list")
            # Verify NO password_hash field
            assert "password_hash" not in user, f"password_hash field should NOT be present in user record"
            log(f"✅ NO password_hash field present in user record (correct)")
            break
    
    assert admin_found, f"admin@expresshousing.com not found in admin users list"
    
    # Verify NO password_hash in ANY record
    for user in admin_users:
        assert "password_hash" not in user, f"password_hash found in user {user['email']} - should be excluded"
    log(f"✅ NO password_hash field present in any admin user record")
    
    # TEST 2: POST /api/admin/users to create new admin
    log("\n--- TEST 2: POST /api/admin/users to create admin2@expresshousing.com ---")
    new_admin_email = "admin2@expresshousing.com"
    new_admin_password = "admin2pass"
    
    log(f"2.1: POST /api/admin/users with admin token")
    resp = requests.post(f"{BASE_URL}/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Second Admin",
            "email": new_admin_email,
            "password": new_admin_password
        }
    )
    
    # Handle case where admin2 already exists from previous test run
    if resp.status_code == 400 and "already registered" in resp.text.lower():
        log(f"⚠️  admin2@expresshousing.com already exists (from previous run) - status 400 'Email already registered' is expected")
        log(f"   Will verify login works with existing account")
        admin2_already_exists = True
    else:
        assert resp.status_code == 200, f"POST /api/admin/users failed: {resp.status_code} {resp.text}"
        new_admin = resp.json()
        assert new_admin["email"] == new_admin_email, f"Expected email {new_admin_email}, got {new_admin['email']}"
        assert new_admin["role"] == "admin", f"Expected role=admin, got {new_admin['role']}"
        assert new_admin["name"] == "Second Admin", f"Expected name 'Second Admin', got {new_admin['name']}"
        assert "password_hash" not in new_admin, f"password_hash should NOT be present in response"
        log(f"✅ POST /api/admin/users returns 200")
        log(f"✅ Returned user has role='admin'")
        log(f"✅ NO password_hash in response (correct)")
        admin2_already_exists = False
    
    # TEST 3: Login as admin2 and verify access
    log("\n--- TEST 3: Login as admin2@expresshousing.com and verify access ---")
    log(f"3.1: Login as {new_admin_email}")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": new_admin_email,
        "password": new_admin_password
    })
    assert resp.status_code == 200, f"Admin2 login failed: {resp.status_code} {resp.text}"
    data = resp.json()
    assert "access_token" in data, "No access_token in admin2 login response"
    admin2_token = data["access_token"]
    assert data["user"]["role"] == "admin", f"Expected role=admin for admin2, got {data['user']['role']}"
    log(f"✅ Login as admin2@expresshousing.com successful (status 200)")
    
    log(f"3.2: GET /api/auth/me with admin2 token")
    resp = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {admin2_token}"})
    assert resp.status_code == 200, f"GET /api/auth/me failed: {resp.status_code}"
    me_data = resp.json()
    assert me_data["role"] == "admin", f"Expected role=admin in /auth/me, got {me_data['role']}"
    log(f"✅ GET /api/auth/me returns role='admin'")
    
    log(f"3.3: GET /api/admin/stats with admin2 token")
    resp = requests.get(f"{BASE_URL}/admin/stats", headers={"Authorization": f"Bearer {admin2_token}"})
    assert resp.status_code == 200, f"GET /api/admin/stats failed: {resp.status_code} {resp.text}"
    stats = resp.json()
    assert "pending" in stats, "Missing 'pending' in stats"
    assert "confirmed" in stats, "Missing 'confirmed' in stats"
    log(f"✅ GET /api/admin/stats returns 200 (new admin has dashboard access)")
    
    # TEST 4: Validations
    log("\n--- TEST 4: Validations ---")
    
    # 4.1: POST with password "abc" (< 6 chars) → 400
    log("4.1: POST /api/admin/users with password 'abc' (< 6 chars) → expect 400")
    resp = requests.post(f"{BASE_URL}/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Test Admin",
            "email": "testadmin@test.com",
            "password": "abc"
        }
    )
    assert resp.status_code == 400, f"Expected 400 for short password, got {resp.status_code}"
    assert "at least 6 characters" in resp.text.lower(), f"Expected password length error message"
    log(f"✅ POST with password 'abc' returns 400 (validation working)")
    
    # 4.2: POST with duplicate email → 400
    log("4.2: POST /api/admin/users with duplicate email → expect 400")
    resp = requests.post(f"{BASE_URL}/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Duplicate Admin",
            "email": ADMIN_EMAIL,  # Use existing admin email
            "password": "password123"
        }
    )
    assert resp.status_code == 400, f"Expected 400 for duplicate email, got {resp.status_code}"
    assert "already registered" in resp.text.lower(), f"Expected 'already registered' error message"
    log(f"✅ POST with duplicate email returns 400 (validation working)")
    
    # 4.3: POST with GUEST token → 403
    log("4.3: Login as guest and POST /api/admin/users → expect 403")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": GUEST_EMAIL,
        "password": GUEST_PASSWORD
    })
    assert resp.status_code == 200, f"Guest login failed: {resp.status_code}"
    guest_token = resp.json()["access_token"]
    
    resp = requests.post(f"{BASE_URL}/admin/users",
        headers={"Authorization": f"Bearer {guest_token}"},
        json={
            "name": "Unauthorized Admin",
            "email": "unauthorized@test.com",
            "password": "password123"
        }
    )
    assert resp.status_code == 403, f"Expected 403 with guest token, got {resp.status_code}"
    log(f"✅ POST with GUEST token returns 403 (authorization working)")
    
    # 4.4: POST without token → 401
    log("4.4: POST /api/admin/users without token → expect 401")
    resp = requests.post(f"{BASE_URL}/admin/users",
        json={
            "name": "No Auth Admin",
            "email": "noauth@test.com",
            "password": "password123"
        }
    )
    assert resp.status_code == 401, f"Expected 401 without token, got {resp.status_code}"
    log(f"✅ POST without token returns 401 (authentication required)")
    
    # TEST 5: Regression tests
    log("\n--- TEST 5: Regression tests ---")
    
    # 5.1: Guest login still works
    log("5.1: Verify guest login still works")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": GUEST_EMAIL,
        "password": GUEST_PASSWORD
    })
    assert resp.status_code == 200, f"Guest login failed: {resp.status_code}"
    assert "access_token" in resp.json(), "No access_token in guest login response"
    log(f"✅ Guest login still works (status 200)")
    
    # 5.2: GET /api/apartments returns 12
    log("5.2: GET /api/apartments → expect 12 apartments")
    resp = requests.get(f"{BASE_URL}/apartments")
    assert resp.status_code == 200, f"GET /api/apartments failed: {resp.status_code}"
    apartments = resp.json()
    assert len(apartments) == 12, f"Expected 12 apartments, got {len(apartments)}"
    log(f"✅ GET /api/apartments returns 12 apartments (regression OK)")
    
    log("\n" + "=" * 80)
    log("✅ ALL ADMIN TEAM MANAGEMENT TESTS PASSED")
    log("=" * 80)

def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("EXPRESS HOUSING - ADMIN TEAM MANAGEMENT TEST SUITE")
    print("=" * 80 + "\n")
    
    try:
        test_admin_team_management()
        
        print("\n" + "=" * 80)
        print("✅ ALL TESTS PASSED - ADMIN TEAM MANAGEMENT WORKING CORRECTLY")
        print("=" * 80 + "\n")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}\n")
        raise
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}\n")
        raise

if __name__ == "__main__":
    main()
