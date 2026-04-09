from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class TradeCreate(BaseModel):
    account: str = "Account 1"
    type: str = "Trade"
    date: str = ""
    strategy: str = "Strategy 1"
    pair: str = "EUR/USD"
    direction: str = "Buy"
    lotSize: float = 0.01
    leverage: int = 100
    entryPrice: float = 0
    stopLoss: float = 0
    takeProfit: float = 0
    exitPrice: Optional[float] = None
    exitDate: Optional[str] = None
    notes: str = ""
    pnl: float = 0
    pnlPct: float = 0
    pnlPips: float = 0
    rrActual: float = 0
    status: str = "Open"
    duration: str = ""
    amount: Optional[float] = None

class TradeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    account: str
    type: str
    date: str
    strategy: str
    pair: str
    direction: str
    lotSize: float
    leverage: int
    entryPrice: float
    stopLoss: float
    takeProfit: float
    exitPrice: Optional[float] = None
    exitDate: Optional[str] = None
    notes: str
    pnl: float
    pnlPct: float
    pnlPips: float
    rrActual: float
    status: str
    duration: str
    amount: Optional[float] = None

class SettingsModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    startingBalance: float = 1000
    currency: str = "USD"
    darkMode: bool = True

# Routes
@api_router.get("/")
async def root():
    return {"message": "Trading Tracker API"}

@api_router.get("/trades", response_model=List[TradeResponse])
async def get_trades():
    trades = await db.trades.find({}, {"_id": 0}).to_list(10000)
    return trades

@api_router.post("/trades", response_model=TradeResponse)
async def create_trade(trade: TradeCreate):
    trade_dict = trade.model_dump()
    trade_dict["id"] = str(uuid.uuid4())
    if not trade_dict["date"]:
        trade_dict["date"] = datetime.now(timezone.utc).isoformat()
    await db.trades.insert_one(trade_dict)
    # Refetch without _id
    saved = await db.trades.find_one({"id": trade_dict["id"]}, {"_id": 0})
    return saved

@api_router.put("/trades/{trade_id}", response_model=TradeResponse)
async def update_trade(trade_id: str, trade: TradeCreate):
    trade_dict = trade.model_dump()
    trade_dict["id"] = trade_id
    result = await db.trades.update_one({"id": trade_id}, {"$set": trade_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trade not found")
    saved = await db.trades.find_one({"id": trade_id}, {"_id": 0})
    return saved

@api_router.delete("/trades/{trade_id}")
async def delete_trade(trade_id: str):
    result = await db.trades.delete_one({"id": trade_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trade not found")
    return {"message": "Trade deleted"}

@api_router.delete("/trades")
async def delete_all_trades():
    await db.trades.delete_many({})
    return {"message": "All trades deleted"}

@api_router.post("/trades/seed")
async def seed_trades():
    count = await db.trades.count_documents({})
    if count > 0:
        return {"message": "Trades already seeded", "count": count}
    
    seed_data = [
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Deposit", "date": "2026-01-01T10:00:00Z", "strategy": "", "pair": "", "direction": "", "lotSize": 0, "leverage": 0, "entryPrice": 0, "stopLoss": 0, "takeProfit": 0, "exitPrice": None, "exitDate": None, "notes": "Initial deposit", "pnl": 0, "pnlPct": 0, "pnlPips": 0, "rrActual": 0, "status": "Completed", "duration": "", "amount": 10000},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-01-08T09:30:00Z", "strategy": "Strategy 2", "pair": "XAU/USD", "direction": "Buy", "lotSize": 0.5, "leverage": 100, "entryPrice": 2635.50, "stopLoss": 2620.00, "takeProfit": 2665.00, "exitPrice": 2662.30, "exitDate": "2026-01-08T15:45:00Z", "notes": "Gold bullish breakout", "pnl": 1340.0, "pnlPct": 13.4, "pnlPips": 268, "rrActual": 1.73, "status": "Win", "duration": "6h 15m"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-01-15T08:00:00Z", "strategy": "Strategy 1", "pair": "EUR/USD", "direction": "Sell", "lotSize": 1.0, "leverage": 100, "entryPrice": 1.0845, "stopLoss": 1.0880, "takeProfit": 1.0780, "exitPrice": 1.0792, "exitDate": "2026-01-15T16:30:00Z", "notes": "ECB rate decision play", "pnl": 530.0, "pnlPct": 5.3, "pnlPips": 53, "rrActual": 1.51, "status": "Win", "duration": "8h 30m"},
        {"id": str(uuid.uuid4()), "account": "Account 2", "type": "Deposit", "date": "2026-01-20T10:00:00Z", "strategy": "", "pair": "", "direction": "", "lotSize": 0, "leverage": 0, "entryPrice": 0, "stopLoss": 0, "takeProfit": 0, "exitPrice": None, "exitDate": None, "notes": "Account 2 funding", "pnl": 0, "pnlPct": 0, "pnlPips": 0, "rrActual": 0, "status": "Completed", "duration": "", "amount": 5000},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-01-22T14:00:00Z", "strategy": "Strategy 3", "pair": "BTC/USDT", "direction": "Buy", "lotSize": 0.1, "leverage": 50, "entryPrice": 98500, "stopLoss": 96000, "takeProfit": 105000, "exitPrice": 103200, "exitDate": "2026-01-25T10:00:00Z", "notes": "BTC momentum play", "pnl": 470.0, "pnlPct": 4.7, "pnlPips": 4700, "rrActual": 1.88, "status": "Win", "duration": "2d 20h"},
        {"id": str(uuid.uuid4()), "account": "Account 2", "type": "Trade", "date": "2026-01-28T11:00:00Z", "strategy": "Strategy 1", "pair": "GBP/USD", "direction": "Buy", "lotSize": 0.5, "leverage": 100, "entryPrice": 1.2450, "stopLoss": 1.2410, "takeProfit": 1.2520, "exitPrice": 1.2405, "exitDate": "2026-01-28T18:00:00Z", "notes": "False breakout", "pnl": -225.0, "pnlPct": -4.5, "pnlPips": -45, "rrActual": -1.13, "status": "Loss", "duration": "7h"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-02-03T09:00:00Z", "strategy": "Strategy 2", "pair": "USD/JPY", "direction": "Sell", "lotSize": 1.0, "leverage": 100, "entryPrice": 154.80, "stopLoss": 155.50, "takeProfit": 153.20, "exitPrice": 153.45, "exitDate": "2026-02-03T22:00:00Z", "notes": "JPY strength on BoJ", "pnl": 870.0, "pnlPct": 8.7, "pnlPips": 135, "rrActual": 1.93, "status": "Win", "duration": "13h"},
        {"id": str(uuid.uuid4()), "account": "Account 3", "type": "Deposit", "date": "2026-02-05T10:00:00Z", "strategy": "", "pair": "", "direction": "", "lotSize": 0, "leverage": 0, "entryPrice": 0, "stopLoss": 0, "takeProfit": 0, "exitPrice": None, "exitDate": None, "notes": "Account 3 initial", "pnl": 0, "pnlPct": 0, "pnlPips": 0, "rrActual": 0, "status": "Completed", "duration": "", "amount": 3000},
        {"id": str(uuid.uuid4()), "account": "Account 3", "type": "Trade", "date": "2026-02-09T12:00:00Z", "strategy": "Strategy 3", "pair": "POL/USDT", "direction": "Buy", "lotSize": 500, "leverage": 10, "entryPrice": 0.42, "stopLoss": 0.35, "takeProfit": 0.60, "exitPrice": 0.2962, "exitDate": "2026-02-10T08:00:00Z", "notes": "POL dump on market sell-off", "pnl": -61.9, "pnlPct": -29.49, "pnlPips": -1238, "rrActual": -1.77, "status": "Loss", "duration": "20h"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-02-10T08:30:00Z", "strategy": "Strategy 2", "pair": "DOGE/USDT", "direction": "Buy", "lotSize": 5000, "leverage": 10, "entryPrice": 0.0832, "stopLoss": 0.0780, "takeProfit": 0.0950, "exitPrice": 0.09053, "exitDate": "2026-02-10T20:00:00Z", "notes": "DOGE meme rally", "pnl": 36.65, "pnlPct": 8.81, "pnlPips": 733, "rrActual": 1.41, "status": "Win", "duration": "11h 30m"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-02-11T10:00:00Z", "strategy": "Strategy 1", "pair": "BTC/USDT", "direction": "Sell", "lotSize": 0.05, "leverage": 50, "entryPrice": 104500, "stopLoss": 107000, "takeProfit": 98000, "exitPrice": 107500, "exitDate": "2026-02-12T02:00:00Z", "notes": "BTC short squeezed", "pnl": -150.0, "pnlPct": -14.34, "pnlPips": -3000, "rrActual": -1.2, "status": "Loss", "duration": "16h"},
        {"id": str(uuid.uuid4()), "account": "Account 2", "type": "Trade", "date": "2026-02-13T07:00:00Z", "strategy": "Strategy 1", "pair": "SOL/USDT", "direction": "Buy", "lotSize": 20, "leverage": 10, "entryPrice": 185.00, "stopLoss": 170.00, "takeProfit": 230.00, "exitPrice": 218.38, "exitDate": "2026-02-14T18:00:00Z", "notes": "SOL ecosystem pump", "pnl": 667.6, "pnlPct": 18.04, "pnlPips": 3338, "rrActual": 2.23, "status": "Win", "duration": "1d 11h"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-02-14T09:00:00Z", "strategy": "Strategy 3", "pair": "ONDO/USDT", "direction": "Buy", "lotSize": 1000, "leverage": 5, "entryPrice": 1.25, "stopLoss": 1.05, "takeProfit": 2.00, "exitPrice": 1.8153, "exitDate": "2026-02-18T14:00:00Z", "notes": "ONDO RWA narrative moon", "pnl": 565.3, "pnlPct": 45.22, "pnlPips": 5653, "rrActual": 2.83, "status": "Win", "duration": "4d 5h"},
        {"id": str(uuid.uuid4()), "account": "Account 2", "type": "Trade", "date": "2026-02-15T11:00:00Z", "strategy": "Strategy 1", "pair": "ADA/USDT", "direction": "Buy", "lotSize": 3000, "leverage": 5, "entryPrice": 0.72, "stopLoss": 0.65, "takeProfit": 0.85, "exitPrice": 0.7674, "exitDate": "2026-02-16T09:00:00Z", "notes": "ADA Voltaire catalyst", "pnl": 142.2, "pnlPct": 6.59, "pnlPips": 474, "rrActual": 0.68, "status": "Win", "duration": "22h"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-02-18T10:00:00Z", "strategy": "Strategy 1", "pair": "WIF/USDT", "direction": "Buy", "lotSize": 2000, "leverage": 10, "entryPrice": 0.85, "stopLoss": 0.60, "takeProfit": 1.80, "exitPrice": 1.5252, "exitDate": "2026-02-22T16:00:00Z", "notes": "WIF meme supercycle", "pnl": 1350.4, "pnlPct": 79.43, "pnlPips": 6752, "rrActual": 2.7, "status": "Win", "duration": "4d 6h"},
        {"id": str(uuid.uuid4()), "account": "Account 3", "type": "Trade", "date": "2026-02-19T08:00:00Z", "strategy": "Strategy 3", "pair": "DOT/USDT", "direction": "Buy", "lotSize": 200, "leverage": 10, "entryPrice": 7.50, "stopLoss": 6.00, "takeProfit": 12.00, "exitPrice": 12.588, "exitDate": "2026-02-25T12:00:00Z", "notes": "DOT parachain revival", "pnl": 1017.6, "pnlPct": 67.81, "pnlPips": 5088, "rrActual": 3.39, "status": "Win", "duration": "6d 4h"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-02-24T09:00:00Z", "strategy": "Strategy 2", "pair": "XAU/USD", "direction": "Buy", "lotSize": 0.3, "leverage": 100, "entryPrice": 2680.00, "stopLoss": 2665.00, "takeProfit": 2710.00, "exitPrice": 2705.50, "exitDate": "2026-02-24T17:00:00Z", "notes": "Gold range trade", "pnl": 765.0, "pnlPct": 7.65, "pnlPips": 255, "rrActual": 1.7, "status": "Win", "duration": "8h"},
        {"id": str(uuid.uuid4()), "account": "Account 2", "type": "Trade", "date": "2026-02-26T13:00:00Z", "strategy": "Strategy 1", "pair": "ETH/USDT", "direction": "Buy", "lotSize": 1.0, "leverage": 20, "entryPrice": 3200, "stopLoss": 3050, "takeProfit": 3500, "exitPrice": 3080, "exitDate": "2026-02-27T10:00:00Z", "notes": "ETH failed support", "pnl": -120.0, "pnlPct": -3.75, "pnlPips": -1200, "rrActual": -0.8, "status": "Loss", "duration": "21h"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-03-03T08:00:00Z", "strategy": "Strategy 2", "pair": "EUR/USD", "direction": "Buy", "lotSize": 2.0, "leverage": 100, "entryPrice": 1.0920, "stopLoss": 1.0880, "takeProfit": 1.0990, "exitPrice": 1.0905, "exitDate": "2026-03-03T16:00:00Z", "notes": "EUR weak on PMI data", "pnl": -300.0, "pnlPct": -1.5, "pnlPips": -15, "rrActual": -0.38, "status": "Loss", "duration": "8h"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-03-05T10:00:00Z", "strategy": "Strategy 1", "pair": "EUR/USD", "direction": "Sell", "lotSize": 1.5, "leverage": 100, "entryPrice": 1.0870, "stopLoss": 1.0910, "takeProfit": 1.0800, "exitPrice": 1.0884, "exitDate": "2026-03-05T18:00:00Z", "notes": "Stopped out on USD weakness", "pnl": -210.0, "pnlPct": -1.44, "pnlPips": -14, "rrActual": -0.35, "status": "Loss", "duration": "8h"},
        {"id": str(uuid.uuid4()), "account": "Account 3", "type": "Trade", "date": "2026-03-10T09:00:00Z", "strategy": "Strategy 2", "pair": "NAS100", "direction": "Buy", "lotSize": 0.5, "leverage": 50, "entryPrice": 18500, "stopLoss": 18300, "takeProfit": 18900, "exitPrice": 18820, "exitDate": "2026-03-10T21:00:00Z", "notes": "Tech rally on AI news", "pnl": 160.0, "pnlPct": 5.33, "pnlPips": 320, "rrActual": 1.6, "status": "Win", "duration": "12h"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-03-15T07:30:00Z", "strategy": "Strategy 3", "pair": "USD/CHF", "direction": "Sell", "lotSize": 1.0, "leverage": 100, "entryPrice": 0.8850, "stopLoss": 0.8890, "takeProfit": 0.8780, "exitPrice": 0.8795, "exitDate": "2026-03-15T19:00:00Z", "notes": "CHF safe haven flow", "pnl": 550.0, "pnlPct": 5.5, "pnlPips": 55, "rrActual": 1.38, "status": "Win", "duration": "11h 30m"},
        {"id": str(uuid.uuid4()), "account": "Account 2", "type": "Trade", "date": "2026-03-20T10:00:00Z", "strategy": "Strategy 1", "pair": "XRP/USDT", "direction": "Buy", "lotSize": 2000, "leverage": 5, "entryPrice": 2.45, "stopLoss": 2.20, "takeProfit": 2.90, "exitPrice": 2.78, "exitDate": "2026-03-22T14:00:00Z", "notes": "XRP SEC settlement pump", "pnl": 660.0, "pnlPct": 13.47, "pnlPips": 3300, "rrActual": 1.32, "status": "Win", "duration": "2d 4h"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-03-25T08:00:00Z", "strategy": "Strategy 2", "pair": "GBP/JPY", "direction": "Buy", "lotSize": 0.5, "leverage": 100, "entryPrice": 192.50, "stopLoss": 191.50, "takeProfit": 194.50, "exitPrice": 191.30, "exitDate": "2026-03-25T14:00:00Z", "notes": "GBP/JPY stopped on risk-off", "pnl": -390.0, "pnlPct": -7.8, "pnlPips": -120, "rrActual": -1.2, "status": "Loss", "duration": "6h"},
        {"id": str(uuid.uuid4()), "account": "Account 3", "type": "Trade", "date": "2026-04-01T09:00:00Z", "strategy": "Strategy 1", "pair": "BNB/USDT", "direction": "Buy", "lotSize": 5, "leverage": 10, "entryPrice": 620, "stopLoss": 580, "takeProfit": 700, "exitPrice": 685, "exitDate": "2026-04-03T16:00:00Z", "notes": "BNB launchpool catalyst", "pnl": 325.0, "pnlPct": 10.48, "pnlPips": 6500, "rrActual": 1.63, "status": "Win", "duration": "2d 7h"},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-04-05T10:00:00Z", "strategy": "Strategy 3", "pair": "HYPE/USDT", "direction": "Buy", "lotSize": 500, "leverage": 5, "entryPrice": 18.50, "stopLoss": 15.00, "takeProfit": 28.00, "exitPrice": 25.20, "exitDate": "2026-04-10T12:00:00Z", "notes": "HYPE protocol upgrade", "pnl": 3350.0, "pnlPct": 36.22, "pnlPips": 6700, "rrActual": 1.91, "status": "Win", "duration": "5d 2h"},
        {"id": str(uuid.uuid4()), "account": "Account 2", "type": "Withdrawal", "date": "2026-04-08T10:00:00Z", "strategy": "", "pair": "", "direction": "", "lotSize": 0, "leverage": 0, "entryPrice": 0, "stopLoss": 0, "takeProfit": 0, "exitPrice": None, "exitDate": None, "notes": "Profit withdrawal", "pnl": 0, "pnlPct": 0, "pnlPips": 0, "rrActual": 0, "status": "Completed", "duration": "", "amount": 1000},
        {"id": str(uuid.uuid4()), "account": "Account 1", "type": "Trade", "date": "2026-04-12T08:00:00Z", "strategy": "Strategy 2", "pair": "XAU/USD", "direction": "Sell", "lotSize": 0.4, "leverage": 100, "entryPrice": 2720.00, "stopLoss": 2740.00, "takeProfit": 2680.00, "exitPrice": 2720.50, "exitDate": "2026-04-12T12:00:00Z", "notes": "Gold breakeven scratch", "pnl": -20.0, "pnlPct": -0.02, "pnlPips": -5, "rrActual": -0.03, "status": "Breakeven", "duration": "4h"},
    ]
    
    await db.trades.insert_many(seed_data)
    return {"message": "Seeded trades", "count": len(seed_data)}

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"key": "app_settings"}, {"_id": 0})
    if not settings:
        default = {"key": "app_settings", "startingBalance": 10000, "currency": "USD", "darkMode": True}
        await db.settings.insert_one(default)
        # Refetch without _id to avoid ObjectId serialization
        settings = await db.settings.find_one({"key": "app_settings"}, {"_id": 0})
    return {"startingBalance": settings.get("startingBalance", 10000), "currency": settings.get("currency", "USD"), "darkMode": settings.get("darkMode", True)}

@api_router.put("/settings")
async def update_settings(settings: SettingsModel):
    settings_dict = settings.model_dump()
    settings_dict["key"] = "app_settings"
    await db.settings.update_one({"key": "app_settings"}, {"$set": settings_dict}, upsert=True)
    return settings_dict

@api_router.get("/market-data")
async def get_market_data():
    """Fetch market data using yfinance"""
    try:
        import yfinance as yf
        import numpy as np
        
        tickers_map = {
            "S&P 500": {"ticker": "^GSPC", "category": "Indici"},
            "NASDAQ": {"ticker": "^IXIC", "category": "Indici"},
            "US30": {"ticker": "^DJI", "category": "Indici"},
            "BTC/USD": {"ticker": "BTC-USD", "category": "Crypto"},
            "ETH/USD": {"ticker": "ETH-USD", "category": "Crypto"},
            "SOL/USD": {"ticker": "SOL-USD", "category": "Crypto"},
            "XAU/USD": {"ticker": "GC=F", "category": "Materii Prime"},
            "XAG/USD": {"ticker": "SI=F", "category": "Materii Prime"},
            "EUR/USD": {"ticker": "EURUSD=X", "category": "Valute"},
            "GBP/USD": {"ticker": "GBPUSD=X", "category": "Valute"},
            "USD/JPY": {"ticker": "JPY=X", "category": "Valute"},
            "VIX": {"ticker": "^VIX", "category": "Indici"},
        }
        
        assets = []
        vix_value = 0
        
        for name, info in tickers_map.items():
            try:
                tk = yf.Ticker(info["ticker"])
                hist = tk.history(period="3mo")
                if hist.empty:
                    continue
                
                close = hist["Close"].values
                high = hist["High"].values
                low = hist["Low"].values
                volume = hist["Volume"].values if "Volume" in hist.columns else np.zeros(len(close))
                
                current_price = float(close[-1])
                prev_close = float(close[-2]) if len(close) > 1 else current_price
                open_price = float(hist["Open"].values[-1])
                high_price = float(high[-1])
                low_price = float(low[-1])
                
                # Change calculations
                change_day = ((current_price - prev_close) / prev_close) * 100
                change_week = ((current_price - float(close[-5])) / float(close[-5])) * 100 if len(close) >= 5 else 0
                change_month = ((current_price - float(close[-20])) / float(close[-20])) * 100 if len(close) >= 20 else 0
                
                # RSI calculation
                deltas = np.diff(close[-15:])
                gains = np.where(deltas > 0, deltas, 0)
                losses = np.where(deltas < 0, -deltas, 0)
                avg_gain = np.mean(gains) if len(gains) > 0 else 0
                avg_loss = np.mean(losses) if len(losses) > 0 else 0.001
                rs = avg_gain / avg_loss if avg_loss != 0 else 100
                rsi = 100 - (100 / (1 + rs))
                
                # Moving averages
                ma20 = float(np.mean(close[-20:])) if len(close) >= 20 else current_price
                ma50 = float(np.mean(close[-50:])) if len(close) >= 50 else current_price
                ma200 = float(np.mean(close[-60:])) if len(close) >= 60 else current_price
                
                # MACD
                ema12 = float(np.mean(close[-12:])) if len(close) >= 12 else current_price
                ema26 = float(np.mean(close[-26:])) if len(close) >= 26 else current_price
                macd_val = ema12 - ema26
                signal_val = macd_val * 0.8
                histogram = macd_val - signal_val
                
                # Bollinger Bands
                bb_std = float(np.std(close[-20:])) if len(close) >= 20 else 0
                bb_upper = ma20 + 2 * bb_std
                bb_lower = ma20 - 2 * bb_std
                
                # ATR
                tr_values = []
                for i in range(-min(14, len(close)-1), 0):
                    tr = max(high[i] - low[i], abs(high[i] - close[i-1]), abs(low[i] - close[i-1]))
                    tr_values.append(tr)
                atr = float(np.mean(tr_values)) if tr_values else 0
                
                # Stochastic
                lowest_low = float(np.min(low[-14:])) if len(low) >= 14 else low_price
                highest_high = float(np.max(high[-14:])) if len(high) >= 14 else high_price
                stoch_k = ((current_price - lowest_low) / (highest_high - lowest_low) * 100) if highest_high != lowest_low else 50
                stoch_d = stoch_k * 0.9
                
                # RVOL
                avg_vol = float(np.mean(volume[-20:])) if len(volume) >= 20 else 1
                current_vol = float(volume[-1]) if len(volume) > 0 else 0
                rvol = current_vol / avg_vol if avg_vol > 0 else 1.0
                
                # Signal calculation
                score = 0
                confluences = []
                if rsi < 35: score += 2; confluences.append("RSI Oversold")
                elif rsi < 45: score += 1; confluences.append("RSI Low")
                elif rsi > 75: score -= 2; confluences.append("RSI Overbought")
                elif rsi > 65: score -= 1; confluences.append("RSI High")
                
                if histogram > 0 and macd_val > 0: score += 2; confluences.append("MACD Bullish")
                elif histogram > 0: score += 1; confluences.append("MACD Positive")
                elif histogram < 0 and macd_val < 0: score -= 2; confluences.append("MACD Bearish")
                elif histogram < 0: score -= 1; confluences.append("MACD Negative")
                
                if ma20 > ma50: score += 1; confluences.append("MA20 > MA50")
                if ma20 < ma50: score -= 1; confluences.append("MA20 < MA50")
                
                if rvol > 1.5: score += 1; confluences.append("High Volume")
                elif rvol < 0.6: score -= 1; confluences.append("Low Volume")
                
                if score >= 3: signal = "BUY"
                elif score <= -3: signal = "SELL"
                else: signal = "WAIT"
                
                trend = "Bullish" if ma20 > ma50 else ("Bearish" if ma20 < ma50 else "Sideways")
                ma_cross = "Golden Cross" if ma20 > ma200 and ma50 < ma200 else ("Death Cross" if ma20 < ma200 and ma50 > ma200 else "None")
                macd_cross = "Bullish" if histogram > 0 else "Bearish"
                
                # Entry/SL/TP
                if signal == "BUY":
                    entry = current_price
                    sl = current_price - 1.5 * atr
                    tp = current_price + 3.0 * atr
                elif signal == "SELL":
                    entry = current_price
                    sl = current_price + 1.5 * atr
                    tp = current_price - 3.0 * atr
                else:
                    entry = current_price
                    sl = current_price - 1.5 * atr
                    tp = current_price + 3.0 * atr
                
                rr = abs(tp - entry) / abs(sl - entry) if abs(sl - entry) > 0 else 0
                probability = min(90, 35 + len(confluences) * 10 + (5 if rvol > 1.2 else 0))
                
                if name == "VIX":
                    vix_value = current_price
                
                asset_data = {
                    "name": name,
                    "ticker": info["ticker"],
                    "category": info["category"],
                    "price": round(current_price, 4),
                    "open": round(open_price, 4),
                    "high": round(high_price, 4),
                    "low": round(low_price, 4),
                    "close": round(current_price, 4),
                    "change_day": round(change_day, 2),
                    "change_week": round(change_week, 2),
                    "change_month": round(change_month, 2),
                    "volume": int(current_vol),
                    "rvol": round(rvol, 2),
                    "rsi": round(rsi, 1),
                    "ma20": round(ma20, 4),
                    "ma50": round(ma50, 4),
                    "ma200": round(ma200, 4),
                    "macd": round(macd_val, 4),
                    "macd_signal": round(signal_val, 4),
                    "macd_histogram": round(histogram, 4),
                    "macd_cross": macd_cross,
                    "bb_upper": round(bb_upper, 4),
                    "bb_lower": round(bb_lower, 4),
                    "atr": round(atr, 4),
                    "stoch_k": round(stoch_k, 1),
                    "stoch_d": round(stoch_d, 1),
                    "signal": signal,
                    "trend": trend,
                    "ma_cross": ma_cross,
                    "score": score,
                    "confluences": confluences,
                    "entry": round(entry, 4),
                    "sl": round(sl, 4),
                    "tp": round(tp, 4),
                    "rr": round(rr, 2),
                    "probability": probability,
                }
                assets.append(asset_data)
            except Exception as e:
                logger.error(f"Error fetching {name}: {e}")
                continue
        
        fear_greed = 55
        if vix_value > 0:
            if vix_value < 15: fear_greed = 80
            elif vix_value < 20: fear_greed = 60
            elif vix_value < 25: fear_greed = 45
            elif vix_value < 30: fear_greed = 30
            else: fear_greed = 15
        
        return {
            "assets": assets,
            "vix": round(vix_value, 2),
            "fear_greed": fear_greed,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "macro": {
                "vix": round(vix_value, 2),
                "fear_greed": fear_greed,
                "fed_rate": 4.5,
                "cpi": 2.8,
                "unemployment": 4.1,
                "yield_10y": 4.35,
                "yield_2y": 4.15,
                "usd_index": 104.2,
            }
        }
    except ImportError:
        return {"error": "yfinance not installed", "assets": [], "timestamp": datetime.now(timezone.utc).isoformat()}
    except Exception as e:
        logger.error(f"Market data error: {e}")
        return {"error": str(e), "assets": [], "timestamp": datetime.now(timezone.utc).isoformat()}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
