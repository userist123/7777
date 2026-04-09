import requests
import sys
import json
from datetime import datetime

class TradingTrackerAPITester:
    def __init__(self, base_url="https://market-signals-dash-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - {name}")
                try:
                    response_data = response.json() if response.content else {}
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json() if response.content else {}
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout after {timeout}s")
            self.failed_tests.append(f"{name}: Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_get_trades(self):
        """Test getting all trades"""
        success, data = self.run_test("Get All Trades", "GET", "trades", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} trades")
            if len(data) > 0:
                trade = data[0]
                print(f"   Sample trade: {trade.get('pair', 'N/A')} - {trade.get('status', 'N/A')}")
        return success, data

    def test_seed_trades(self):
        """Test seeding trades"""
        return self.run_test("Seed Trades", "POST", "trades/seed", 200)

    def test_create_trade(self):
        """Test creating a new trade"""
        test_trade = {
            "account": "Account 1",
            "type": "Trade",
            "date": datetime.now().isoformat(),
            "strategy": "Strategy 1",
            "pair": "EUR/USD",
            "direction": "Buy",
            "lotSize": 0.1,
            "leverage": 100,
            "entryPrice": 1.0850,
            "stopLoss": 1.0820,
            "takeProfit": 1.0900,
            "notes": "Test trade from API testing",
            "pnl": 0,
            "pnlPct": 0,
            "status": "Open"
        }
        success, data = self.run_test("Create Trade", "POST", "trades", 200, test_trade)
        if success and data.get('id'):
            print(f"   Created trade with ID: {data['id']}")
            return success, data['id']
        return success, None

    def test_delete_trade(self, trade_id):
        """Test deleting a trade"""
        if not trade_id:
            print("⚠️  Skipping delete test - no trade ID provided")
            return False, None
        return self.run_test("Delete Trade", "DELETE", f"trades/{trade_id}", 200)

    def test_market_data(self):
        """Test market data endpoint (may take time due to yfinance)"""
        print("⚠️  Market data test may take 30+ seconds due to yfinance API...")
        return self.run_test("Get Market Data", "GET", "market-data", 200, timeout=60)

    def test_settings(self):
        """Test settings endpoints"""
        success1, _ = self.run_test("Get Settings", "GET", "settings", 200)
        
        test_settings = {
            "startingBalance": 15000,
            "currency": "USD",
            "darkMode": True
        }
        success2, _ = self.run_test("Update Settings", "PUT", "settings", 200, test_settings)
        
        return success1 and success2

def main():
    print("🚀 Starting Trading Tracker API Tests")
    print("=" * 50)
    
    tester = TradingTrackerAPITester()
    
    # Test API root
    tester.test_api_root()
    
    # Test trades endpoints
    tester.test_get_trades()
    tester.test_seed_trades()
    
    # Test CRUD operations
    success, trade_id = tester.test_create_trade()
    if trade_id:
        tester.test_delete_trade(trade_id)
    
    # Test settings
    tester.test_settings()
    
    # Test market data (this may take time)
    tester.test_market_data()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure}")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"\n📈 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())