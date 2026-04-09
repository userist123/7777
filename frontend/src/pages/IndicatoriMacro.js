import React from "react";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Shield, BarChart3 } from "lucide-react";
import { formatPct, pctColor } from "@/lib/market-utils";

const MacroCard = ({ title, value, change, icon: Icon, color, sub }) => (
  <div className="bg-[#161923] border border-trade-border rounded-lg p-4 trade-card-hover" data-testid={`macro-${title.replace(/\s/g,'-')}`}>
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className={`w-4 h-4 ${color || "text-trade-accent"}`} />}
      <span className="text-xs text-trade-text-secondary font-body">{title}</span>
    </div>
    <div className={`text-2xl font-heading font-bold ${color || "text-trade-text-primary"} font-mono`}>
      {value != null ? (typeof value === "number" ? value.toFixed(2) : value) : "-"}
    </div>
    <div className="flex items-center gap-2 mt-1">
      {change != null && <span className={`text-xs font-mono ${pctColor(change)}`}>{formatPct(change)}</span>}
      {sub && <span className="text-xs text-trade-text-secondary">{sub}</span>}
    </div>
  </div>
);

export default function IndicatoriMacro({ marketData }) {
  const macro = marketData?.macro || {};
  const summary = marketData?.summary || {};
  const fg = macro.fear_greed || {};
  const vix = macro.VIX || {};
  const y10 = macro["Yield 10Y US"] || {};
  const y30 = macro["Yield 30Y US"] || {};
  const usd = macro["USD Index"] || {};

  const vixStatus = (v) => {
    if (!v) return { label: "-", color: "text-trade-text-secondary" };
    if (v < 15) return { label: "Foarte scazut - Complacenta", color: "text-emerald-400" };
    if (v < 20) return { label: "Scazut - Piata calma", color: "text-emerald-400" };
    if (v < 25) return { label: "Moderat - Atentie crescuta", color: "text-amber-400" };
    if (v < 30) return { label: "Ridicat - Frica in piata", color: "text-orange-400" };
    return { label: "Extrem - Panica", color: "text-red-400" };
  };

  const vixInfo = vixStatus(vix.value);

  return (
    <div className="space-y-5" data-testid="indicatori-macro-page">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MacroCard title="VIX (Volatility Index)" value={vix.value} change={vix.change_day}
          icon={AlertTriangle} color={vix.value > 25 ? "text-red-400" : vix.value > 20 ? "text-amber-400" : "text-emerald-400"}
          sub={vixInfo.label} />
        <MacroCard title="Fear & Greed Index" value={fg.value} icon={Shield}
          color={fg.value >= 55 ? "text-emerald-400" : fg.value <= 45 ? "text-red-400" : "text-amber-400"}
          sub={fg.label} />
        <MacroCard title="USD Index" value={usd.value} change={usd.change_day} icon={DollarSign}
          color={usd.change_day > 0 ? "text-emerald-400" : "text-red-400"} />
        <MacroCard title="Trend General" value={summary.trend} icon={TrendingUp}
          color={summary.trend === "Bullish" ? "text-emerald-400" : summary.trend === "Bearish" ? "text-red-400" : "text-amber-400"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
          <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-trade-accent" /> Randamente Obligatiuni US
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg">
              <div>
                <div className="text-xs text-trade-text-secondary">Yield 10Y US Treasury</div>
                <div className="text-lg font-bold font-mono text-trade-text-primary">{y10.value ? `${y10.value.toFixed(2)}%` : "-"}</div>
              </div>
              {y10.change_day != null && <span className={`text-sm font-mono ${pctColor(y10.change_day)}`}>{formatPct(y10.change_day)}</span>}
            </div>
            <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg">
              <div>
                <div className="text-xs text-trade-text-secondary">Yield 30Y US Treasury</div>
                <div className="text-lg font-bold font-mono text-trade-text-primary">{y30.value ? `${y30.value.toFixed(2)}%` : "-"}</div>
              </div>
              {y30.change_day != null && <span className={`text-sm font-mono ${pctColor(y30.change_day)}`}>{formatPct(y30.change_day)}</span>}
            </div>
            {y10.value && y30.value && (
              <div className="p-3 bg-white/[0.02] rounded-lg">
                <div className="text-xs text-trade-text-secondary mb-1">Spread 30Y - 10Y</div>
                <div className={`text-lg font-bold font-mono ${(y30.value - y10.value) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {(y30.value - y10.value).toFixed(2)}%
                </div>
                <div className="text-[10px] text-trade-text-secondary mt-1">
                  {(y30.value - y10.value) < 0 ? "Curba inversata - semnal recesiune" : "Curba normala"}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
          <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Interpretare VIX
          </h3>
          <div className="space-y-2 text-xs">
            {[
              { range: "0 - 15", label: "Foarte scazut", desc: "Complacenta extrema. Piata extrem de calma. Posibil top aproape.", color: "bg-emerald-500" },
              { range: "15 - 20", label: "Scazut", desc: "Piata calma, trend stabil. Conditii bune pentru pozitii long.", color: "bg-emerald-500/60" },
              { range: "20 - 25", label: "Moderat", desc: "Volatilitate normala. Atentie la directia macro.", color: "bg-amber-500" },
              { range: "25 - 30", label: "Ridicat", desc: "Frica crescuta. Volatilitate mare. Oportunitati de cumparare.", color: "bg-orange-500" },
              { range: "30+", label: "Extrem", desc: "Panica in piata. Istoric, cele mai bune oportunitati de cumparare.", color: "bg-red-500" },
            ].map(r => (
              <div key={r.range} className={`flex items-start gap-3 p-2 rounded-lg ${vix.value && vixInfo.label.includes(r.label) ? "bg-white/[0.05] border border-trade-accent/30" : "bg-white/[0.02]"}`}>
                <div className={`w-2 h-2 mt-1 rounded-full shrink-0 ${r.color}`} />
                <div>
                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-trade-text-primary font-bold">{r.range}</span>
                    <span className="text-trade-text-secondary">- {r.label}</span>
                  </div>
                  <div className="text-trade-text-secondary mt-0.5">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
        <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-trade-accent" /> Rezumat Macro
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white/[0.02] rounded-lg">
            <div className="text-trade-text-secondary mb-1">Volatilitate</div>
            <div className={`font-bold ${summary.volatilitate === "Ridicata" ? "text-red-400" : summary.volatilitate === "Moderata" ? "text-amber-400" : "text-emerald-400"}`}>
              {summary.volatilitate || "-"}
            </div>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-lg">
            <div className="text-trade-text-secondary mb-1">Risc Sistemic</div>
            <div className={`font-bold ${summary.risc_sistemic === "Ridicat" ? "text-red-400" : summary.risc_sistemic === "Moderat" ? "text-amber-400" : "text-emerald-400"}`}>
              {summary.risc_sistemic || "-"}
            </div>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-lg">
            <div className="text-trade-text-secondary mb-1">Active Monitorizate</div>
            <div className="font-bold text-trade-text-primary">{summary.total || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
