import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FileText, Shield, Calendar, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { signalColor, trendColor, rsiColor, formatPrice, formatPct, pctColor, formatVolume } from "@/lib/market-utils";

export default function FisaActiv({ marketData, api }) {
  const [selectedAsset, setSelectedAsset] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const assets = marketData?.assets || [];

  const fetchDetail = useCallback(async (name) => {
    if (!name) return;
    setLoading(true);
    try {
      const res = await axios.get(`${api}/asset-detail/${encodeURIComponent(name)}`);
      setDetail(res.data);
    } catch (e) {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (assets.length && !selectedAsset) {
      const first = assets[0]?.name;
      setSelectedAsset(first);
      fetchDetail(first);
    }
  }, [assets, selectedAsset, fetchDetail]);

  const handleSelect = (name) => {
    setSelectedAsset(name);
    fetchDetail(name);
  };

  const a = detail?.asset;
  const competitors = detail?.competitors || [];
  const risks = detail?.risks || [];
  const calendar = detail?.calendar || [];

  return (
    <div className="space-y-4" data-testid="fisa-activ-page">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <select data-testid="asset-select" value={selectedAsset} onChange={e => handleSelect(e.target.value)}
          className="bg-[#161923] border border-trade-border rounded px-3 py-2 text-sm text-trade-text-primary focus:outline-none focus:border-trade-accent w-full sm:w-64">
          {assets.map(asset => (
            <option key={asset.ticker} value={asset.name}>{asset.name} ({asset.category})</option>
          ))}
        </select>
        {a && <span className={`px-3 py-1 rounded text-sm font-bold border ${signalColor(a.signal)}`}>{a.signal} (Score: {a.score})</span>}
      </div>

      {loading && <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-trade-accent border-t-transparent rounded-full" /></div>}

      {a && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "Pret", value: formatPrice(a.price), color: "text-trade-text-primary" },
              { label: "Var Zi", value: formatPct(a.change_day), color: pctColor(a.change_day) },
              { label: "Var Sapt", value: formatPct(a.change_week), color: pctColor(a.change_week) },
              { label: "Var Luna", value: formatPct(a.change_month), color: pctColor(a.change_month) },
              { label: "Volum", value: formatVolume(a.volume) },
              { label: "RVOL", value: a.rvol, color: a.rvol > 1.5 ? "text-emerald-400" : "text-trade-text-primary" },
            ].map(item => (
              <div key={item.label} className="bg-[#161923] border border-trade-border rounded-lg p-3">
                <div className="text-[10px] text-trade-text-secondary mb-1">{item.label}</div>
                <div className={`text-sm font-bold font-mono ${item.color || "text-trade-text-primary"}`}>{item.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
              <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-trade-accent" /> Indicatori Tehnici
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "RSI (14)", value: a.rsi, color: rsiColor(a.rsi) },
                  { label: "RSI Status", value: a.rsi_status, color: rsiColor(a.rsi) },
                  { label: "MACD", value: a.macd?.toFixed(4) },
                  { label: "MACD Signal", value: a.macd_signal?.toFixed(4) },
                  { label: "MACD Histogram", value: a.macd_histogram?.toFixed(4), color: a.macd_histogram > 0 ? "text-emerald-400" : "text-red-400" },
                  { label: "MACD Cross", value: a.macd_cross, color: a.macd_cross?.includes("pozitiv") ? "text-emerald-400" : a.macd_cross?.includes("negativ") ? "text-red-400" : "" },
                  { label: "MA20", value: a.ma20 ? formatPrice(a.ma20) : "-" },
                  { label: "MA50", value: a.ma50 ? formatPrice(a.ma50) : "-" },
                  { label: "MA200", value: a.ma200 ? formatPrice(a.ma200) : "-" },
                  { label: "MA Cross", value: a.ma_cross, color: a.ma_cross === "Golden Cross" ? "text-emerald-400" : a.ma_cross === "Death Cross" ? "text-red-400" : "" },
                  { label: "BB Upper", value: a.bb_upper ? formatPrice(a.bb_upper) : "-" },
                  { label: "BB Lower", value: a.bb_lower ? formatPrice(a.bb_lower) : "-" },
                  { label: "ATR", value: a.atr?.toFixed(4) },
                  { label: "Stoch %K", value: a.stoch_k },
                  { label: "Stoch %D", value: a.stoch_d },
                  { label: "Momentum 10D", value: `${a.momentum_10d?.toFixed(2)}%`, color: pctColor(a.momentum_10d) },
                  { label: "Trend", value: a.trend, color: trendColor(a.trend) },
                  { label: "Confluente", value: a.confluences },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center p-1.5 bg-white/[0.02] rounded">
                    <span className="text-trade-text-secondary">{item.label}</span>
                    <span className={`font-mono font-medium ${item.color || "text-trade-text-primary"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {a.sl && (
                <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
                  <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-trade-accent" /> Plan de Tranzactionare
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2 bg-white/[0.02] rounded">
                      <div className="text-trade-text-secondary">Entry</div>
                      <div className="font-mono font-bold text-trade-text-primary">{formatPrice(a.entry)}</div>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                      <div className="text-red-400">Stop Loss</div>
                      <div className="font-mono font-bold text-red-400">{formatPrice(a.sl)}</div>
                    </div>
                    <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                      <div className="text-emerald-400">Take Profit</div>
                      <div className="font-mono font-bold text-emerald-400">{formatPrice(a.tp)}</div>
                    </div>
                    <div className="p-2 bg-white/[0.02] rounded">
                      <div className="text-trade-text-secondary">Risk/Reward</div>
                      <div className={`font-mono font-bold ${a.rr >= 2 ? "text-emerald-400" : "text-amber-400"}`}>1:{a.rr}</div>
                    </div>
                    <div className="p-2 bg-white/[0.02] rounded">
                      <div className="text-trade-text-secondary">Suport 20D</div>
                      <div className="font-mono text-trade-text-primary">{formatPrice(a.support)}</div>
                    </div>
                    <div className="p-2 bg-white/[0.02] rounded">
                      <div className="text-trade-text-secondary">Rezistenta 20D</div>
                      <div className="font-mono text-trade-text-primary">{formatPrice(a.resistance)}</div>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-trade-accent/10 rounded border border-trade-accent/20">
                    <div className="text-trade-accent text-[10px]">Probabilitate Succes</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-trade-accent rounded-full" style={{ width: `${a.probability}%` }} />
                      </div>
                      <span className="text-sm font-bold font-mono text-trade-accent">{a.probability}%</span>
                    </div>
                  </div>
                </div>
              )}

              {calendar.length > 0 && (
                <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
                  <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" /> Evenimente Cheie ({a.category})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {calendar.map(ev => (
                      <span key={ev} className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400">{ev}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {competitors.length > 0 && (
            <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
              <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-trade-accent" /> Competitori ({a.category})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-trade-border">
                    <tr>
                      {["Activ", "Pret", "Var Zi%", "RSI", "MACD Cross", "Trend", "Semnal", "Score"].map(h => (
                        <th key={h} className="px-2 py-2 text-left text-[10px] text-trade-text-secondary">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {competitors.map(c => (
                      <tr key={c.ticker} className="border-b border-trade-border/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => handleSelect(c.name)}>
                        <td className="px-2 py-1.5 text-trade-text-primary font-medium">{c.name}</td>
                        <td className="px-2 py-1.5 font-mono">{formatPrice(c.price)}</td>
                        <td className={`px-2 py-1.5 font-mono ${pctColor(c.change_day)}`}>{formatPct(c.change_day)}</td>
                        <td className={`px-2 py-1.5 font-mono ${rsiColor(c.rsi)}`}>{c.rsi}</td>
                        <td className={`px-2 py-1.5 ${c.macd_cross?.includes("pozitiv") ? "text-emerald-400" : "text-red-400"}`}>{c.macd_cross}</td>
                        <td className={`px-2 py-1.5 ${trendColor(c.trend)}`}>{c.trend}</td>
                        <td className="px-2 py-1.5"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${signalColor(c.signal)}`}>{c.signal}</span></td>
                        <td className="px-2 py-1.5 font-mono font-bold">{c.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {risks.length > 0 && (
            <div className="bg-[#161923] border border-trade-border rounded-lg p-4">
              <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Riscuri ({a.category})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-trade-border">
                    <tr>
                      {["ID", "Tip", "Descriere", "Impact", "Prob%", "Orizont"].map(h => (
                        <th key={h} className="px-2 py-2 text-left text-[10px] text-trade-text-secondary">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {risks.map(r => (
                      <tr key={r.id} className="border-b border-trade-border/50">
                        <td className="px-2 py-1.5 font-mono text-trade-text-secondary">{r.id}</td>
                        <td className="px-2 py-1.5 text-trade-text-primary">{r.tip}</td>
                        <td className="px-2 py-1.5 text-trade-text-secondary">{r.desc}</td>
                        <td className="px-2 py-1.5">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full ${i < r.impact ? "bg-red-500" : "bg-white/10"}`} />
                            ))}
                          </div>
                        </td>
                        <td className={`px-2 py-1.5 font-mono ${r.prob >= 40 ? "text-red-400" : r.prob >= 25 ? "text-amber-400" : "text-emerald-400"}`}>{r.prob}%</td>
                        <td className="px-2 py-1.5 text-trade-text-secondary">{r.orizont}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
