import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Clock, Save, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IstoricTrending({ marketData, api }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchHistoric = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/historic-data`);
      setRecords(res.data);
    } catch (_) {}
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { fetchHistoric(); }, [fetchHistoric]);

  const saveSnapshot = async () => {
    setSaving(true);
    try {
      await axios.post(`${api}/historic-data/snapshot`);
      await fetchHistoric();
    } catch (_) {}
    finally { setSaving(false); }
  };

  const summary = marketData?.summary;

  return (
    <div className="space-y-4" data-testid="istoric-trending-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-trade-accent" />
          <h2 className="text-sm font-heading font-bold text-trade-text-primary">Istoric & Trending</h2>
        </div>
        <Button data-testid="save-snapshot-btn" onClick={saveSnapshot} disabled={saving || !summary}
          className="bg-trade-accent hover:bg-trade-accent/90 text-white text-xs h-8">
          <Save className="w-3.5 h-3.5 mr-1" />
          {saving ? "Se salveaza..." : "Salveaza Snapshot Curent"}
        </Button>
      </div>

      {summary && (
        <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
          <h3 className="text-xs text-trade-text-secondary mb-3">Situatie Curenta</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "Total Active", value: summary.total, icon: Activity, color: "text-trade-accent" },
              { label: "BUY", value: summary.buy_count, icon: TrendingUp, color: "text-emerald-400" },
              { label: "SELL", value: summary.sell_count, icon: TrendingDown, color: "text-red-400" },
              { label: "WAIT", value: summary.wait_count, icon: Activity, color: "text-amber-400" },
              { label: "Trend", value: summary.trend, color: summary.trend === "Bullish" ? "text-emerald-400" : summary.trend === "Bearish" ? "text-red-400" : "text-amber-400" },
              { label: "Volatilitate", value: summary.volatilitate },
              { label: "Risc", value: summary.risc_sistemic },
            ].map(item => (
              <div key={item.label} className="bg-white/[0.02] rounded-lg p-2 text-center">
                <div className="text-[10px] text-trade-text-secondary">{item.label}</div>
                <div className={`text-sm font-bold font-mono ${item.color || "text-trade-text-primary"}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
        <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3">Snapshots Lunare</h3>
        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-trade-accent border-t-transparent rounded-full" /></div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-trade-text-secondary text-sm">
            Niciun snapshot salvat. Apasa "Salveaza Snapshot Curent" pentru a inregistra starea pietei.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" data-testid="istoric-table">
              <thead className="border-b border-trade-border bg-white/[0.02]">
                <tr>
                  {["Luna", "Data", "Total", "BUY", "SELL", "WAIT", "Trend", "VIX", "Fear&Greed"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] text-trade-text-secondary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.month || i} className="border-b border-trade-border/50 hover:bg-white/[0.02]">
                    <td className="px-3 py-2 font-medium text-trade-text-primary">{r.month}</td>
                    <td className="px-3 py-2 text-trade-text-secondary font-mono">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                    <td className="px-3 py-2 font-mono text-trade-text-primary">{r.total_assets}</td>
                    <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{r.buy_count}</td>
                    <td className="px-3 py-2 font-mono text-red-400 font-bold">{r.sell_count}</td>
                    <td className="px-3 py-2 font-mono text-amber-400">{r.wait_count}</td>
                    <td className={`px-3 py-2 font-medium ${r.trend === "Bullish" ? "text-emerald-400" : r.trend === "Bearish" ? "text-red-400" : "text-amber-400"}`}>{r.trend}</td>
                    <td className="px-3 py-2 font-mono text-trade-text-primary">{r.vix ?? "-"}</td>
                    <td className={`px-3 py-2 font-mono ${r.fear_greed >= 55 ? "text-emerald-400" : r.fear_greed <= 45 ? "text-red-400" : "text-amber-400"}`}>{r.fear_greed ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {records.length > 1 && (
        <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
          <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3">Evolutie Semnale</h3>
          <div className="space-y-2">
            {records.slice(0, 12).map((r, i) => {
              const total = (r.buy_count || 0) + (r.sell_count || 0) + (r.wait_count || 0) || 1;
              return (
                <div key={r.month || i} className="flex items-center gap-3">
                  <span className="text-xs text-trade-text-secondary w-16 shrink-0">{r.month}</span>
                  <div className="flex-1 flex h-4 rounded-full overflow-hidden bg-white/5">
                    <div className="bg-emerald-500/80 transition-all" style={{ width: `${(r.buy_count || 0) / total * 100}%` }} />
                    <div className="bg-amber-500/80 transition-all" style={{ width: `${(r.wait_count || 0) / total * 100}%` }} />
                    <div className="bg-red-500/80 transition-all" style={{ width: `${(r.sell_count || 0) / total * 100}%` }} />
                  </div>
                  <div className="flex gap-2 text-[10px] shrink-0">
                    <span className="text-emerald-400">{r.buy_count}B</span>
                    <span className="text-amber-400">{r.wait_count}W</span>
                    <span className="text-red-400">{r.sell_count}S</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
