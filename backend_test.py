import requests
import sys
import json
from datetime import datetime

class WOBArtAPITester:
    def __init__(self, base_url="https://future-ready-44.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.user_token = None
        self.test_order_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, cookies=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, cookies=cookies)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, cookies=cookies)
            elif method == 'PATCH':
                response = self.session.patch(url, json=data, headers=test_headers, cookies=cookies)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "api/", 200)

    def test_services_endpoint(self):
        """Test services endpoint"""
        success, data = self.run_test("Services API", "GET", "api/services", 200)
        if success and isinstance(data, list) and len(data) > 0:
            print(f"   Found {len(data)} services")
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "admin@wobart.ro", "password": "WobAdmin2026!"}
        )
        if success and response.get('role') == 'admin':
            print(f"   Admin logged in: {response.get('name')}")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test{timestamp}@example.com"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data={
                "name": "Test User",
                "email": test_email,
                "phone": "+40700000000",
                "password": "Test123!"
            }
        )
        if success and response.get('role') == 'user':
            print(f"   User registered: {response.get('name')}")
            self.test_user_email = test_email
            return True
        return False

    def test_user_login(self):
        """Test user login with registered user"""
        if not hasattr(self, 'test_user_email'):
            print("   Skipping - no registered user")
            return False
            
        success, response = self.run_test(
            "User Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": self.test_user_email, "password": "Test123!"}
        )
        if success and response.get('role') == 'user':
            print(f"   User logged in: {response.get('name')}")
            return True
        return False

    def test_auth_me(self):
        """Test auth/me endpoint"""
        return self.run_test("Auth Me", "GET", "api/auth/me", 200)

    def test_contact_form(self):
        """Test contact form submission"""
        success, response = self.run_test(
            "Contact Form",
            "POST",
            "api/contact/quote",
            200,
            data={
                "name": "Test Contact",
                "email": "test@example.com",
                "phone": "+40700000000",
                "car_brand": "BMW",
                "car_model": "M4",
                "car_year": "2024",
                "service_type": "Wrap Complet",
                "finish_type": "Matte Black",
                "message": "Test message"
            }
        )
        return success

    def test_create_order(self):
        """Test order creation (requires auth)"""
        success, response = self.run_test(
            "Create Order",
            "POST",
            "api/orders/",
            201,
            data={
                "car_brand": "BMW",
                "car_model": "M4",
                "car_year": 2024,
                "car_plate": "B 01 TEST",
                "service_type": "WRAP_COMPLET",
                "finish_type": "Matte Black",
                "description": "Test order",
                "preferred_date": "2026-02-01"
            }
        )
        if success and response.get('order_number'):
            self.test_order_id = response['order_number']
            print(f"   Order created: {self.test_order_id}")
            return True
        return False

    def test_get_orders(self):
        """Test get user orders"""
        return self.run_test("Get Orders", "GET", "api/orders/", 200)

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        return self.run_test("Admin Stats", "GET", "api/admin/stats", 200)

    def test_admin_orders(self):
        """Test admin orders endpoint"""
        success, data = self.run_test("Admin Orders", "GET", "api/admin/orders", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} orders")
            return True
        return False

    def test_admin_users(self):
        """Test admin users endpoint"""
        success, data = self.run_test("Admin Users", "GET", "api/admin/users", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} users")
            return True
        return False

    def test_admin_quotes(self):
        """Test admin quotes endpoint"""
        success, data = self.run_test("Admin Quotes", "GET", "api/admin/quotes", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} quotes")
            return True
        return False

    def test_stripe_checkout_init(self):
        """Test Stripe checkout initialization"""
        if not self.test_order_id:
            print("   Skipping - no test order")
            return False
            
        success, response = self.run_test(
            "Stripe Checkout Init",
            "POST",
            "api/payments/checkout",
            200,
            data={
                "order_id": self.test_order_id,
                "origin_url": "https://future-ready-44.preview.emergentagent.com"
            }
        )
        if success and response.get('url'):
            print(f"   Checkout URL generated")
            return True
        return False

    def test_logout(self):
        """Test logout"""
        return self.run_test("Logout", "POST", "api/auth/logout", 200)

def main():
    print("🚀 Starting WOB ART API Tests")
    print("=" * 50)
    
    tester = WOBArtAPITester()
    
    # Test sequence
    tests = [
        # Public endpoints
        ("Root API", tester.test_root_endpoint),
        ("Services", tester.test_services_endpoint),
        ("Contact Form", tester.test_contact_form),
        
        # Auth flow
        ("User Registration", tester.test_user_registration),
        ("User Login", tester.test_user_login),
        ("Auth Me", tester.test_auth_me),
        
        # User endpoints
        ("Create Order", tester.test_create_order),
        ("Get Orders", tester.test_get_orders),
        
        # Admin flow
        ("Admin Login", tester.test_admin_login),
        ("Admin Stats", tester.test_admin_stats),
        ("Admin Orders", tester.test_admin_orders),
        ("Admin Users", tester.test_admin_users),
        ("Admin Quotes", tester.test_admin_quotes),
        
        # Payments
        ("Stripe Checkout", tester.test_stripe_checkout_init),
        
        # Cleanup
        ("Logout", tester.test_logout),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend tests mostly successful!")
        return 0
    else:
        print("⚠️  Backend has significant issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())