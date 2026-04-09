import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, BarChart3, Shield } from "lucide-react";
import { signalColor, trendColor, formatPrice, formatPct, pctColor } from "@/lib/market-utils";

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div data-testid={`stat-${label.toLowerCase().replace(/\s/g,'-')}`}
    className="bg-[#161923] border border-trade-border rounded-lg p-4 trade-card-hover">
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className={`w-4 h-4 ${color || "text-trade-accent"}`} />}
      <span className="text-xs text-trade-text-secondary font-body">{label}</span>
    </div>
    <div className={`text-xl font-heading font-bold ${color || "text-trade-text-primary"}`}>{value}</div>
    {sub && <div className="text-xs text-trade-text-secondary mt-1">{sub}</div>}
  </div>
);

const SignalBadge = ({ signal, size = "sm" }) => {
  const cls = signalColor(signal);
  const sz = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs";
  return <span className={`${sz} rounded font-bold border ${cls}`}>{signal}</span>;
};

export default function Dashboard({ marketData }) {
  const summary = marketData?.summary;
  const assets = marketData?.assets || [];
  const macro = marketData?.macro || {};

  const topMovers = useMemo(() => {
    if (!assets.length) return { gainers: [], losers: [] };
    const sorted = [...assets].sort((a, b) => b.change_day - a.change_day);
    return { gainers: sorted.slice(0, 5), losers: sorted.slice(-5).reverse() };
  }, [assets]);

  const signalDistribution = useMemo(() => {
    if (!assets.length) return {};
    const cats = {};
    assets.forEach(a => {
      if (!cats[a.category]) cats[a.category] = { buy: 0, sell: 0, wait: 0 };
      cats[a.category][a.signal.toLowerCase()]++;
    });
    return cats;
  }, [assets]);

  if (!summary) return <div className="text-trade-text-secondary text-center py-12">Se incarca...</div>;

  const vix = macro.VIX || {};
  const fg = macro.fear_greed || {};
  const best = summary.best_signal;

  return (
    <div className="space-y-5" data-testid="dashboard-page">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Trend General" value={summary.trend} icon={TrendingUp}
          color={summary.trend === "Bullish" ? "text-emerald-400" : summary.trend === "Bearish" ? "text-red-400" : "text-amber-400"} />
        <StatCard label="Semnale BUY" value={summary.buy_count} sub={`din ${summary.total}`} icon={TrendingUp} color="text-emerald-400" />
        <StatCard label="Semnale SELL" value={summary.sell_count} sub={`din ${summary.total}`} icon={TrendingDown} color="text-red-400" />
        <StatCard label="Semnale WAIT" value={summary.wait_count} icon={Activity} color="text-amber-400" />
        <StatCard label="Volatilitate" value={summary.volatilitate} sub={`VIX: ${vix.value || '-'}`} icon={AlertTriangle}
          color={summary.volatilitate === "Ridicata" ? "text-red-400" : summary.volatilitate === "Moderata" ? "text-amber-400" : "text-emerald-400"} />
        <StatCard label="Risc Sistemic" value={summary.risc_sistemic} icon={Shield}
          color={summary.risc_sistemic === "Ridicat" ? "text-red-400" : summary.risc_sistemic === "Moderat" ? "text-amber-400" : "text-emerald-400"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
          <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3">Fear & Greed Index</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#2a2d3a" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${(fg.value || 0)} 100`}
                  stroke={fg.value >= 55 ? "#4ade80" : fg.value <= 45 ? "#f87171" : "#fbbf24"} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-trade-text-primary font-mono">{fg.value || '-'}</span>
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold ${fg.value >= 55 ? "text-emerald-400" : fg.value <= 45 ? "text-red-400" : "text-amber-400"}`}>
                {fg.label || "N/A"}
              </div>
              <div className="text-xs text-trade-text-secondary">Status: {fg.status || "-"}</div>
            </div>
          </div>
        </div>

        {best && (
          <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
            <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3">Cel Mai Puternic Semnal</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-trade-text-primary">{best.name}</span>
                <SignalBadge signal={best.signal} size="lg" />
              </div>
              <div className="text-xs text-trade-text-secondary">{best.category}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Pret: <span className="text-trade-text-primary font-mono">{formatPrice(best.price)}</span></div>
                <div>Score: <span className="text-trade-text-primary font-bold">{best.score}</span></div>
                <div>RSI: <span className="text-trade-text-primary font-mono">{best.rsi}</span></div>
                <div>R/R: <span className="text-trade-text-primary font-mono">{best.rr || '-'}</span></div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
          <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3">Indicatori Macro</h3>
          <div className="space-y-2 text-xs">
            {Object.entries(macro).filter(([k]) => k !== "fear_greed").map(([key, val]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-trade-text-secondary">{key}</span>
                <div className="flex items-center gap-2">
                  <span className="text-trade-text-primary font-mono">{typeof val === 'object' ? val.value?.toFixed(2) : val}</span>
                  {typeof val === 'object' && val.change_day != null && (
                    <span className={`font-mono ${pctColor(val.change_day)}`}>{formatPct(val.change_day)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
          <h3 className="text-sm font-heading font-bold text-emerald-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Top Gainers (Zi)
          </h3>
          <div className="space-y-1.5">
            {topMovers.gainers.map(a => (
              <div key={a.ticker} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="text-trade-text-primary font-medium w-28 truncate">{a.name}</span>
                  <span className="text-trade-text-secondary">{a.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-trade-text-primary">{formatPrice(a.price)}</span>
                  <span className={`font-mono font-bold ${pctColor(a.change_day)}`}>{formatPct(a.change_day)}</span>
                  <SignalBadge signal={a.signal} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
          <h3 className="text-sm font-heading font-bold text-red-400 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Top Losers (Zi)
          </h3>
          <div className="space-y-1.5">
            {topMovers.losers.map(a => (
              <div key={a.ticker} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="text-trade-text-primary font-medium w-28 truncate">{a.name}</span>
                  <span className="text-trade-text-secondary">{a.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-trade-text-primary">{formatPrice(a.price)}</span>
                  <span className={`font-mono font-bold ${pctColor(a.change_day)}`}>{formatPct(a.change_day)}</span>
                  <SignalBadge signal={a.signal} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
        <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-trade-accent" /> Distributie Semnale pe Categorii
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(signalDistribution).map(([cat, counts]) => {
            const total = counts.buy + counts.sell + counts.wait;
            return (
              <div key={cat} className="bg-white/[0.02] rounded-lg p-3">
                <div className="text-xs text-trade-text-secondary mb-2">{cat}</div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-2">
                  {counts.buy > 0 && <div className="bg-emerald-500" style={{ width: `${counts.buy / total * 100}%` }} />}
                  {counts.wait > 0 && <div className="bg-amber-500" style={{ width: `${counts.wait / total * 100}%` }} />}
                  {counts.sell > 0 && <div className="bg-red-500" style={{ width: `${counts.sell / total * 100}%` }} />}
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-emerald-400">{counts.buy} BUY</span>
                  <span className="text-amber-400">{counts.wait} WAIT</span>
                  <span className="text-red-400">{counts.sell} SELL</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
