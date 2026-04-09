from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from market_engine import (
    market_cache, fetch_all, ACTIVE, NAME_TO_CAT,
    COMPETITORI_MAP, RISK_LIBRARY, CALENDAR_LIBRARY, CATEGORII
)
from chart_analyzer import analyze_chart_image

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════
# MARKET DATA CACHE MANAGEMENT
# ═══════════════════════════════════════════════════════════════

async def _refresh_cache():
    if market_cache.refreshing:
        return
    market_cache.refreshing = True
    try:
        data = await asyncio.to_thread(fetch_all)
        market_cache.set(data)
        logger.info(f"Market cache refreshed: {data['summary']['total']} assets")
    except Exception as e:
        logger.error(f"Cache refresh error: {e}")
        market_cache.refreshing = False


@app.on_event("startup")
async def startup():
    asyncio.create_task(_refresh_cache())


# ═══════════════════════════════════════════════════════════════
# MARKET DATA ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@api_router.get("/market-data")
async def get_market_data():
    data = market_cache.get()
    if data is None:
        if not market_cache.refreshing:
            asyncio.create_task(_refresh_cache())
        return {"loading": True, "assets": [], "summary": None, "macro": {}, "timestamp": None}

    if market_cache.is_stale() and not market_cache.refreshing:
        asyncio.create_task(_refresh_cache())

    return {**data, "cached": True, "loading": False}


@api_router.get("/market-data/refresh")
async def refresh_market_data():
    asyncio.create_task(_refresh_cache())
    return {"message": "Refresh triggered", "currently_refreshing": market_cache.refreshing}


@api_router.get("/asset-detail/{asset_name}")
async def get_asset_detail(asset_name: str):
    data = market_cache.get()
    if not data:
        raise HTTPException(404, "Market data not loaded yet. Please wait for initial data fetch.")

    asset = next((a for a in data["assets"] if a["name"] == asset_name), None)
    if not asset:
        raise HTTPException(404, f"Asset '{asset_name}' not found")

    category = asset["category"]
    comp_names = COMPETITORI_MAP.get(category, [])
    competitors = [a for a in data["assets"] if a["name"] in comp_names and a["name"] != asset_name]
    risks = RISK_LIBRARY.get(category, [])
    calendar = CALENDAR_LIBRARY.get(category, [])

    return {
        "asset": asset,
        "competitors": competitors,
        "risks": risks,
        "calendar": calendar,
        "macro": data.get("macro", {}),
    }


# ═══════════════════════════════════════════════════════════════
# CHART ANALYSIS ENDPOINT
# ═══════════════════════════════════════════════════════════════

class ChartAnalysisRequest(BaseModel):
    image_base64: str
    prompt: Optional[str] = ""


@api_router.post("/analyze-chart")
async def analyze_chart(req: ChartAnalysisRequest):
    if not req.image_base64:
        raise HTTPException(400, "Image is required")
    result = await analyze_chart_image(req.image_base64, req.prompt or "")
    return {"analysis": result}


# ═══════════════════════════════════════════════════════════════
# HISTORIC TRENDING ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@api_router.get("/historic-data")
async def get_historic_data():
    records = await db.historic_trending.find({}, {"_id": 0}).sort("date", -1).to_list(100)
    return records


@api_router.post("/historic-data/snapshot")
async def save_historic_snapshot():
    data = market_cache.get()
    if not data:
        raise HTTPException(404, "No market data available")

    month_key = datetime.now().strftime("%b %Y")
    existing = await db.historic_trending.find_one({"month": month_key})
    if existing:
        return {"message": f"Snapshot {month_key} already exists", "exists": True}

    summary = data["summary"]
    macro = data.get("macro", {})

    snapshot = {
        "month": month_key,
        "date": datetime.now(timezone.utc).isoformat(),
        "buy_count": summary["buy_count"],
        "sell_count": summary["sell_count"],
        "wait_count": summary["wait_count"],
        "trend": summary["trend"],
        "vix": macro.get("VIX", {}).get("value") if isinstance(macro.get("VIX"), dict) else None,
        "fear_greed": macro.get("fear_greed", {}).get("value"),
        "total_assets": summary["total"],
    }

    await db.historic_trending.insert_one(snapshot)
    saved = await db.historic_trending.find_one({"month": month_key}, {"_id": 0})
    return {"message": f"Snapshot {month_key} saved", "data": saved}


# ═══════════════════════════════════════════════════════════════
# SETTINGS
# ═══════════════════════════════════════════════════════════════

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"key": "app_settings"}, {"_id": 0})
    if not settings:
        default = {"key": "app_settings", "darkMode": True}
        await db.settings.insert_one(default)
        settings = await db.settings.find_one({"key": "app_settings"}, {"_id": 0})
    return {"darkMode": settings.get("darkMode", True)}


# ═══════════════════════════════════════════════════════════════
# APP SETUP
# ═══════════════════════════════════════════════════════════════

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
