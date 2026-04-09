import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getTradeStats, getStrategyStats } from "@/lib/calculations";
import { formatCurrency, formatPct, formatNumber, CHART_COLORS, ACCOUNTS, STRATEGIES, PAIRS } from "@/lib/constants";

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = "accent" }) => {
  const colors = {
    accent: "text-trade-accent",
    win: "text-trade-win-text",
    loss: "text-trade-loss-text",
    warn: "text-trade-warn-text",
  };
  return (
    <Card className="bg-[#1a1d29] border-[#2a2d3a]" data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-trade-text-secondary font-body">{title}</p>
            <p className={`font-mono-num text-2xl font-bold mt-1 ${colors[color] || colors.accent}`}>{value}</p>
            {subtitle && <p className="text-xs text-trade-text-secondary mt-1 font-body">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-md ${trend === "up" ? "bg-trade-win-bg" : trend === "down" ? "bg-trade-loss-bg" : "bg-trade-accent/10"}`}>
            <Icon className={`w-4 h-4 ${trend === "up" ? "text-trade-win-text" : trend === "down" ? "text-trade-loss-text" : "text-trade-accent"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WinRateCircle = ({ rate }) => {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (rate / 100) * circumference;
  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#2a2d3a" strokeWidth="6" />
        <circle cx="40" cy="40" r="36" fill="none" stroke={rate >= 50 ? "#4ade80" : "#f87171"} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="gauge-arc" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono-num text-sm font-bold text-trade-text-primary">{rate.toFixed(1)}%</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d29] border border-[#2a2d3a] rounded-lg p-3 shadow-lg">
      <p className="text-xs text-trade-text-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono-num text-sm" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? formatNumber(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ trades, allTrades, filters, setFilters }) {
  const stats = useMemo(() => getTradeStats(trades), [trades]);
  const strategyStats = useMemo(() => getStrategyStats(trades), [trades]);

  const pairBreakdown = useMemo(() => {
    const pairCount = {};
    trades.filter(t => t.type === "Trade").forEach(t => {
      pairCount[t.pair] = (pairCount[t.pair] || 0) + 1;
    });
    const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#4ade80", "#f87171", "#ec4899", "#a78bfa"];
    return Object.entries(pairCount).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [trades]);

  const monthlyData = useMemo(() => {
    return stats.monthlyPnl.map(([month, pnl]) => ({
      month: month.substring(5),
      gains: pnl > 0 ? pnl : 0,
      losses: pnl < 0 ? Math.abs(pnl) : 0,
    }));
  }, [stats]);

  const uniquePairs = useMemo(() => [...new Set(allTrades.filter(t => t.type === "Trade").map(t => t.pair))], [allTrades]);
  const uniqueStrategies = useMemo(() => [...new Set(allTrades.filter(t => t.type === "Trade" && t.strategy).map(t => t.strategy))], [allTrades]);

  const depositTotal = trades.filter(t => t.type === "Deposit").reduce((s, t) => s + (t.amount || 0), 0);
  const balanceDelta = depositTotal > 0 ? ((stats.balance - depositTotal) / depositTotal) * 100 : 0;

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-heading text-xl font-bold text-trade-text-primary">Trade Dashboard</h2>
          <p className="text-xs text-trade-text-secondary font-body">FOREX & MULTI-ASSET Performance Overview</p>
        </div>
        <p className="text-xs text-trade-text-secondary font-mono-num">
          Updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Balance" value={formatCurrency(stats.balance)} subtitle={formatPct(balanceDelta)} icon={DollarSign} trend={balanceDelta >= 0 ? "up" : "down"} color={balanceDelta >= 0 ? "win" : "loss"} />
        <StatCard title="Net P/L" value={formatCurrency(stats.totalPnl)} subtitle={`Gross: ${formatCurrency(stats.grossProfit)}`} icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown} trend={stats.totalPnl >= 0 ? "up" : "down"} color={stats.totalPnl >= 0 ? "win" : "loss"} />
        <Card className="bg-[#1a1d29] border-[#2a2d3a]" data-testid="stat-card-win-rate">
          <CardContent className="p-4 flex items-center gap-4">
            <WinRateCircle rate={stats.winRate} />
            <div>
              <p className="text-xs uppercase tracking-widest text-trade-text-secondary">Win Rate</p>
              <p className="font-mono-num text-xl font-bold text-trade-text-primary mt-1">{stats.winRate.toFixed(1)}%</p>
              <p className="text-xs text-trade-text-secondary">{stats.wins}W / {stats.losses}L</p>
            </div>
          </CardContent>
        </Card>
        <StatCard title="Total Trades" value={stats.totalTrades} subtitle={`${stats.wins}W / ${stats.losses}L / ${stats.breakevens}BE`} icon={BarChart3} trend="neutral" color="accent" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Equity Curve */}
        <Card className="bg-[#1a1d29] border-[#2a2d3a] lg:col-span-2">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-heading text-trade-text-primary">Account Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.equityCurve}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="date" tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="url(#balanceGrad)" strokeWidth={2} name="Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pair Breakdown */}
        <Card className="bg-[#1a1d29] border-[#2a2d3a]">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-heading text-trade-text-primary">Pair Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pairBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                  {pairBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#8892a4" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Gains vs Losses */}
      <Card className="bg-[#1a1d29] border-[#2a2d3a]">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-sm font-heading text-trade-text-primary">Monthly Gains vs Losses</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
              <XAxis dataKey="month" tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="gains" fill="#4ade80" name="Gains" radius={[3, 3, 0, 0]} />
              <Bar dataKey="losses" fill="#f87171" name="Losses" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Statistics + Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Statistics Panel */}
        <Card className="bg-[#1a1d29] border-[#2a2d3a] lg:col-span-2">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-heading text-trade-text-primary">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                ["No. of Trades", stats.totalTrades],
                ["Wins", stats.wins],
                ["Losses", stats.losses],
                ["Breakevens", stats.breakevens],
                ["Open", stats.openTrades],
                ["Buy Trades", stats.buyTrades],
                ["Sell Trades", stats.sellTrades],
                ["Most Used Strategy", stats.mostUsedStrategy],
                ["Most Used Pair", stats.mostUsedPair],
                ["Avg Win", formatCurrency(stats.avgWin)],
                ["Largest Win", formatCurrency(stats.largestWin)],
                ["Win Streak", stats.maxWinStreak],
                ["Avg Loss", formatCurrency(stats.avgLoss)],
                ["Largest Loss", formatCurrency(stats.largestLoss)],
                ["Lose Streak", stats.maxLoseStreak],
                ["Max Drawdown", `${stats.maxDrawdown.toFixed(1)}%`],
                ["Win Rate", `${stats.winRate.toFixed(1)}%`],
                ["Profit Factor", stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)],
                ["Expected Value", formatCurrency(stats.expectedValue)],
                ["Avg R:R", stats.avgRR.toFixed(2)],
              ].map(([label, val]) => (
                <div key={label} className="bg-[#0f1117] rounded-md p-2.5 border border-[#2a2d3a]">
                  <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">{label}</p>
                  <p className="font-mono-num text-sm font-semibold text-trade-text-primary mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-[#1a1d29] border-[#2a2d3a]">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-heading text-trade-text-primary">Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {[
              ["Balance", formatCurrency(stats.balance), stats.balance >= 0 ? "text-trade-win-text" : "text-trade-loss-text"],
              ["Net P/L", formatCurrency(stats.totalPnl), stats.totalPnl >= 0 ? "text-trade-win-text" : "text-trade-loss-text"],
              ["Gross Profit", formatCurrency(stats.grossProfit), "text-trade-win-text"],
              ["Gross Loss", formatCurrency(stats.grossLoss), "text-trade-loss-text"],
              ["Win %", `${stats.winRate.toFixed(1)}%`, stats.winRate >= 50 ? "text-trade-win-text" : "text-trade-loss-text"],
              ["Avg R:R", stats.avgRR.toFixed(2), "text-trade-accent"],
              ["Best Month", `${stats.bestMonth[0]} (${formatCurrency(stats.bestMonth[1])})`, "text-trade-win-text"],
              ["Worst Month", `${stats.worstMonth[0]} (${formatCurrency(stats.worstMonth[1])})`, "text-trade-loss-text"],
            ].map(([label, val, color]) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#2a2d3a] last:border-0">
                <span className="text-xs text-trade-text-secondary">{label}</span>
                <span className={`font-mono-num text-sm font-semibold ${color}`}>{val}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Filters */}
      <Card className="bg-[#1a1d29] border-[#2a2d3a]">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-sm font-heading text-trade-text-primary">Filters</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Start Date</label>
              <input
                data-testid="filter-start-date"
                type="date"
                value={filters.dateRange.start || ""}
                onChange={e => setFilters(f => ({ ...f, dateRange: { ...f.dateRange, start: e.target.value || null } }))}
                className="bg-[#0f1117] border border-[#2a2d3a] rounded text-trade-text-primary text-sm p-1.5 font-mono-num"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">End Date</label>
              <input
                data-testid="filter-end-date"
                type="date"
                value={filters.dateRange.end || ""}
                onChange={e => setFilters(f => ({ ...f, dateRange: { ...f.dateRange, end: e.target.value || null } }))}
                className="bg-[#0f1117] border border-[#2a2d3a] rounded text-trade-text-primary text-sm p-1.5 font-mono-num"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Account</label>
              <Select value={filters.account} onValueChange={v => setFilters(f => ({ ...f, account: v }))}>
                <SelectTrigger data-testid="filter-account" className="w-36 h-8 bg-[#0f1117] border-[#2a2d3a] text-trade-text-primary text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
                  <SelectItem value="All">All Accounts</SelectItem>
                  {ACCOUNTS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Strategy</label>
              <Select value={filters.strategy} onValueChange={v => setFilters(f => ({ ...f, strategy: v }))}>
                <SelectTrigger data-testid="filter-strategy" className="w-36 h-8 bg-[#0f1117] border-[#2a2d3a] text-trade-text-primary text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
                  <SelectItem value="All">All Strategies</SelectItem>
                  {uniqueStrategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Pair</label>
              <Select value={filters.pair} onValueChange={v => setFilters(f => ({ ...f, pair: v }))}>
                <SelectTrigger data-testid="filter-pair" className="w-36 h-8 bg-[#0f1117] border-[#2a2d3a] text-trade-text-primary text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
                  <SelectItem value="All">All Pairs</SelectItem>
                  {uniquePairs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
