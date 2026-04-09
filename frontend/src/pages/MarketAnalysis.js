import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/constants";

const SignalBadge = ({ signal }) => {
  const cfg = {
    BUY: "bg-trade-win-bg text-trade-win-text border-trade-win-border",
    SELL: "bg-trade-loss-bg text-trade-loss-text border-trade-loss-border",
    WAIT: "bg-trade-warn-bg text-trade-warn-text border-trade-warn-border",
  };
  return <Badge className={`${cfg[signal] || cfg.WAIT} border text-xs`}>{signal}</Badge>;
};

const TrendBadge = ({ trend }) => {
  if (trend === "Bullish") return <span className="flex items-center gap-1 text-xs text-trade-win-text"><TrendingUp className="w-3 h-3" />Bullish</span>;
  if (trend === "Bearish") return <span className="flex items-center gap-1 text-xs text-trade-loss-text"><TrendingDown className="w-3 h-3" />Bearish</span>;
  return <span className="flex items-center gap-1 text-xs text-trade-warn-text"><Minus className="w-3 h-3" />Sideways</span>;
};

const RsiColor = ({ value }) => {
  let color = "text-trade-text-primary";
  if (value < 30) color = "text-trade-win-text";
  else if (value < 50) color = "text-trade-warn-text";
  else if (value < 70) color = "text-green-400";
  else color = "text-trade-loss-text";
  return <span className={`font-mono-num ${color}`}>{value?.toFixed(1)}</span>;
};

const GaugeChart = ({ value, max = 100, label, unit = "" }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const angle = -90 + (pct / 100) * 180;
  let color = "#4ade80";
  if (pct < 25) color = "#f87171";
  else if (pct < 40) color = "#fbbf24";
  else if (pct < 60) color = "#4ade80";
  else if (pct < 75) color = "#fbbf24";
  else color = "#f87171";

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#2a2d3a" strokeWidth="8" strokeLinecap="round" />
        <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 157} 157`} />
        <text x="60" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="18" fontFamily="JetBrains Mono" fontWeight="bold">{value}{unit}</text>
      </svg>
      <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary mt-1">{label}</p>
    </div>
  );
};

export default function MarketAnalysis({ marketData, loading, onFetch }) {
  const [subTab, setSubTab] = useState("prices");
  const assets = marketData?.assets || [];
  const macro = marketData?.macro || {};

  const groupedAssets = assets.reduce((acc, a) => {
    if (!acc[a.category]) acc[a.category] = [];
    acc[a.category].push(a);
    return acc;
  }, {});

  const signalAssets = [...assets].filter(a => a.signal !== "WAIT" || a.score !== 0).sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  return (
    <div className="space-y-4" data-testid="market-analysis-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-trade-text-primary">Market Analysis</h2>
          {marketData?.timestamp && (
            <p className="text-xs text-trade-text-secondary font-mono-num">
              Last update: {new Date(marketData.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <Button data-testid="fetch-market-data-btn" onClick={onFetch} disabled={loading}
          className="bg-trade-accent hover:bg-trade-accent/90 text-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Fetching..." : "Fetch Market Data"}
        </Button>
      </div>

      {!marketData && !loading && (
        <Card className="bg-[#1a1d29] border-[#2a2d3a]">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-8 h-8 text-trade-warn-text mx-auto mb-3" />
            <p className="text-trade-text-primary font-heading">No market data loaded</p>
            <p className="text-sm text-trade-text-secondary mt-1">Click "Fetch Market Data" to load live data via yfinance</p>
          </CardContent>
        </Card>
      )}

      {marketData && (
        <Tabs value={subTab} onValueChange={setSubTab}>
          <TabsList className="bg-[#1a1d29] border border-[#2a2d3a]">
            <TabsTrigger data-testid="tab-prices" value="prices" className="text-xs data-[state=active]:bg-trade-accent data-[state=active]:text-white">Prices & Volume</TabsTrigger>
            <TabsTrigger data-testid="tab-indicators" value="indicators" className="text-xs data-[state=active]:bg-trade-accent data-[state=active]:text-white">Technical Indicators</TabsTrigger>
            <TabsTrigger data-testid="tab-signals" value="signals" className="text-xs data-[state=active]:bg-trade-accent data-[state=active]:text-white">Entry Signals</TabsTrigger>
            <TabsTrigger data-testid="tab-macro" value="macro" className="text-xs data-[state=active]:bg-trade-accent data-[state=active]:text-white">Macro Indicators</TabsTrigger>
          </TabsList>

          {/* Prices & Volume */}
          <TabsContent value="prices">
            {Object.entries(groupedAssets).map(([category, items]) => (
              <Card key={category} className="bg-[#1a1d29] border-[#2a2d3a] mb-3">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-sm font-heading text-trade-text-primary">{category}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#2a2d3a]">
                        {["Asset", "Open", "High", "Low", "Close", "Day%", "Week%", "Month%", "Volume", "RVOL", "Signal", "Trend"].map(h => (
                          <th key={h} className="text-[10px] uppercase tracking-widest text-trade-text-secondary text-left py-2 px-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(a => (
                        <tr key={a.name} className="border-b border-[#2a2d3a] hover:bg-white/5">
                          <td className="py-2 px-3 font-heading font-bold text-trade-text-primary whitespace-nowrap">{a.name}</td>
                          <td className="py-2 px-3 font-mono-num">{formatNumber(a.open, a.price > 100 ? 2 : 4)}</td>
                          <td className="py-2 px-3 font-mono-num">{formatNumber(a.high, a.price > 100 ? 2 : 4)}</td>
                          <td className="py-2 px-3 font-mono-num">{formatNumber(a.low, a.price > 100 ? 2 : 4)}</td>
                          <td className="py-2 px-3 font-mono-num font-semibold">{formatNumber(a.close, a.price > 100 ? 2 : 4)}</td>
                          <td className={`py-2 px-3 font-mono-num font-semibold ${a.change_day >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{a.change_day >= 0 ? "+" : ""}{a.change_day}%</td>
                          <td className={`py-2 px-3 font-mono-num ${a.change_week >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{a.change_week >= 0 ? "+" : ""}{a.change_week}%</td>
                          <td className={`py-2 px-3 font-mono-num ${a.change_month >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{a.change_month >= 0 ? "+" : ""}{a.change_month}%</td>
                          <td className="py-2 px-3 font-mono-num">{a.volume > 1e6 ? `${(a.volume / 1e6).toFixed(1)}M` : a.volume > 1e3 ? `${(a.volume / 1e3).toFixed(1)}K` : a.volume}</td>
                          <td className={`py-2 px-3 font-mono-num ${a.rvol > 1.5 ? "text-trade-win-text" : a.rvol < 0.6 ? "text-trade-loss-text" : ""}`}>{a.rvol?.toFixed(2)}</td>
                          <td className="py-2 px-3"><SignalBadge signal={a.signal} /></td>
                          <td className="py-2 px-3"><TrendBadge trend={a.trend} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Technical Indicators */}
          <TabsContent value="indicators">
            <Card className="bg-[#1a1d29] border-[#2a2d3a]">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#2a2d3a]">
                      {["Asset", "Price", "MA20", "MA50", "MA200", "RSI(14)", "MACD", "Signal", "Hist", "MACD Cross", "BB Up", "BB Low", "ATR", "Stoch%K", "%D", "Trend", "MA Cross"].map(h => (
                        <th key={h} className="text-[10px] uppercase tracking-widest text-trade-text-secondary text-left py-2 px-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map(a => (
                      <tr key={a.name} className="border-b border-[#2a2d3a] hover:bg-white/5">
                        <td className="py-2 px-3 font-heading font-bold text-trade-text-primary whitespace-nowrap">{a.name}</td>
                        <td className="py-2 px-3 font-mono-num font-semibold">{formatNumber(a.price, a.price > 100 ? 2 : 4)}</td>
                        <td className="py-2 px-3 font-mono-num">{formatNumber(a.ma20, 2)}</td>
                        <td className="py-2 px-3 font-mono-num">{formatNumber(a.ma50, 2)}</td>
                        <td className="py-2 px-3 font-mono-num">{formatNumber(a.ma200, 2)}</td>
                        <td className="py-2 px-3"><RsiColor value={a.rsi} /></td>
                        <td className={`py-2 px-3 font-mono-num ${a.macd >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{a.macd?.toFixed(4)}</td>
                        <td className="py-2 px-3 font-mono-num">{a.macd_signal?.toFixed(4)}</td>
                        <td className={`py-2 px-3 font-mono-num ${a.macd_histogram >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{a.macd_histogram?.toFixed(4)}</td>
                        <td className="py-2 px-3 text-xs">{a.macd_cross}</td>
                        <td className="py-2 px-3 font-mono-num">{formatNumber(a.bb_upper, 2)}</td>
                        <td className="py-2 px-3 font-mono-num">{formatNumber(a.bb_lower, 2)}</td>
                        <td className="py-2 px-3 font-mono-num">{a.atr?.toFixed(4)}</td>
                        <td className="py-2 px-3 font-mono-num">{a.stoch_k?.toFixed(1)}</td>
                        <td className="py-2 px-3 font-mono-num">{a.stoch_d?.toFixed(1)}</td>
                        <td className="py-2 px-3"><TrendBadge trend={a.trend} /></td>
                        <td className="py-2 px-3 text-xs">{a.ma_cross !== "None" ? a.ma_cross : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entry Signals */}
          <TabsContent value="signals">
            <div className="space-y-3">
              {signalAssets.map(a => (
                <Card key={a.name} className="bg-[#1a1d29] border-[#2a2d3a]" data-testid={`signal-card-${a.name}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-bold text-trade-text-primary text-base">{a.name}</span>
                        <SignalBadge signal={a.signal} />
                        <TrendBadge trend={a.trend} />
                      </div>
                      <span className="font-mono-num text-lg font-bold text-trade-accent">{a.probability}%</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      {[
                        ["RSI", a.rsi?.toFixed(1)],
                        ["MACD Cross", a.macd_cross],
                        ["MA Cross", a.ma_cross],
                        ["RVOL", a.rvol?.toFixed(2)],
                        ["Entry", formatNumber(a.entry, a.price > 100 ? 2 : 4)],
                        ["SL", formatNumber(a.sl, a.price > 100 ? 2 : 4)],
                        ["TP", formatNumber(a.tp, a.price > 100 ? 2 : 4)],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">{label}</p>
                          <p className="font-mono-num text-sm font-medium text-trade-text-primary mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {a.confluences?.map((c, i) => (
                        <Badge key={i} className="bg-trade-accent/10 text-trade-accent border-trade-accent/20 border text-[10px]">{c}</Badge>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-trade-text-secondary">
                      R:R Ratio: <span className="font-mono-num font-semibold text-trade-text-primary">{a.rr?.toFixed(2)}</span> | Score: <span className="font-mono-num font-semibold text-trade-text-primary">{a.score}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {signalAssets.length === 0 && (
                <div className="text-center py-12 text-trade-text-secondary">
                  <p className="font-heading">No active signals</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Macro Indicators */}
          <TabsContent value="macro">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <Card className="bg-[#1a1d29] border-[#2a2d3a]">
                <CardContent className="p-4 flex flex-col items-center">
                  <GaugeChart value={macro.vix || 0} max={50} label="VIX" />
                </CardContent>
              </Card>
              <Card className="bg-[#1a1d29] border-[#2a2d3a]">
                <CardContent className="p-4 flex flex-col items-center">
                  <GaugeChart value={macro.fear_greed || 50} max={100} label="Fear & Greed" />
                </CardContent>
              </Card>
              <Card className="bg-[#1a1d29] border-[#2a2d3a]">
                <CardContent className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">USD Index</p>
                  <p className="font-mono-num text-2xl font-bold text-trade-accent mt-1">{macro.usd_index || "N/A"}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1d29] border-[#2a2d3a]">
                <CardContent className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Yield 10Y / 2Y Spread</p>
                  <p className="font-mono-num text-xl font-bold text-trade-text-primary mt-1">
                    {macro.yield_10y || "N/A"} / {macro.yield_2y || "N/A"}
                  </p>
                  <p className="font-mono-num text-sm text-trade-warn-text">
                    Spread: {((macro.yield_10y || 0) - (macro.yield_2y || 0)).toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1d29] border-[#2a2d3a]">
                <CardContent className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Fed Rate</p>
                  <p className="font-mono-num text-2xl font-bold text-trade-accent mt-1">{macro.fed_rate || "N/A"}%</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1d29] border-[#2a2d3a]">
                <CardContent className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">CPI</p>
                  <p className="font-mono-num text-2xl font-bold text-trade-warn-text mt-1">{macro.cpi || "N/A"}%</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1d29] border-[#2a2d3a]">
                <CardContent className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Unemployment</p>
                  <p className="font-mono-num text-2xl font-bold text-trade-text-primary mt-1">{macro.unemployment || "N/A"}%</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
