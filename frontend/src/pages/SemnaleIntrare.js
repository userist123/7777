import React, { useState, useMemo } from "react";
import { ArrowUpDown, Target } from "lucide-react";
import { CATEGORIES, signalColor, formatPrice } from "@/lib/market-utils";

export default function SemnaleIntrare({ marketData }) {
  const [category, setCategory] = useState("ALL");
  const [signalFilter, setSignalFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("score");
  const [sortDir, setSortDir] = useState("desc");

  const assets = marketData?.assets || [];

  const filtered = useMemo(() => {
    let list = category === "ALL" ? assets : assets.filter(a => a.category === category);
    if (signalFilter !== "ALL") list = list.filter(a => a.signal === signalFilter);
    list.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      return sortDir === "asc" ? (typeof va === "string" ? va.localeCompare(vb) : va - vb) : (typeof va === "string" ? vb.localeCompare(va) : vb - va);
    });
    return list;
  }, [assets, category, signalFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const TH = ({ k, label }) => (
    <th onClick={() => toggleSort(k)}
      className="px-2 py-2 text-left text-[10px] font-medium text-trade-text-secondary cursor-pointer hover:text-trade-accent whitespace-nowrap">
      <span className="flex items-center gap-1">{label} <ArrowUpDown className="w-2.5 h-2.5" /></span>
    </th>
  );

  const scoreColor = (s) => {
    if (s >= 3) return "text-emerald-400";
    if (s <= -3) return "text-red-400";
    return "text-amber-400";
  };

  const probColor = (p) => {
    if (p >= 65) return "text-emerald-400";
    if (p >= 50) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-3" data-testid="semnale-intrare-page">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors
                ${category === c.key ? "bg-trade-accent text-white" : "bg-white/5 text-trade-text-secondary hover:bg-white/10"}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {["ALL", "BUY", "SELL", "WAIT"].map(s => (
            <button key={s} onClick={() => setSignalFilter(s)} data-testid={`signal-filter-${s}`}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors border
                ${signalFilter === s
                  ? s === "BUY" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : s === "SELL" ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : s === "WAIT" ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-trade-accent text-white border-trade-accent"
                  : "bg-white/5 text-trade-text-secondary border-transparent hover:bg-white/10"}`}>
              {s === "ALL" ? "Toate" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#161923] border border-trade-border rounded-lg overflow-x-auto">
        <table className="w-full text-xs" data-testid="semnale-table">
          <thead className="border-b border-trade-border bg-white/[0.02]">
            <tr>
              <TH k="name" label="Activ" />
              <TH k="signal" label="Semnal" />
              <TH k="score" label="Score" />
              <TH k="confluences" label="Confluente" />
              <TH k="entry" label="Entry" />
              <TH k="sl" label="Stop Loss" />
              <TH k="tp" label="Take Profit" />
              <TH k="rr" label="R/R" />
              <TH k="probability" label="Probabilit." />
              <TH k="rsi_status" label="RSI Status" />
              <TH k="macd_cross" label="MACD Cross" />
              <TH k="ma_cross" label="MA Cross" />
              <TH k="rvol" label="RVOL" />
              <TH k="trend" label="Trend" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.ticker} className={`border-b border-trade-border/50 hover:bg-white/[0.03] transition-colors
                ${a.signal === "BUY" ? "bg-emerald-500/[0.03]" : a.signal === "SELL" ? "bg-red-500/[0.03]" : ""}`}>
                <td className="px-2 py-1.5 font-medium text-trade-text-primary whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {a.score >= 4 && <Target className="w-3 h-3 text-emerald-400" />}
                    {a.score <= -4 && <Target className="w-3 h-3 text-red-400" />}
                    {a.name}
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${signalColor(a.signal)}`}>{a.signal}</span>
                </td>
                <td className={`px-2 py-1.5 font-mono font-bold text-center ${scoreColor(a.score)}`}>{a.score}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-primary text-center">{a.confluences}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-primary">{formatPrice(a.entry)}</td>
                <td className="px-2 py-1.5 font-mono text-red-400">{a.sl ? formatPrice(a.sl) : "-"}</td>
                <td className="px-2 py-1.5 font-mono text-emerald-400">{a.tp ? formatPrice(a.tp) : "-"}</td>
                <td className={`px-2 py-1.5 font-mono font-bold ${a.rr >= 2 ? "text-emerald-400" : a.rr >= 1 ? "text-amber-400" : "text-trade-text-secondary"}`}>{a.rr || "-"}</td>
                <td className={`px-2 py-1.5 font-mono font-bold ${probColor(a.probability)}`}>{a.probability}%</td>
                <td className="px-2 py-1.5 text-trade-text-secondary">{a.rsi_status}</td>
                <td className={`px-2 py-1.5 ${a.macd_cross?.includes("pozitiv") ? "text-emerald-400" : a.macd_cross?.includes("negativ") ? "text-red-400" : "text-trade-text-secondary"}`}>
                  {a.macd_cross}
                </td>
                <td className={`px-2 py-1.5 ${a.ma_cross === "Golden Cross" ? "text-emerald-400" : a.ma_cross === "Death Cross" ? "text-red-400" : "text-trade-text-secondary"}`}>
                  {a.ma_cross}
                </td>
                <td className={`px-2 py-1.5 font-mono ${a.rvol > 1.5 ? "text-emerald-400 font-bold" : "text-trade-text-primary"}`}>{a.rvol}</td>
                <td className={`px-2 py-1.5 font-medium ${a.trend === "Bullish" ? "text-emerald-400" : a.trend === "Bearish" ? "text-red-400" : "text-amber-400"}`}>{a.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-[10px] text-trade-text-secondary">
        <span>{filtered.length} active | BUY: {filtered.filter(a=>a.signal==="BUY").length} | SELL: {filtered.filter(a=>a.signal==="SELL").length} | WAIT: {filtered.filter(a=>a.signal==="WAIT").length}</span>
        <span>Score {"≥"}3 = BUY | Score {"≤"}-3 = SELL</span>
      </div>
    </div>
  );
}
