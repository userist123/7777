export const PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD",
  "EUR/GBP", "EUR/JPY", "GBP/JPY",
  "XAU/USD", "XAG/USD",
  "US30", "NAS100", "SPX500",
  "BTC/USD", "ETH/USD", "BTC/USDT", "ETH/USDT", "SOL/USDT", "DOGE/USDT",
  "ADA/USDT", "XRP/USDT", "DOT/USDT", "ONDO/USDT", "WIF/USDT", "BNB/USDT",
  "ATOM/USDT", "HYPE/USDT", "CRO/USDT", "POL/USDT", "AVAX/USDT", "NEAR/USDT"
];

export const STRATEGIES = ["Strategy 1", "Strategy 2", "Strategy 3", "Strategy 4"];
export const ACCOUNTS = ["Account 1", "Account 2", "Account 3"];
export const DIRECTIONS = ["Buy", "Sell"];
export const TRADE_TYPES = ["Trade", "Deposit", "Withdrawal"];

export const STRATEGY_COLORS = {
  "Strategy 1": "#3b82f6",
  "Strategy 2": "#8b5cf6",
  "Strategy 3": "#06b6d4",
  "Strategy 4": "#f59e0b",
  "Custom": "#6b7280",
};

export const getPipMultiplier = (pair) => {
  if (pair.includes("JPY")) return 100;
  if (pair.includes("XAU")) return 10;
  if (pair.includes("XAG")) return 100;
  if (pair.includes("US30") || pair.includes("NAS100") || pair.includes("SPX500")) return 1;
  if (pair.includes("BTC") || pair.includes("ETH") || pair.includes("SOL") ||
      pair.includes("DOGE") || pair.includes("ADA") || pair.includes("XRP") ||
      pair.includes("DOT") || pair.includes("ONDO") || pair.includes("WIF") ||
      pair.includes("BNB") || pair.includes("ATOM") || pair.includes("HYPE") ||
      pair.includes("CRO") || pair.includes("POL") || pair.includes("AVAX") ||
      pair.includes("NEAR")) return 10000;
  return 10000;
};

export const formatCurrency = (value, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPct = (value) => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export const formatNumber = (value, decimals = 2) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const CHART_COLORS = {
  accent: "#3b82f6",
  win: "#4ade80",
  loss: "#f87171",
  warn: "#fbbf24",
  grid: "#2a2d3a",
  text: "#8892a4",
};
