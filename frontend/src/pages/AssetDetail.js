import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/constants";

const SignalBadge = ({ signal }) => {
  const cfg = {
    BUY: "bg-trade-win-bg text-trade-win-text border-trade-win-border",
    SELL: "bg-trade-loss-bg text-trade-loss-text border-trade-loss-border",
    WAIT: "bg-trade-warn-bg text-trade-warn-text border-trade-warn-border",
  };
  return <Badge className={`${cfg[signal] || cfg.WAIT} border text-sm px-3 py-1`}>{signal}</Badge>;
};

const CompetitorsTable = ({ assets, currentAsset }) => {
  const competitors = useMemo(
    () => assets.filter(a => a.category === currentAsset.category).slice(0, 6),
    [assets, currentAsset.category]
  );
  return (
    <Card className="bg-[#1a1d29] border-[#2a2d3a]">
      <CardHeader className="pb-2 p-4">
        <CardTitle className="text-sm font-heading text-trade-text-primary">Same Category Comparison</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#2a2d3a]">
              {["Asset", "Price", "Day%", "RSI", "Signal", "Trend"].map(h => (
                <th key={h} className="text-[10px] uppercase tracking-widest text-trade-text-secondary text-left py-2 px-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competitors.map(a => (
              <tr key={a.name} className={`border-b border-[#2a2d3a] hover:bg-white/5 ${a.name === currentAsset.name ? "bg-trade-accent/5" : ""}`}>
                <td className="py-2 px-3 font-heading font-bold">{a.name}</td>
                <td className="py-2 px-3 font-mono-num">{formatNumber(a.price, a.price > 100 ? 2 : 4)}</td>
                <td className={`py-2 px-3 font-mono-num ${a.change_day >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{a.change_day}%</td>
                <td className="py-2 px-3 font-mono-num">{a.rsi?.toFixed(1)}</td>
                <td className="py-2 px-3"><Badge className={`text-[10px] ${a.signal === "BUY" ? "bg-trade-win-bg text-trade-win-text" : a.signal === "SELL" ? "bg-trade-loss-bg text-trade-loss-text" : "bg-trade-warn-bg text-trade-warn-text"}`}>{a.signal}</Badge></td>
                <td className="py-2 px-3 text-trade-text-secondary">{a.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default function AssetDetail({ marketData, loading, onFetch }) {
  const assets = marketData?.assets || [];
  const [selectedAsset, setSelectedAsset] = useState(assets[0]?.name || "");

  const asset = assets.find(a => a.name === selectedAsset);

  if (!marketData) {
    return (
      <div className="space-y-4" data-testid="asset-detail-page">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-trade-text-primary">Asset Detail</h2>
          <Button data-testid="fetch-asset-data-btn" onClick={onFetch} disabled={loading} className="bg-trade-accent hover:bg-trade-accent/90 text-white">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Fetching..." : "Fetch Market Data"}
          </Button>
        </div>
        <Card className="bg-[#1a1d29] border-[#2a2d3a]">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-8 h-8 text-trade-warn-text mx-auto mb-3" />
            <p className="text-trade-text-primary font-heading">Load market data first</p>
            <p className="text-sm text-trade-text-secondary mt-1">Click "Fetch Market Data" to load live data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="asset-detail-page">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-xl font-bold text-trade-text-primary">Asset Detail</h2>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger data-testid="asset-selector" className="w-48 bg-[#0f1117] border-[#2a2d3a] text-trade-text-primary">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
              {assets.map(a => <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onFetch} disabled={loading} size="sm" className="bg-trade-accent hover:bg-trade-accent/90 text-white">
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {asset ? (
        <div className="space-y-4">
          {/* Signal Card */}
          <Card className="bg-[#1a1d29] border-[#2a2d3a]">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-heading text-trade-text-primary">Entry Signal</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center gap-4 mb-4">
                <SignalBadge signal={asset.signal} />
                <span className="font-mono-num text-2xl font-bold text-trade-accent">{asset.probability}% probability</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  ["Entry", formatNumber(asset.entry, asset.price > 100 ? 2 : 4)],
                  ["Stop Loss", formatNumber(asset.sl, asset.price > 100 ? 2 : 4)],
                  ["Take Profit", formatNumber(asset.tp, asset.price > 100 ? 2 : 4)],
                  ["R:R Ratio", asset.rr?.toFixed(2)],
                  ["Score", asset.score],
                  ["Confluences", asset.confluences?.length || 0],
                ].map(([label, val]) => (
                  <div key={label} className="bg-[#0f1117] rounded-md p-3 border border-[#2a2d3a]">
                    <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">{label}</p>
                    <p className="font-mono-num text-base font-bold text-trade-text-primary mt-1">{val}</p>
                  </div>
                ))}
              </div>
              {asset.confluences?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {asset.confluences.map((c) => (
                    <Badge key={c} className="bg-trade-accent/10 text-trade-accent border-trade-accent/20 border text-xs">{c}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Indicators */}
          <Card className="bg-[#1a1d29] border-[#2a2d3a]">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-heading text-trade-text-primary">Technical Indicators</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  ["RSI (14)", asset.rsi?.toFixed(1), asset.rsi < 30 ? "text-trade-win-text" : asset.rsi > 70 ? "text-trade-loss-text" : "text-trade-text-primary"],
                  ["MA 20", formatNumber(asset.ma20, 2), "text-trade-text-primary"],
                  ["MA 50", formatNumber(asset.ma50, 2), "text-trade-text-primary"],
                  ["MA 200", formatNumber(asset.ma200, 2), "text-trade-text-primary"],
                  ["MACD", asset.macd?.toFixed(4), asset.macd >= 0 ? "text-trade-win-text" : "text-trade-loss-text"],
                  ["MACD Signal", asset.macd_signal?.toFixed(4), "text-trade-text-primary"],
                  ["Histogram", asset.macd_histogram?.toFixed(4), asset.macd_histogram >= 0 ? "text-trade-win-text" : "text-trade-loss-text"],
                  ["BB Upper", formatNumber(asset.bb_upper, 2), "text-trade-text-primary"],
                  ["BB Lower", formatNumber(asset.bb_lower, 2), "text-trade-text-primary"],
                  ["ATR", asset.atr?.toFixed(4), "text-trade-text-primary"],
                  ["Stoch %K", asset.stoch_k?.toFixed(1), "text-trade-text-primary"],
                  ["Stoch %D", asset.stoch_d?.toFixed(1), "text-trade-text-primary"],
                ].map(([label, val, color]) => (
                  <div key={label} className="bg-[#0f1117] rounded-md p-2.5 border border-[#2a2d3a]">
                    <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">{label}</p>
                    <p className={`font-mono-num text-sm font-semibold mt-0.5 ${color}`}>{val}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prices & Volume */}
          <Card className="bg-[#1a1d29] border-[#2a2d3a]">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-heading text-trade-text-primary">Prices & Volume</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ["Open", formatNumber(asset.open, asset.price > 100 ? 2 : 4)],
                  ["High", formatNumber(asset.high, asset.price > 100 ? 2 : 4)],
                  ["Low", formatNumber(asset.low, asset.price > 100 ? 2 : 4)],
                  ["Close", formatNumber(asset.close, asset.price > 100 ? 2 : 4)],
                  ["Day Change", `${asset.change_day >= 0 ? "+" : ""}${asset.change_day}%`],
                  ["Week Change", `${asset.change_week >= 0 ? "+" : ""}${asset.change_week}%`],
                  ["Month Change", `${asset.change_month >= 0 ? "+" : ""}${asset.change_month}%`],
                  ["RVOL", asset.rvol?.toFixed(2)],
                ].map(([label, val]) => (
                  <div key={label} className="bg-[#0f1117] rounded-md p-2.5 border border-[#2a2d3a]">
                    <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">{label}</p>
                    <p className="font-mono-num text-sm font-semibold text-trade-text-primary mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitors */}
          <Card className="bg-[#1a1d29] border-[#2a2d3a]">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-heading text-trade-text-primary">Same Category Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#2a2d3a]">
                    {["Asset", "Price", "Day%", "RSI", "Signal", "Trend"].map(h => (
                      <th key={h} className="text-[10px] uppercase tracking-widest text-trade-text-secondary text-left py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.filter(a => a.category === asset.category).slice(0, 6).map(a => (
                    <tr key={a.name} className={`border-b border-[#2a2d3a] hover:bg-white/5 ${a.name === asset.name ? "bg-trade-accent/5" : ""}`}>
                      <td className="py-2 px-3 font-heading font-bold">{a.name}</td>
                      <td className="py-2 px-3 font-mono-num">{formatNumber(a.price, a.price > 100 ? 2 : 4)}</td>
                      <td className={`py-2 px-3 font-mono-num ${a.change_day >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{a.change_day}%</td>
                      <td className="py-2 px-3 font-mono-num">{a.rsi?.toFixed(1)}</td>
                      <td className="py-2 px-3"><Badge className={`text-[10px] ${a.signal === "BUY" ? "bg-trade-win-bg text-trade-win-text" : a.signal === "SELL" ? "bg-trade-loss-bg text-trade-loss-text" : "bg-trade-warn-bg text-trade-warn-text"}`}>{a.signal}</Badge></td>
                      <td className="py-2 px-3 text-trade-text-secondary">{a.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-[#1a1d29] border-[#2a2d3a]">
          <CardContent className="p-8 text-center text-trade-text-secondary">
            <p>Select an asset to view details</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
