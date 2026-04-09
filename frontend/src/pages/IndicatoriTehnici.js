import React, { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import { CATEGORIES, rsiColor, trendColor, formatPrice } from "@/lib/market-utils";

export default function IndicatoriTehnici({ marketData }) {
  const [category, setCategory] = useState("ALL");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const assets = marketData?.assets || [];

  const filtered = useMemo(() => {
    let list = category === "ALL" ? assets : assets.filter(a => a.category === category);
    list.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      return sortDir === "asc" ? (typeof va === "string" ? va.localeCompare(vb) : va - vb) : (typeof va === "string" ? vb.localeCompare(va) : vb - va);
    });
    return list;
  }, [assets, category, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const TH = ({ k, label }) => (
    <th onClick={() => toggleSort(k)}
      className="px-2 py-2 text-left text-[10px] font-medium text-trade-text-secondary cursor-pointer hover:text-trade-accent whitespace-nowrap">
      <span className="flex items-center gap-1">{label} <ArrowUpDown className="w-2.5 h-2.5" /></span>
    </th>
  );

  const macdColor = (cross) => {
    if (!cross) return "text-trade-text-secondary";
    if (cross.includes("pozitiv")) return "text-emerald-400";
    if (cross.includes("negativ")) return "text-red-400";
    return "text-amber-400";
  };

  const maCrossColor = (cross) => {
    if (cross === "Golden Cross") return "text-emerald-400";
    if (cross === "Death Cross") return "text-red-400";
    return "text-trade-text-secondary";
  };

  return (
    <div className="space-y-3" data-testid="indicatori-tehnici-page">
      <div className="flex gap-1 flex-wrap mb-3">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)} data-testid={`cat-${c.key}`}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors
              ${category === c.key ? "bg-trade-accent text-white" : "bg-white/5 text-trade-text-secondary hover:bg-white/10"}`}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="bg-[#161923] border border-trade-border rounded-lg overflow-x-auto">
        <table className="w-full text-xs" data-testid="tehnici-table">
          <thead className="border-b border-trade-border bg-white/[0.02]">
            <tr>
              <TH k="name" label="Activ" />
              <TH k="price" label="Pret" />
              <TH k="ma20" label="MA20" />
              <TH k="ma50" label="MA50" />
              <TH k="ma200" label="MA200" />
              <TH k="ma_cross" label="MA Cross" />
              <TH k="rsi" label="RSI" />
              <TH k="rsi_status" label="RSI Status" />
              <TH k="macd" label="MACD" />
              <TH k="macd_histogram" label="Histogram" />
              <TH k="macd_cross" label="MACD Cross" />
              <TH k="bb_upper" label="BB Sup" />
              <TH k="bb_lower" label="BB Inf" />
              <TH k="atr" label="ATR" />
              <TH k="stoch_k" label="Stoch %K" />
              <TH k="stoch_d" label="Stoch %D" />
              <TH k="trend" label="Trend" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.ticker} className="border-b border-trade-border/50 hover:bg-white/[0.02] transition-colors">
                <td className="px-2 py-1.5 font-medium text-trade-text-primary whitespace-nowrap">{a.name}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-primary font-bold">{formatPrice(a.price)}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-secondary">{a.ma20 ? formatPrice(a.ma20) : "-"}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-secondary">{a.ma50 ? formatPrice(a.ma50) : "-"}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-secondary">{a.ma200 ? formatPrice(a.ma200) : "-"}</td>
                <td className={`px-2 py-1.5 font-medium ${maCrossColor(a.ma_cross)}`}>{a.ma_cross}</td>
                <td className={`px-2 py-1.5 font-mono font-bold ${rsiColor(a.rsi)}`}>{a.rsi}</td>
                <td className={`px-2 py-1.5 ${rsiColor(a.rsi)}`}>{a.rsi_status}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-primary">{a.macd?.toFixed(4)}</td>
                <td className={`px-2 py-1.5 font-mono ${a.macd_histogram > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {a.macd_histogram?.toFixed(4)}
                </td>
                <td className={`px-2 py-1.5 ${macdColor(a.macd_cross)}`}>{a.macd_cross}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-secondary">{a.bb_upper ? formatPrice(a.bb_upper) : "-"}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-secondary">{a.bb_lower ? formatPrice(a.bb_lower) : "-"}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-primary">{a.atr?.toFixed(4)}</td>
                <td className={`px-2 py-1.5 font-mono ${a.stoch_k > 80 ? "text-red-400" : a.stoch_k < 20 ? "text-emerald-400" : "text-trade-text-primary"}`}>{a.stoch_k}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-secondary">{a.stoch_d}</td>
                <td className={`px-2 py-1.5 font-medium ${trendColor(a.trend)}`}>{a.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[10px] text-trade-text-secondary text-right">{filtered.length} active</div>
    </div>
  );
}
