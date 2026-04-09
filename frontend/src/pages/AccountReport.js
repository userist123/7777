import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAccountStats } from "@/lib/calculations";
import { formatCurrency } from "@/lib/constants";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d29] border border-[#2a2d3a] rounded-lg p-3 shadow-lg">
      <p className="text-xs text-trade-text-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono-num text-sm" style={{ color: p.color }}>{p.name}: ${typeof p.value === "number" ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  );
};

export default function AccountReport({ trades }) {
  const accountStats = useMemo(() => getAccountStats(trades), [trades]);

  if (accountStats.length === 0) {
    return (
      <div className="text-center py-16 text-trade-text-secondary" data-testid="account-report-page">
        <p className="text-lg font-heading">No account data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="account-report-page">
      {accountStats.map(acc => (
        <div key={acc.account} className="space-y-3">
          <h3 className="font-heading font-bold text-trade-text-primary text-lg">{acc.account}</h3>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              ["Balance", formatCurrency(acc.balance), acc.balance >= 0 ? "text-trade-win-text" : "text-trade-loss-text"],
              ["Deposits", formatCurrency(acc.deposits), "text-trade-accent"],
              ["Withdrawals", formatCurrency(acc.withdrawals), "text-trade-warn-text"],
              ["Net P/L", formatCurrency(acc.totalPnl), acc.totalPnl >= 0 ? "text-trade-win-text" : "text-trade-loss-text"],
              ["Win Rate", `${acc.winRate.toFixed(1)}%`, acc.winRate >= 50 ? "text-trade-win-text" : "text-trade-loss-text"],
              ["Trades", `${acc.wins}W / ${acc.losses}L`, "text-trade-text-primary"],
            ].map(([label, val, color]) => (
              <Card key={label} className="bg-[#1a1d29] border-[#2a2d3a]">
                <CardContent className="p-3">
                  <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">{label}</p>
                  <p className={`font-mono-num text-base font-bold mt-0.5 ${color}`}>{val}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Equity Curve */}
          <Card className="bg-[#1a1d29] border-[#2a2d3a]">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-heading text-trade-text-primary">Equity Curve</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={acc.equityCurve}>
                  <defs>
                    <linearGradient id={`accGrad-${acc.account}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                  <XAxis dataKey="date" tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill={`url(#accGrad-${acc.account})`} strokeWidth={2} name="Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly P/L Table */}
          {acc.monthlyPnl.length > 0 && (
            <Card className="bg-[#1a1d29] border-[#2a2d3a]">
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-sm font-heading text-trade-text-primary">Monthly P/L</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2a2d3a]">
                      <th className="text-[10px] uppercase tracking-widest text-trade-text-secondary text-left py-2 px-3">Month</th>
                      <th className="text-[10px] uppercase tracking-widest text-trade-text-secondary text-right py-2 px-3">P/L ($)</th>
                      <th className="text-[10px] uppercase tracking-widest text-trade-text-secondary text-right py-2 px-3">P/L (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acc.monthlyPnl.map(([month, pnl]) => (
                      <tr key={month} className="border-b border-[#2a2d3a] hover:bg-white/5">
                        <td className="py-2 px-3 font-mono-num text-trade-text-primary">{month}</td>
                        <td className={`py-2 px-3 font-mono-num text-right font-semibold ${pnl >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{formatCurrency(pnl)}</td>
                        <td className={`py-2 px-3 font-mono-num text-right ${pnl >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{acc.deposits > 0 ? ((pnl / acc.deposits) * 100).toFixed(2) : "0.00"}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}
