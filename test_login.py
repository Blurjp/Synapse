#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test login functionality for NovelWriter application
Tests the test user credentials and API endpoints
Uses only stdlib (no external dependencies required)
"""

import json
import urllib.request
import urllib.error
from typing import Dict, Optional, Tuple

def make_request(url: str, method: str = "GET", data: Optional[Dict] = None, headers: Optional[Dict] = None, timeout: int = 10) -> Tuple[int, Dict]:
    """Make HTTP request using stdlib urllib"""
    if headers is None:
        headers = {}

    # Prepare request
    if data:
        data_bytes = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    else:
        data_bytes = None

    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            response_data = json.loads(response.read().decode('utf-8'))
            return response.status, response_data
    except urllib.error.HTTPError as e:
        # Return error status and try to parse error response
        try:
            error_data = json.loads(e.read().decode('utf-8'))
        except:
            error_data = {"error": e.reason}
        return e.code, error_data
    except urllib.error.URLError as e:
        return 0, {"error": str(e.reason)}

def test_login():
    """Test logging in with test user credentials"""
    print("=" * 60)
    print("NovelWriter Login Test")
    print("=" * 60)
    print()

    # Test credentials
    email = "test@example.com"
    password = "Testpass123"

    # API endpoint
    url = "http://localhost:8000/api/auth/login"

    print(f"Testing login...")
    print(f"  Email: {email}")
    print(f"  Password: {'*' * len(password)}")
    print(f"  URL: {url}")
    print()

    try:
        # Make login request
        status_code, data = make_request(
            url,
            method="POST",
            data={"email": email, "password": password}
        )

        print(f"Response Status: {status_code}")
        print()

        if status_code == 200:
            print("✓ LOGIN SUCCESSFUL!")
            print()
            print("=" * 60)
            print("Access Token (first 50 chars):")
            print(data.get("access_token", "")[:50] + "...")
            print()

            user = data.get("user", {})
            print("User Profile:")
            print(f"  User ID:      {user.get('id')}")
            print(f"  Email:        {user.get('email')}")
            print(f"  Username:     {user.get('username')}")
            print(f"  Subscription: {user.get('subscription_tier', '').upper()}")
            print(f"  Status:       {'Active' if user.get('is_active') else 'Inactive'}")
            print(f"  Verified:     {'Yes' if user.get('is_verified') else 'No'}")
            print()

            print("=" * 60)
            print("Available Features:")
            print("  ✓ Create new novel projects")
            print("  ✓ Generate chapters with AI")
            print("  ✓ Continue writing from any point")
            print("  ✓ Generate character dialogue")
            print("  ✓ Export to multiple formats")
            print("  ✓ All premium features unlocked")
            print()

            return True

        elif status_code == 0:
            print("✗ CONNECTION ERROR")
            print("Backend server is not running!")
            print()
            print("Please start the backend server first:")
            print("  cd /Users/jianphua/projects/NovelWriter/qwen-local-chat")
            print("  ./start_lambda_local.sh")
            print()
            print("Or use mock mode:")
            print("  cd /Users/jianphua/projects/NovelWriter")
            print("  ./start_mock.sh")
            return False
        else:
            print("✗ LOGIN FAILED")
            print(f"Status Code: {status_code}")
            print("Response:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return False

    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_profile():
    """Test fetching user profile after login"""
    print()
    print("=" * 60)
    print("Testing Profile Endpoint")
    print("=" * 60)
    print()

    # First login to get token
    email = "test@example.com"
    password = "Testpass123"
    login_url = "http://localhost:8000/api/auth/login"

    try:
        status_code, data = make_request(
            login_url,
            method="POST",
            data={"email": email, "password": password}
        )

        if status_code != 200:
            print("✗ Could not login to test profile")
            return False

        token = data.get("access_token")

        # Test profile endpoint
        profile_url = "http://localhost:8000/api/user/profile"
        status_code, profile = make_request(
            profile_url,
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"Profile Status: {status_code}")

        if status_code == 200:
            print("✓ Profile fetched successfully")
            print()
            print(f"  Username:     {profile.get('username')}")
            print(f"  Email:        {profile.get('email')}")
            print(f"  Subscription: {profile.get('subscription_tier', '').upper()}")
            print()
            return True
        else:
            print("✗ Failed to fetch profile")
            print(json.dumps(profile, indent=2, ensure_ascii=False))
            return False

    except Exception as e:
        print(f"✗ Error testing profile: {e}")
        return False

if __name__ == "__main__":
    # Test login
    login_success = test_login()

    # Test profile if login succeeded
    if login_success:
        profile_success = test_profile()

    print()
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)

    if login_success:
        print("✓ Login Test: PASSED")
        print()
        print("You can now use these credentials:")
        print("  Email:    test@example.com")
        print("  Password: Testpass123")
        print()
        print("Web UI: http://localhost:3000")
    else:
        print("✗ Login Test: FAILED")
        print()
        print("Make sure the backend server is running!")

    print()
