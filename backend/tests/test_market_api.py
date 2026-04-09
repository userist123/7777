"""
Backend API Tests for Market Analysis Dashboard
Tests all endpoints: market-data, asset-detail, historic-data, settings, analyze-chart
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://market-signals-dash-1.preview.emergentagent.com')

class TestMarketDataEndpoint:
    """Tests for GET /api/market-data endpoint"""
    
    def test_market_data_returns_valid_json(self):
        """GET /api/market-data returns valid JSON with assets array, summary, macro, and timestamp"""
        response = requests.get(f"{BASE_URL}/api/market-data", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Check if loading or has data
        if data.get("loading"):
            # Data is still loading, this is acceptable
            assert "assets" in data
            assert "summary" in data
            print("Market data is still loading...")
            return
        
        # Validate response structure
        assert "assets" in data, "Response missing 'assets' field"
        assert "summary" in data, "Response missing 'summary' field"
        assert "macro" in data, "Response missing 'macro' field"
        assert "timestamp" in data, "Response missing 'timestamp' field"
        
        # Validate assets array
        assert isinstance(data["assets"], list), "Assets should be a list"
        assert len(data["assets"]) > 0, "Assets array should not be empty"
        
        # Validate first asset structure
        first_asset = data["assets"][0]
        required_fields = ["name", "ticker", "category", "price", "signal", "rsi", "macd"]
        for field in required_fields:
            assert field in first_asset, f"Asset missing required field: {field}"
        
        # Validate summary structure
        summary = data["summary"]
        assert "total" in summary, "Summary missing 'total'"
        assert "buy_count" in summary, "Summary missing 'buy_count'"
        assert "sell_count" in summary, "Summary missing 'sell_count'"
        assert "wait_count" in summary, "Summary missing 'wait_count'"
        assert "trend" in summary, "Summary missing 'trend'"
        
        # Validate macro structure
        macro = data["macro"]
        assert "fear_greed" in macro, "Macro missing 'fear_greed'"
        
        print(f"Market data loaded: {summary['total']} assets, BUY:{summary['buy_count']}, SELL:{summary['sell_count']}, WAIT:{summary['wait_count']}")
    
    def test_market_data_asset_categories(self):
        """Verify assets are categorized correctly across 5 categories"""
        response = requests.get(f"{BASE_URL}/api/market-data", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        if data.get("loading"):
            pytest.skip("Market data still loading")
        
        assets = data["assets"]
        categories = set(a["category"] for a in assets)
        
        expected_categories = {"INDICI", "ACTIUNI", "CRYPTO", "VALUTE", "MATERII_PRIME"}
        assert categories.issubset(expected_categories), f"Unexpected categories: {categories - expected_categories}"
        
        # Count assets per category
        cat_counts = {}
        for a in assets:
            cat_counts[a["category"]] = cat_counts.get(a["category"], 0) + 1
        
        print(f"Asset distribution: {cat_counts}")
        assert sum(cat_counts.values()) >= 80, f"Expected at least 80 assets, got {sum(cat_counts.values())}"
    
    def test_market_data_technical_indicators(self):
        """Verify technical indicators are present and valid"""
        response = requests.get(f"{BASE_URL}/api/market-data", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        if data.get("loading"):
            pytest.skip("Market data still loading")
        
        assets = data["assets"]
        sample_asset = assets[0]
        
        # Check technical indicators
        assert "rsi" in sample_asset and sample_asset["rsi"] is not None
        assert 0 <= sample_asset["rsi"] <= 100, f"RSI out of range: {sample_asset['rsi']}"
        
        assert "macd" in sample_asset
        assert "macd_signal" in sample_asset
        assert "macd_histogram" in sample_asset
        assert "macd_cross" in sample_asset
        
        assert "ma20" in sample_asset
        assert "ma50" in sample_asset
        assert "ma200" in sample_asset
        assert "ma_cross" in sample_asset
        
        assert "bb_upper" in sample_asset
        assert "bb_lower" in sample_asset
        
        assert "atr" in sample_asset
        assert "stoch_k" in sample_asset
        assert "stoch_d" in sample_asset
        
        print(f"Sample asset {sample_asset['name']}: RSI={sample_asset['rsi']}, Signal={sample_asset['signal']}")


class TestAssetDetailEndpoint:
    """Tests for GET /api/asset-detail/{asset_name} endpoint"""
    
    def test_asset_detail_returns_valid_data(self):
        """GET /api/asset-detail/{asset_name} returns detailed asset data"""
        # First get market data to find a valid asset name
        market_response = requests.get(f"{BASE_URL}/api/market-data", timeout=30)
        assert market_response.status_code == 200
        
        data = market_response.json()
        if data.get("loading"):
            pytest.skip("Market data still loading")
        
        asset_name = data["assets"][0]["name"]
        
        # Get asset detail
        response = requests.get(f"{BASE_URL}/api/asset-detail/{asset_name}", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        detail = response.json()
        
        # Validate response structure
        assert "asset" in detail, "Response missing 'asset'"
        assert "competitors" in detail, "Response missing 'competitors'"
        assert "risks" in detail, "Response missing 'risks'"
        assert "calendar" in detail, "Response missing 'calendar'"
        assert "macro" in detail, "Response missing 'macro'"
        
        # Validate asset data
        asset = detail["asset"]
        assert asset["name"] == asset_name
        assert "price" in asset
        assert "signal" in asset
        
        # Validate competitors
        assert isinstance(detail["competitors"], list)
        
        # Validate risks
        assert isinstance(detail["risks"], list)
        if detail["risks"]:
            risk = detail["risks"][0]
            assert "id" in risk
            assert "tip" in risk
            assert "desc" in risk
            assert "impact" in risk
            assert "prob" in risk
        
        # Validate calendar
        assert isinstance(detail["calendar"], list)
        
        print(f"Asset detail for {asset_name}: {len(detail['competitors'])} competitors, {len(detail['risks'])} risks")
    
    def test_asset_detail_not_found(self):
        """GET /api/asset-detail/{invalid_name} returns 404"""
        response = requests.get(f"{BASE_URL}/api/asset-detail/INVALID_ASSET_NAME_12345", timeout=30)
        assert response.status_code == 404


class TestHistoricDataEndpoint:
    """Tests for historic-data endpoints"""
    
    def test_get_historic_data(self):
        """GET /api/historic-data returns saved snapshots"""
        response = requests.get(f"{BASE_URL}/api/historic-data", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        print(f"Historic data: {len(data)} snapshots found")
    
    def test_save_historic_snapshot(self):
        """POST /api/historic-data/snapshot saves a monthly snapshot"""
        # First ensure market data is loaded
        market_response = requests.get(f"{BASE_URL}/api/market-data", timeout=30)
        if market_response.json().get("loading"):
            pytest.skip("Market data still loading")
        
        response = requests.post(f"{BASE_URL}/api/historic-data/snapshot", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        
        # Either new snapshot saved or already exists
        if data.get("exists"):
            print(f"Snapshot already exists: {data['message']}")
        else:
            assert "data" in data
            snapshot = data["data"]
            assert "month" in snapshot
            assert "buy_count" in snapshot
            assert "sell_count" in snapshot
            assert "wait_count" in snapshot
            print(f"New snapshot saved: {snapshot['month']}")
    
    def test_historic_data_persistence(self):
        """Verify snapshot is persisted and retrievable"""
        # Save snapshot
        requests.post(f"{BASE_URL}/api/historic-data/snapshot", timeout=30)
        
        # Retrieve and verify
        response = requests.get(f"{BASE_URL}/api/historic-data", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        if len(data) > 0:
            latest = data[0]
            assert "month" in latest
            assert "buy_count" in latest
            print(f"Latest snapshot: {latest['month']}")


class TestSettingsEndpoint:
    """Tests for GET /api/settings endpoint"""
    
    def test_settings_returns_dark_mode(self):
        """GET /api/settings returns darkMode setting"""
        response = requests.get(f"{BASE_URL}/api/settings", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        assert "darkMode" in data, "Response missing 'darkMode'"
        assert isinstance(data["darkMode"], bool), "darkMode should be boolean"
        
        print(f"Settings: darkMode={data['darkMode']}")


class TestMarketDataRefresh:
    """Tests for market data refresh endpoint"""
    
    def test_refresh_market_data(self):
        """GET /api/market-data/refresh triggers cache refresh"""
        response = requests.get(f"{BASE_URL}/api/market-data/refresh", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "currently_refreshing" in data
        
        print(f"Refresh triggered: {data['message']}")


class TestChartAnalysisEndpoint:
    """Tests for POST /api/analyze-chart endpoint"""
    
    def test_analyze_chart_requires_image(self):
        """POST /api/analyze-chart returns 400 without image"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-chart",
            json={"image_base64": "", "prompt": "test"},
            timeout=30
        )
        assert response.status_code == 400
    
    def test_analyze_chart_with_valid_image(self):
        """POST /api/analyze-chart accepts base64 image"""
        # Create a minimal valid base64 image (1x1 red pixel PNG)
        # This is a valid PNG but very small - the API should accept it
        test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        response = requests.post(
            f"{BASE_URL}/api/analyze-chart",
            json={"image_base64": test_image_base64, "prompt": "Analyze this chart"},
            timeout=60  # Longer timeout for AI analysis
        )
        
        # Should either succeed or fail gracefully (not 500)
        assert response.status_code in [200, 400, 422], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert "analysis" in data
            print(f"Chart analysis received: {len(data['analysis'])} chars")


class TestSignalDistribution:
    """Tests for signal distribution across assets"""
    
    def test_signal_values_are_valid(self):
        """Verify all signals are BUY, SELL, or WAIT"""
        response = requests.get(f"{BASE_URL}/api/market-data", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        if data.get("loading"):
            pytest.skip("Market data still loading")
        
        valid_signals = {"BUY", "SELL", "WAIT"}
        for asset in data["assets"]:
            assert asset["signal"] in valid_signals, f"Invalid signal for {asset['name']}: {asset['signal']}"
        
        # Count signals
        signal_counts = {"BUY": 0, "SELL": 0, "WAIT": 0}
        for asset in data["assets"]:
            signal_counts[asset["signal"]] += 1
        
        print(f"Signal distribution: {signal_counts}")
        
        # Verify summary matches
        summary = data["summary"]
        assert summary["buy_count"] == signal_counts["BUY"]
        assert summary["sell_count"] == signal_counts["SELL"]
        assert summary["wait_count"] == signal_counts["WAIT"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
