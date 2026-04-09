import React, { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import { CATEGORIES, signalColor, trendColor, pctColor, formatPrice, formatPct, formatVolume } from "@/lib/market-utils";

const CategoryTabs = ({ selected, onSelect }) => (
  <div className="flex gap-1 flex-wrap mb-3" data-testid="category-tabs">
    {CATEGORIES.map(c => (
      <button key={c.key} onClick={() => onSelect(c.key)} data-testid={`cat-tab-${c.key}`}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors
          ${selected === c.key ? "bg-trade-accent text-white" : "bg-white/5 text-trade-text-secondary hover:bg-white/10"}`}>
        {c.label}
      </button>
    ))}
  </div>
);

export default function PreturiVolume({ marketData }) {
  const [category, setCategory] = useState("ALL");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [search, setSearch] = useState("");

  const assets = marketData?.assets || [];

  const filtered = useMemo(() => {
    let list = category === "ALL" ? assets : assets.filter(a => a.category === category);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(s) || a.ticker.toLowerCase().includes(s));
    }
    list.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = typeof va === "string" ? va.localeCompare(vb) : va - vb;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [assets, category, sortKey, sortDir, search]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const TH = ({ k, label, className = "" }) => (
    <th onClick={() => toggleSort(k)}
      className={`px-2 py-2 text-left text-[10px] font-medium text-trade-text-secondary cursor-pointer hover:text-trade-accent whitespace-nowrap ${className}`}>
      <span className="flex items-center gap-1">{label} <ArrowUpDown className="w-2.5 h-2.5" /></span>
    </th>
  );

  return (
    <div className="space-y-3" data-testid="preturi-volume-page">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <CategoryTabs selected={category} onSelect={setCategory} />
        <input data-testid="search-input" type="text" placeholder="Cauta activ..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-white/5 border border-trade-border rounded px-3 py-1.5 text-xs text-trade-text-primary placeholder:text-trade-text-secondary/50 w-full sm:w-52 focus:outline-none focus:border-trade-accent" />
      </div>
      <div className="bg-[#161923] border border-trade-border rounded-lg overflow-x-auto">
        <table className="w-full text-xs" data-testid="preturi-table">
          <thead className="border-b border-trade-border bg-white/[0.02]">
            <tr>
              <TH k="name" label="Activ" />
              <TH k="category" label="Categorie" />
              <TH k="open" label="Open" />
              <TH k="high" label="High" />
              <TH k="low" label="Low" />
              <TH k="price" label="Close" />
              <TH k="change_day" label="Var Zi%" />
              <TH k="change_week" label="Var Sapt%" />
              <TH k="change_month" label="Var Luna%" />
              <TH k="volume" label="Volum" />
              <TH k="rvol" label="RVOL" />
              <TH k="signal" label="Semnal" />
              <TH k="trend" label="Trend" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.ticker} className="border-b border-trade-border/50 hover:bg-white/[0.02] transition-colors">
                <td className="px-2 py-1.5 font-medium text-trade-text-primary whitespace-nowrap">{a.name}</td>
                <td className="px-2 py-1.5 text-trade-text-secondary">{a.category}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-primary">{formatPrice(a.open)}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-primary">{formatPrice(a.high)}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-primary">{formatPrice(a.low)}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-primary font-bold">{formatPrice(a.price)}</td>
                <td className={`px-2 py-1.5 font-mono font-bold ${pctColor(a.change_day)}`}>{formatPct(a.change_day)}</td>
                <td className={`px-2 py-1.5 font-mono ${pctColor(a.change_week)}`}>{formatPct(a.change_week)}</td>
                <td className={`px-2 py-1.5 font-mono ${pctColor(a.change_month)}`}>{formatPct(a.change_month)}</td>
                <td className="px-2 py-1.5 font-mono text-trade-text-primary">{formatVolume(a.volume)}</td>
                <td className={`px-2 py-1.5 font-mono ${a.rvol > 1.5 ? "text-emerald-400 font-bold" : a.rvol < 0.6 ? "text-red-400" : "text-trade-text-primary"}`}>{a.rvol}</td>
                <td className="px-2 py-1.5"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${signalColor(a.signal)}`}>{a.signal}</span></td>
                <td className={`px-2 py-1.5 font-medium ${trendColor(a.trend)}`}>{a.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-trade-text-secondary text-sm">Niciun activ gasit</div>
        )}
      </div>
      <div className="text-[10px] text-trade-text-secondary text-right">{filtered.length} active afisate</div>
    </div>
  );
}
