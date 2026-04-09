import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getStrategyStats } from "@/lib/calculations";
import { formatCurrency, STRATEGY_COLORS, CHART_COLORS } from "@/lib/constants";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d29] border border-[#2a2d3a] rounded-lg p-3 shadow-lg">
      <p className="text-xs text-trade-text-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono-num text-sm" style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  );
};

export default function StrategyReport({ trades }) {
  const strategyStats = useMemo(() => getStrategyStats(trades), [trades]);

  const best = useMemo(() => strategyStats.length > 0 ? strategyStats.reduce((a, b) => a.totalPnl > b.totalPnl ? a : b) : null, [strategyStats]);
  const worst = useMemo(() => strategyStats.length > 0 ? strategyStats.reduce((a, b) => a.totalPnl < b.totalPnl ? a : b) : null, [strategyStats]);

  const winRateData = useMemo(() => strategyStats.map(s => ({
    strategy: s.strategy,
    winRate: Math.round(s.winRate * 10) / 10,
    avgPnl: s.totalTrades > 0 ? Math.round((s.totalPnl / s.totalTrades) * 100) / 100 : 0,
  })), [strategyStats]);

  // Build equity curves per strategy
  const equityData = useMemo(() => {
    const allTrades = trades.filter(t => t.type === "Trade" && t.status !== "Open").sort((a, b) => new Date(a.date) - new Date(b.date));
    const strategies = [...new Set(allTrades.map(t => t.strategy))];
    const points = [];
    const runningBalances = {};
    strategies.forEach(s => { runningBalances[s] = 0; });
    
    allTrades.forEach((t, i) => {
      runningBalances[t.strategy] = (runningBalances[t.strategy] || 0) + (t.pnl || 0);
      const point = { index: i + 1 };
      strategies.forEach(s => { point[s] = Math.round((runningBalances[s] || 0) * 100) / 100; });
      points.push(point);
    });
    return { points, strategies };
  }, [trades]);

  if (strategyStats.length === 0) {
    return (
      <div className="text-center py-16 text-trade-text-secondary" data-testid="strategy-report-page">
        <p className="text-lg font-heading">No strategy data available</p>
        <p className="text-sm mt-1">Add some trades to see strategy analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="strategy-report-page">
      {/* Strategy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {strategyStats.map(s => (
          <Card key={s.strategy} className={`bg-[#1a1d29] border-[#2a2d3a] ${best?.strategy === s.strategy ? "ring-1 ring-trade-win-text/30" : worst?.strategy === s.strategy ? "ring-1 ring-trade-loss-text/30" : ""}`}
            data-testid={`strategy-card-${s.strategy}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading font-bold text-trade-text-primary text-sm">{s.strategy}</span>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STRATEGY_COLORS[s.strategy] || "#6b7280" }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Trades", s.totalTrades],
                  ["Win Rate", `${s.winRate.toFixed(1)}%`],
                  ["Avg R:R", s.avgRR.toFixed(2)],
                  ["P. Factor", s.profitFactor === Infinity ? "inf" : s.profitFactor.toFixed(2)],
                  ["Total P/L", formatCurrency(s.totalPnl)],
                  ["Exp. Value", formatCurrency(s.expectedValue)],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">{label}</p>
                    <p className="font-mono-num text-sm font-semibold text-trade-text-primary">{val}</p>
                  </div>
                ))}
              </div>
              {best?.strategy === s.strategy && <Badge className="mt-3 bg-trade-win-bg text-trade-win-text border-trade-win-border text-[10px]">Best Performing</Badge>}
              {worst?.strategy === s.strategy && strategyStats.length > 1 && <Badge className="mt-3 bg-trade-loss-bg text-trade-loss-text border-trade-loss-border text-[10px]">Worst Performing</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Equity Curves */}
      <Card className="bg-[#1a1d29] border-[#2a2d3a]">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-sm font-heading text-trade-text-primary">Equity Curve per Strategy</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityData.points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
              <XAxis dataKey="index" tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Trade #", position: "insideBottom", offset: -5, fill: "#8892a4", fontSize: 10 }} />
              <YAxis tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#8892a4" }} />
              {equityData.strategies.map((s, i) => (
                <Line key={s} type="monotone" dataKey={s} stroke={STRATEGY_COLORS[s] || ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b"][i % 4]} strokeWidth={2} dot={false} name={s} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Win Rate + Avg P/L Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="bg-[#1a1d29] border-[#2a2d3a]">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-heading text-trade-text-primary">Win Rate per Strategy</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="strategy" tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="winRate" name="Win Rate %" radius={[3, 3, 0, 0]}>
                  {winRateData.map((entry) => {
                    const color = STRATEGY_COLORS[entry.strategy] || "#3b82f6";
                    return <rect key={entry.strategy} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-[#2a2d3a]">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-heading text-trade-text-primary">Avg P/L per Strategy</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="strategy" tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgPnl" name="Avg P/L" radius={[3, 3, 0, 0]}>
                  {winRateData.map((entry) => (
                    <rect key={entry.strategy} fill={entry.avgPnl >= 0 ? "#4ade80" : "#f87171"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card className="bg-[#1a1d29] border-[#2a2d3a]">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-sm font-heading text-trade-text-primary">Strategy Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2d3a]">
                {["Strategy", "Trades", "Wins", "Losses", "Win Rate", "Avg R:R", "P. Factor", "Total P/L", "Exp. Value"].map(h => (
                  <th key={h} className="text-[10px] uppercase tracking-widest text-trade-text-secondary text-left py-2 px-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {strategyStats.map(s => (
                <tr key={s.strategy} className="border-b border-[#2a2d3a] hover:bg-white/5">
                  <td className="py-2 px-3 font-heading font-bold text-trade-text-primary">{s.strategy}</td>
                  <td className="py-2 px-3 font-mono-num">{s.totalTrades}</td>
                  <td className="py-2 px-3 font-mono-num text-trade-win-text">{s.wins}</td>
                  <td className="py-2 px-3 font-mono-num text-trade-loss-text">{s.losses}</td>
                  <td className="py-2 px-3 font-mono-num">{s.winRate.toFixed(1)}%</td>
                  <td className="py-2 px-3 font-mono-num">{s.avgRR.toFixed(2)}</td>
                  <td className="py-2 px-3 font-mono-num">{s.profitFactor === Infinity ? "inf" : s.profitFactor.toFixed(2)}</td>
                  <td className={`py-2 px-3 font-mono-num font-semibold ${s.totalPnl >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{formatCurrency(s.totalPnl)}</td>
                  <td className={`py-2 px-3 font-mono-num ${s.expectedValue >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{formatCurrency(s.expectedValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
