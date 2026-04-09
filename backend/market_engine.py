"""
Market Analysis Engine - Professional Market Data with Technical Indicators
Uses yfinance for free market data, calculates RSI, MACD, MA, Bollinger, ATR, Stochastic.
Generates BUY/SELL/WAIT signals with confluence scoring.
"""
import time
import threading
import logging
import requests
import pandas as pd
import numpy as np
import yfinance as yf
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple

log = logging.getLogger("market_engine")

# ═══════════════════════════════════════════════════════════════
# ASSET DICTIONARIES
# ═══════════════════════════════════════════════════════════════

INDICI = {
    "S&P 500": "^GSPC", "NASDAQ 100": "^NDX", "NASDAQ Comp.": "^IXIC",
    "Dow Jones": "^DJI", "Russell 2000": "^RUT", "DAX Germany": "^GDAXI",
    "FTSE 100": "^FTSE", "CAC 40": "^FCHI", "Nikkei 225": "^N225",
    "Hang Seng": "^HSI", "Shanghai": "000001.SS",
    "MSCI World": "URTH", "MSCI EM": "EEM",
}

ACTIUNI = {
    "Apple": "AAPL", "Microsoft": "MSFT", "NVIDIA": "NVDA", "Alphabet": "GOOGL",
    "Amazon": "AMZN", "Meta": "META", "Tesla": "TSLA", "Berkshire B": "BRK-B",
    "JPMorgan": "JPM", "Visa": "V", "UnitedHealth": "UNH", "Exxon Mobil": "XOM",
    "Johnson&Johnson": "JNJ", "Procter&Gamble": "PG", "ASML": "ASML",
    "TSMC": "TSM", "Netflix": "NFLX", "Adobe": "ADBE", "Salesforce": "CRM",
    "Palantir": "PLTR", "AMD": "AMD", "Intel": "INTC", "Broadcom": "AVGO",
    "Qualcomm": "QCOM", "PayPal": "PYPL", "Coinbase": "COIN",
    "Robinhood": "HOOD", "Cathie Wood ARK": "ARKK", "SPY ETF": "SPY",
}

CRYPTO = {
    "Bitcoin": "BTC-USD", "Ethereum": "ETH-USD", "BNB": "BNB-USD",
    "Solana": "SOL-USD", "XRP": "XRP-USD", "Cardano": "ADA-USD",
    "Avalanche": "AVAX-USD", "Polkadot": "DOT-USD", "Polygon": "MATIC-USD",
    "Chainlink": "LINK-USD", "Uniswap": "UNI-USD", "Litecoin": "LTC-USD",
    "Dogecoin": "DOGE-USD", "Shiba Inu": "SHIB-USD", "TRON": "TRX-USD",
    "Stellar": "XLM-USD", "Cosmos": "ATOM-USD",
    "Filecoin": "FIL-USD", "Hedera": "HBAR-USD",
    "Algorand": "ALGO-USD", "NEAR Protocol": "NEAR-USD",
}

VALUTE = {
    "EUR/USD": "EURUSD=X", "GBP/USD": "GBPUSD=X", "USD/JPY": "USDJPY=X",
    "USD/CHF": "USDCHF=X", "AUD/USD": "AUDUSD=X", "USD/CAD": "USDCAD=X",
    "NZD/USD": "NZDUSD=X", "EUR/GBP": "EURGBP=X", "EUR/JPY": "EURJPY=X",
    "USD/TRY": "USDTRY=X",
}

MATERII_PRIME = {
    "Gold": "GC=F", "Silver": "SI=F", "Oil WTI": "CL=F", "Oil Brent": "BZ=F",
    "Natural Gas": "NG=F", "Copper": "HG=F", "Platinum": "PL=F",
    "Palladium": "PA=F", "Corn": "ZC=F", "Wheat": "ZW=F",
    "Coffee": "KC=F", "Sugar": "SB=F", "Cotton": "CT=F",
}

ACTIVE = {**INDICI, **ACTIUNI, **CRYPTO, **VALUTE, **MATERII_PRIME}

MACRO_TICKERS = {
    "VIX": "^VIX",
    "Yield 10Y US": "^TNX",
    "Yield 30Y US": "^TYX",
    "USD Index": "DX-Y.NYB",
}

CATEGORII = [
    ("INDICI", INDICI), ("ACTIUNI", ACTIUNI), ("CRYPTO", CRYPTO),
    ("VALUTE", VALUTE), ("MATERII_PRIME", MATERII_PRIME),
]

NAME_TO_CAT = {}
for _cat, _dict in CATEGORII:
    for _name in _dict:
        NAME_TO_CAT[_name] = _cat

COMPETITORI_MAP = {
    "INDICI": ["S&P 500", "NASDAQ 100", "Dow Jones", "DAX Germany", "FTSE 100", "Nikkei 225"],
    "ACTIUNI": ["Apple", "Microsoft", "NVIDIA", "Alphabet", "Amazon", "Meta"],
    "CRYPTO": ["Bitcoin", "Ethereum", "BNB", "Solana", "XRP", "Cardano"],
    "VALUTE": ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD"],
    "MATERII_PRIME": ["Gold", "Silver", "Oil WTI", "Oil Brent", "Natural Gas", "Copper"],
}

RISK_LIBRARY = {
    "INDICI": [
        {"id": "R-I-01", "tip": "Sistemic", "desc": "Recesiune globala / contractie PIB", "impact": 5, "prob": 30, "orizont": "6-12 luni"},
        {"id": "R-I-02", "tip": "Macro", "desc": "Crestere agresiva rate dobanda FED", "impact": 4, "prob": 35, "orizont": "3-6 luni"},
        {"id": "R-I-03", "tip": "Geopolitic", "desc": "Conflict armat major / tensiuni globale", "impact": 4, "prob": 25, "orizont": "0-3 luni"},
        {"id": "R-I-04", "tip": "Sectorial", "desc": "Criza bancara sistemica", "impact": 5, "prob": 20, "orizont": "3-12 luni"},
        {"id": "R-I-05", "tip": "Tehnic", "desc": "Spargere suport major / Death Cross", "impact": 3, "prob": 40, "orizont": "1-3 luni"},
        {"id": "R-I-06", "tip": "Lichiditate", "desc": "Criza lichiditate / credit crunch", "impact": 4, "prob": 20, "orizont": "6-12 luni"},
    ],
    "ACTIUNI": [
        {"id": "R-A-01", "tip": "Earnings", "desc": "Rezultate financiare sub asteptari", "impact": 3, "prob": 45, "orizont": "0-1 luni"},
        {"id": "R-A-02", "tip": "Macro", "desc": "Stagflatie / crestere costuri operationale", "impact": 4, "prob": 30, "orizont": "3-9 luni"},
        {"id": "R-A-03", "tip": "Reglementari", "desc": "Reglementari antitrust / investigatii", "impact": 3, "prob": 25, "orizont": "6-18 luni"},
        {"id": "R-A-04", "tip": "Tehnic", "desc": "RSI supraextins / divergenta bearish", "impact": 2, "prob": 50, "orizont": "0-1 luni"},
        {"id": "R-A-05", "tip": "Sectorial", "desc": "Disruptie tehnologica / obsolescenta", "impact": 4, "prob": 20, "orizont": "12-36 luni"},
        {"id": "R-A-06", "tip": "Macro", "desc": "Dolar puternic - impact venituri externe", "impact": 3, "prob": 35, "orizont": "3-6 luni"},
    ],
    "CRYPTO": [
        {"id": "R-C-01", "tip": "Reglementar", "desc": "Interdictie / restrictie legala crypto", "impact": 5, "prob": 20, "orizont": "0-6 luni"},
        {"id": "R-C-02", "tip": "Tehnic", "desc": "Spargere suport major / bear market", "impact": 4, "prob": 40, "orizont": "1-3 luni"},
        {"id": "R-C-03", "tip": "Hack", "desc": "Exploit exchange / protocol major", "impact": 5, "prob": 15, "orizont": "0-1 luni"},
        {"id": "R-C-04", "tip": "Macro", "desc": "Risk-off global / fuga spre siguranta", "impact": 4, "prob": 35, "orizont": "0-3 luni"},
        {"id": "R-C-05", "tip": "On-chain", "desc": "Whale dump / manipulare piata", "impact": 3, "prob": 30, "orizont": "0-1 luni"},
        {"id": "R-C-06", "tip": "Lichiditate", "desc": "Criza stablecoin / de-peg major", "impact": 5, "prob": 10, "orizont": "0-1 luni"},
    ],
    "VALUTE": [
        {"id": "R-V-01", "tip": "Macro", "desc": "Divergenta politici monetare FED/BCE", "impact": 4, "prob": 40, "orizont": "3-6 luni"},
        {"id": "R-V-02", "tip": "Geopolitic", "desc": "Criza geopolitica / sanctiuni comerciale", "impact": 3, "prob": 25, "orizont": "0-3 luni"},
        {"id": "R-V-03", "tip": "Lichiditate", "desc": "Volatilitate extrema weekend / gap", "impact": 2, "prob": 30, "orizont": "0-1 saptamani"},
        {"id": "R-V-04", "tip": "Tehnic", "desc": "Interventie banca centrala la nivel cheie", "impact": 3, "prob": 20, "orizont": "0-1 luni"},
        {"id": "R-V-05", "tip": "Macro", "desc": "Surpriza CPI / NFP semnificativa", "impact": 3, "prob": 35, "orizont": "0-1 luni"},
        {"id": "R-V-06", "tip": "Sistemic", "desc": "Criza valutara piata emergenta", "impact": 4, "prob": 15, "orizont": "3-12 luni"},
    ],
    "MATERII_PRIME": [
        {"id": "R-M-01", "tip": "Geopolitic", "desc": "Conflict OPEC+ / embargo petrol", "impact": 5, "prob": 25, "orizont": "0-3 luni"},
        {"id": "R-M-02", "tip": "Macro", "desc": "Incetinire economica China", "impact": 4, "prob": 35, "orizont": "3-12 luni"},
        {"id": "R-M-03", "tip": "Meteo", "desc": "Fenomene climatice extreme / seceta", "impact": 3, "prob": 30, "orizont": "0-6 luni"},
        {"id": "R-M-04", "tip": "USD", "desc": "Apreciere USD puternica", "impact": 3, "prob": 35, "orizont": "3-6 luni"},
        {"id": "R-M-05", "tip": "Tehnic", "desc": "Supraoferta / stocuri in exces", "impact": 3, "prob": 25, "orizont": "3-9 luni"},
        {"id": "R-M-06", "tip": "Reglementar", "desc": "Reglementari energie verde / carbune", "impact": 3, "prob": 20, "orizont": "12-36 luni"},
    ],
}

CALENDAR_LIBRARY = {
    "INDICI": ["FOMC Meeting", "NFP (Non-Farm Payrolls)", "CPI Release", "GDP Report", "PMI Data", "Earnings Season"],
    "ACTIUNI": ["Earnings Report", "FOMC Meeting", "CPI Release", "NFP", "PCE Data", "Retail Sales"],
    "CRYPTO": ["Bitcoin Halving", "FOMC Meeting", "SEC Ruling", "CPI Release", "ETH Upgrade", "Macro Risk Event"],
    "VALUTE": ["FOMC Meeting", "ECB Meeting", "BOE Meeting", "BOJ Meeting", "CPI SUA", "NFP"],
    "MATERII_PRIME": ["OPEC+ Meeting", "EIA Crude Report", "FOMC Meeting", "China PMI", "USD Index Move", "Geopolitical Events"],
}

# ═══════════════════════════════════════════════════════════════
# TECHNICAL INDICATORS (ported from user's Python script)
# ═══════════════════════════════════════════════════════════════

def safe(val, default=0.0):
    try:
        v = float(val)
        if pd.isna(v) or np.isinf(v):
            return default
        return v
    except Exception:
        return default


def sanitize_dict(d):
    """Replace NaN/Infinity with None in a dict for JSON serialization."""
    for k, v in d.items():
        if isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
            d[k] = None
        elif isinstance(v, (np.floating, np.integer)):
            fv = float(v)
            d[k] = None if (np.isnan(fv) or np.isinf(fv)) else fv
    return d


def calc_rsi(prices: pd.Series, period: int = 14) -> float:
    try:
        delta = prices.diff()
        gain = delta.clip(lower=0)
        loss = (-delta).clip(lower=0)
        avg_g = gain.rolling(window=period, min_periods=period).mean()
        avg_l = loss.rolling(window=period, min_periods=period).mean()
        rs = avg_g / avg_l.replace(0, 1e-10)
        rsi = 100 - (100 / (1 + rs))
        result = rsi.iloc[-1]
        return 50.0 if pd.isna(result) else float(result)
    except Exception:
        return 50.0


def calc_macd(prices: pd.Series) -> dict:
    try:
        ema12 = prices.ewm(span=12, adjust=False).mean()
        ema26 = prices.ewm(span=26, adjust=False).mean()
        macd = ema12 - ema26
        signal = macd.ewm(span=9, adjust=False).mean()
        hist = macd - signal
        m, s, h = float(macd.iloc[-1]), float(signal.iloc[-1]), float(hist.iloc[-1])
        if len(hist) >= 2:
            prev_h = float(hist.iloc[-2])
            if m > s and prev_h <= 0 < h:
                cross = "Impuls pozitiv nou"
            elif m > s and h > 0:
                cross = "Impuls pozitiv activ"
            elif m < s and prev_h >= 0 > h:
                cross = "Impuls negativ nou"
            elif m < s and h < 0:
                cross = "Impuls negativ activ"
            else:
                cross = "In asteptare"
        else:
            cross = "In asteptare"
        return {"macd": m, "signal": s, "histogram": h, "cross": cross}
    except Exception:
        return {"macd": 0.0, "signal": 0.0, "histogram": 0.0, "cross": "N/A"}


def calc_ma(prices: pd.Series) -> dict:
    def _ma(n):
        if len(prices) < n:
            return None
        v = prices.rolling(n).mean().iloc[-1]
        return None if pd.isna(v) else float(v)
    ma20, ma50, ma200 = _ma(20), _ma(50), _ma(200)
    macross = "Neutru"
    if ma50 is not None and ma200 is not None:
        if ma50 > ma200:
            macross = "Golden Cross"
        elif ma50 < ma200:
            macross = "Death Cross"
    return {"ma20": ma20, "ma50": ma50, "ma200": ma200, "macross": macross}


def calc_bollinger(prices: pd.Series, period: int = 20) -> dict:
    try:
        m = prices.rolling(period).mean()
        std = prices.rolling(period).std()
        sup = m + 2 * std
        inf = m - 2 * std
        bb_sup = float(sup.iloc[-1]) if pd.notna(sup.iloc[-1]) else None
        bb_inf = float(inf.iloc[-1]) if pd.notna(inf.iloc[-1]) else None
        bb_width = (bb_sup - bb_inf) if bb_sup is not None and bb_inf is not None else None
        return {"bb_sup": bb_sup, "bb_inf": bb_inf, "bb_width": bb_width}
    except Exception:
        return {"bb_sup": None, "bb_inf": None, "bb_width": None}


def calc_atr(hist: pd.DataFrame, period: int = 14) -> float:
    try:
        high = hist["High"]
        low = hist["Low"]
        close = hist["Close"].shift(1)
        tr = pd.concat([high - low, (high - close).abs(), (low - close).abs()], axis=1).max(axis=1)
        atr = tr.rolling(period).mean().iloc[-1]
        return 0.0 if pd.isna(atr) else float(atr)
    except Exception:
        return 0.0


def calc_stochastic(hist: pd.DataFrame, period: int = 14) -> dict:
    try:
        low14 = hist["Low"].rolling(period).min()
        high14 = hist["High"].rolling(period).max()
        denom = (high14 - low14).replace(0, 1e-10)
        k = ((hist["Close"] - low14) / denom * 100)
        d = k.rolling(3).mean()
        sk = float(k.iloc[-1]) if pd.notna(k.iloc[-1]) else 50.0
        sd = float(d.iloc[-1]) if pd.notna(d.iloc[-1]) else 50.0
        return {"stoch_k": sk, "stoch_d": sd}
    except Exception:
        return {"stoch_k": 50.0, "stoch_d": 50.0}


def map_rsi_status(rsi: float) -> str:
    if rsi < 30:
        return "Supravandut"
    if rsi < 45:
        return "Presiune vanzare"
    if rsi <= 55:
        return "Echilibru"
    if rsi <= 70:
        return "Momentum ascendent"
    return "Supracumparat"


def calc_signal(rsi: float, macd_cross: str, ma_cross: str, rvol: float) -> Tuple[str, int, int]:
    score = 0
    r = safe(rsi, 50.0)
    if r < 35: score += 2
    elif r < 45: score += 1
    elif r > 75: score -= 2
    elif r > 65: score -= 1

    mc = str(macd_cross).lower()
    if "impuls pozitiv nou" in mc: score += 2
    elif "impuls pozitiv activ" in mc: score += 1
    elif "impuls negativ nou" in mc: score -= 2
    elif "impuls negativ activ" in mc: score -= 1

    mx = str(ma_cross).lower()
    if "golden cross" in mx: score += 2
    elif "death cross" in mx: score -= 2

    rv = safe(rvol, 1.0)
    if rv > 1.5: score += 1
    elif rv < 0.6: score -= 1

    confluente = min(abs(score), 5)
    if score >= 3:
        semnal = "BUY"
    elif score <= -3:
        semnal = "SELL"
    else:
        semnal = "WAIT"
    return semnal, confluente, score


# ═══════════════════════════════════════════════════════════════
# DATA FETCHING
# ═══════════════════════════════════════════════════════════════

def fetch_single_asset(name: str, ticker: str, category: str) -> Optional[dict]:
    try:
        t = yf.Ticker(ticker)
        hist = t.history(period="1y", interval="1d", auto_adjust=True, timeout=15)
        if hist is None or len(hist) < 5:
            return None
        closes = hist["Close"].dropna()
        if len(closes) < 5:
            return None

        price = round(float(closes.iloc[-1]), 6)
        o_price = round(float(hist["Open"].iloc[-1]), 6)
        h_price = round(float(hist["High"].iloc[-1]), 6)
        l_price = round(float(hist["Low"].iloc[-1]), 6)

        def _pct(idx):
            try:
                prev = float(closes.iloc[idx])
                return round((price - prev) / prev * 100, 4) if prev else 0.0
            except Exception:
                return 0.0

        var_zi = _pct(-2)
        var_sapt = _pct(-6) if len(closes) > 5 else 0.0
        var_luna = _pct(-21) if len(closes) > 20 else 0.0

        vol_ser = hist["Volume"].fillna(0)
        volum = int(vol_ser.iloc[-1])
        avg_vol = int(vol_ser.tail(20).mean()) if len(vol_ser) >= 20 else max(volum, 1)
        rvol = round(volum / avg_vol, 2) if avg_vol > 0 else 1.0

        rsi = calc_rsi(closes)
        rsi_status = map_rsi_status(rsi)
        macd_res = calc_macd(closes)
        ma_res = calc_ma(closes)
        bb_res = calc_bollinger(closes)
        atr = calc_atr(hist)
        stoch = calc_stochastic(hist)

        try:
            mom10 = float(closes.pct_change(10).iloc[-1]) * 100
        except Exception:
            mom10 = 0.0

        ma50 = ma_res["ma50"]
        if ma50:
            if price > ma50 * 1.01:
                trend = "Bullish"
            elif price < ma50 * 0.99:
                trend = "Bearish"
            else:
                trend = "Sideways"
        else:
            trend = "Sideways"

        semnal, confluente, score = calc_signal(rsi, macd_res["cross"], ma_res["macross"], rvol)

        sl, tp, rr = None, None, None
        if semnal == "BUY":
            sl = round(price - 1.5 * atr, 6)
            tp = round(price + 3.0 * atr, 6)
        elif semnal == "SELL":
            sl = round(price + 1.5 * atr, 6)
            tp = round(price - 3.0 * atr, 6)

        if sl is not None and tp is not None:
            risk = abs(price - sl)
            rr = round(abs(tp - price) / risk, 2) if risk > 0 else 0.0

        prob = min(90, 35 + confluente * 10 + (5 if rvol > 1.2 else 0))
        support = round(float(hist["Low"].tail(20).min()), 4)
        resistance = round(float(hist["High"].tail(20).max()), 4)

        return sanitize_dict({
            "name": name, "ticker": ticker, "category": category,
            "price": price, "open": o_price, "high": h_price, "low": l_price,
            "change_day": round(var_zi, 2), "change_week": round(var_sapt, 2), "change_month": round(var_luna, 2),
            "volume": volum, "avg_vol_20": avg_vol, "rvol": rvol,
            "rsi": round(rsi, 1), "rsi_status": rsi_status,
            "macd": round(macd_res["macd"], 6), "macd_signal": round(macd_res["signal"], 6),
            "macd_histogram": round(macd_res["histogram"], 6), "macd_cross": macd_res["cross"],
            "ma20": round(ma_res["ma20"], 4) if ma_res["ma20"] else None,
            "ma50": round(ma_res["ma50"], 4) if ma_res["ma50"] else None,
            "ma200": round(ma_res["ma200"], 4) if ma_res["ma200"] else None,
            "ma_cross": ma_res["macross"],
            "bb_upper": round(bb_res["bb_sup"], 4) if bb_res["bb_sup"] else None,
            "bb_lower": round(bb_res["bb_inf"], 4) if bb_res["bb_inf"] else None,
            "bb_width": round(bb_res["bb_width"], 4) if bb_res["bb_width"] else None,
            "atr": round(atr, 6),
            "stoch_k": round(stoch["stoch_k"], 1), "stoch_d": round(stoch["stoch_d"], 1),
            "momentum_10d": round(mom10, 2),
            "trend": trend,
            "signal": semnal, "score": score, "confluences": confluente,
            "entry": price, "sl": sl, "tp": tp, "rr": rr,
            "probability": prob,
            "support": support, "resistance": resistance,
        })
    except Exception as e:
        log.warning(f"fetch_single_asset({name}, {ticker}): {e}")
        return None


def fetch_fear_greed() -> dict:
    try:
        r = requests.get("https://api.alternative.me/fng/?limit=1", timeout=10)
        r.raise_for_status()
        data = r.json()["data"][0]
        val = int(data["value"])
        cls = data.get("value_classification", "")
        if val >= 55:
            status = "Pozitiv"
        elif val <= 45:
            status = "Negativ"
        else:
            status = "Neutru"
        return {"value": val, "label": cls, "status": status}
    except Exception:
        return {"value": None, "label": "N/A", "status": "Neutru"}


def fetch_all() -> dict:
    all_assets = []
    failed = []

    items = [(name, ticker, NAME_TO_CAT.get(name, "OTHER")) for name, ticker in ACTIVE.items()]
    macro_items = [(name, ticker, "MACRO") for name, ticker in MACRO_TICKERS.items()]
    all_items = items + macro_items

    log.info(f"Fetching {len(all_items)} tickers...")

    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = {
            executor.submit(fetch_single_asset, name, ticker, cat): (name, ticker, cat)
            for name, ticker, cat in all_items
        }
        for future in as_completed(futures):
            name, ticker, cat = futures[future]
            try:
                result = future.result(timeout=30)
                if result:
                    all_assets.append(result)
                else:
                    failed.append(name)
            except Exception as e:
                log.error(f"Fetch error {name}: {e}")
                failed.append(name)

    macro_assets = [a for a in all_assets if a["category"] == "MACRO"]
    regular_assets = [a for a in all_assets if a["category"] != "MACRO"]

    fear_greed = fetch_fear_greed()

    macro = {}
    for ma in macro_assets:
        macro[ma["name"]] = {"value": ma["price"], "change_day": ma["change_day"], "trend": ma["trend"]}
    macro["fear_greed"] = fear_greed

    buy_count = sum(1 for a in regular_assets if a["signal"] == "BUY")
    sell_count = sum(1 for a in regular_assets if a["signal"] == "SELL")
    wait_count = sum(1 for a in regular_assets if a["signal"] == "WAIT")
    total = len(regular_assets) or 1

    pct_buy = buy_count / total * 100
    pct_sell = sell_count / total * 100
    if pct_buy > 55:
        trend_gen = "Bullish"
    elif pct_sell > 55:
        trend_gen = "Bearish"
    else:
        trend_gen = "Mixt"

    vix_val = next((ma["price"] for ma in macro_assets if ma["name"] == "VIX"), 20)
    if vix_val > 30:
        volatilitate = "Ridicata"
    elif vix_val > 20:
        volatilitate = "Moderata"
    else:
        volatilitate = "Scazuta"

    if vix_val > 30:
        risc = "Ridicat"
    elif vix_val > 20:
        risc = "Moderat"
    else:
        risc = "Scazut"

    buy_assets = [a for a in regular_assets if a["signal"] == "BUY"]
    best_signal = None
    if buy_assets:
        best_signal = max(buy_assets, key=lambda x: x["score"])
    elif regular_assets:
        best_signal = max(regular_assets, key=lambda x: x["score"])

    log.info(f"Fetched {len(regular_assets)} assets, {len(failed)} failed. BUY:{buy_count} SELL:{sell_count} WAIT:{wait_count}")

    return {
        "assets": regular_assets,
        "macro": macro,
        "summary": {
            "total": len(regular_assets),
            "buy_count": buy_count,
            "sell_count": sell_count,
            "wait_count": wait_count,
            "trend": trend_gen,
            "volatilitate": volatilitate,
            "risc_sistemic": risc,
            "best_signal": best_signal,
        },
        "failed": failed,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ═══════════════════════════════════════════════════════════════
# CACHE
# ═══════════════════════════════════════════════════════════════

class MarketCache:
    def __init__(self, ttl: int = 900):
        self.data: Optional[dict] = None
        self.timestamp: float = 0
        self.ttl = ttl
        self._lock = threading.Lock()
        self.refreshing = False

    def is_stale(self) -> bool:
        return time.time() - self.timestamp > self.ttl

    def get(self) -> Optional[dict]:
        return self.data

    def set(self, data: dict):
        with self._lock:
            self.data = data
            self.timestamp = time.time()
            self.refreshing = False


market_cache = MarketCache(ttl=900)
