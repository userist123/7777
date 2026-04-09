export const CATEGORIES = [
  { key: "ALL", label: "Toate" },
  { key: "INDICI", label: "Indici" },
  { key: "ACTIUNI", label: "Actiuni" },
  { key: "CRYPTO", label: "Crypto" },
  { key: "VALUTE", label: "Valute" },
  { key: "MATERII_PRIME", label: "Materii Prime" },
];

export const signalColor = (signal) => {
  switch (signal) {
    case "BUY": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "SELL": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  }
};

export const trendColor = (trend) => {
  if (!trend) return "text-trade-text-secondary";
  const t = trend.toLowerCase();
  if (t.includes("bullish")) return "text-emerald-400";
  if (t.includes("bearish")) return "text-red-400";
  return "text-amber-400";
};

export const rsiColor = (rsi) => {
  if (rsi < 30) return "text-emerald-400";
  if (rsi < 45) return "text-yellow-400";
  if (rsi <= 55) return "text-trade-text-secondary";
  if (rsi <= 70) return "text-orange-400";
  return "text-red-400";
};

export const pctColor = (val) => {
  if (val > 0) return "text-emerald-400";
  if (val < 0) return "text-red-400";
  return "text-trade-text-secondary";
};

export const formatPrice = (price) => {
  if (price == null) return "-";
  if (Math.abs(price) >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (Math.abs(price) >= 1) return price.toFixed(4);
  return price.toFixed(6);
};

export const formatPct = (val) => {
  if (val == null) return "-";
  return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
};

export const formatVolume = (vol) => {
  if (!vol) return "-";
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
  return vol.toString();
};
