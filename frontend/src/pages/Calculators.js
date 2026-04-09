import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PAIRS, formatCurrency, formatNumber } from "@/lib/constants";

const CalcCard = ({ title, children, testId }) => (
  <Card className="bg-[#1a1d29] border-[#2a2d3a]" data-testid={testId}>
    <CardHeader className="pb-2 p-4">
      <CardTitle className="text-sm font-heading text-trade-text-primary">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">{children}</CardContent>
  </Card>
);

const ResultRow = ({ label, value, color = "text-trade-text-primary" }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-[#2a2d3a] last:border-0">
    <span className="text-xs text-trade-text-secondary">{label}</span>
    <span className={`font-mono-num text-sm font-semibold ${color}`}>{value}</span>
  </div>
);

function PositionSizeCalc() {
  const [balance, setBalance] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [slPips, setSlPips] = useState(30);
  const [pair, setPair] = useState("EUR/USD");

  const results = useMemo(() => {
    const riskAmount = balance * (riskPct / 100);
    let pipValue = 10; // standard lot EUR/USD
    if (pair.includes("JPY")) pipValue = 1000 / 110;
    if (pair.includes("XAU")) pipValue = 10;
    const lotSize = slPips > 0 ? riskAmount / (slPips * pipValue) : 0;
    const posValue = lotSize * 100000;
    return { lotSize: Math.round(lotSize * 100) / 100, posValue: Math.round(posValue), riskAmount: Math.round(riskAmount * 100) / 100 };
  }, [balance, riskPct, slPips, pair]);

  return (
    <CalcCard title="Position Size Calculator" testId="calc-position-size">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Account Balance</Label>
          <Input type="number" value={balance} onChange={e => setBalance(parseFloat(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Risk %</Label>
          <Input type="number" step="0.1" value={riskPct} onChange={e => setRiskPct(parseFloat(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Stop Loss (pips)</Label>
          <Input type="number" value={slPips} onChange={e => setSlPips(parseFloat(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Pair</Label>
          <Select value={pair} onValueChange={setPair}>
            <SelectTrigger className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1a1d29] border-[#2a2d3a] max-h-48">
              {PAIRS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="bg-[#0f1117] rounded-md p-3 border border-[#2a2d3a]">
        <ResultRow label="Lot Size" value={results.lotSize} color="text-trade-accent" />
        <ResultRow label="Position Value" value={formatCurrency(results.posValue)} />
        <ResultRow label="Risk Amount" value={formatCurrency(results.riskAmount)} color="text-trade-loss-text" />
      </div>
    </CalcCard>
  );
}

function RiskRewardCalc() {
  const [entry, setEntry] = useState(1.085);
  const [sl, setSl] = useState(1.082);
  const [tp, setTp] = useState(1.094);

  const results = useMemo(() => {
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    const rr = risk > 0 ? reward / risk : 0;
    const riskPips = Math.round(risk * 10000);
    const rewardPips = Math.round(reward * 10000);
    const reqWinRate = rr > 0 ? (1 / (1 + rr)) * 100 : 0;
    return { rr: Math.round(rr * 100) / 100, riskPips, rewardPips, reqWinRate: Math.round(reqWinRate * 10) / 10 };
  }, [entry, sl, tp]);

  return (
    <CalcCard title="Risk/Reward Calculator" testId="calc-risk-reward">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Entry Price</Label>
          <Input type="number" step="0.0001" value={entry} onChange={e => setEntry(parseFloat(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Stop Loss</Label>
          <Input type="number" step="0.0001" value={sl} onChange={e => setSl(parseFloat(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Take Profit</Label>
          <Input type="number" step="0.0001" value={tp} onChange={e => setTp(parseFloat(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
      </div>
      <div className="bg-[#0f1117] rounded-md p-3 border border-[#2a2d3a]">
        <ResultRow label="R:R Ratio" value={`1:${results.rr}`} color="text-trade-accent" />
        <ResultRow label="Risk (pips)" value={results.riskPips} color="text-trade-loss-text" />
        <ResultRow label="Reward (pips)" value={results.rewardPips} color="text-trade-win-text" />
        <ResultRow label="Required Win Rate" value={`${results.reqWinRate}%`} />
      </div>
    </CalcCard>
  );
}

function PipValueCalc() {
  const [pair, setPair] = useState("EUR/USD");
  const [lotSize, setLotSize] = useState(1.0);

  const pipValue = useMemo(() => {
    if (pair.includes("JPY")) return lotSize * 1000 / 110;
    if (pair.includes("XAU")) return lotSize * 10;
    if (pair.includes("XAG")) return lotSize * 50;
    if (pair.includes("BTC")) return lotSize * 1;
    return lotSize * 10;
  }, [pair, lotSize]);

  return (
    <CalcCard title="Pip Value Calculator" testId="calc-pip-value">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Pair</Label>
          <Select value={pair} onValueChange={setPair}>
            <SelectTrigger className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1a1d29] border-[#2a2d3a] max-h-48">
              {PAIRS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Lot Size</Label>
          <Input type="number" step="0.01" value={lotSize} onChange={e => setLotSize(parseFloat(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
      </div>
      <div className="bg-[#0f1117] rounded-md p-3 border border-[#2a2d3a]">
        <ResultRow label="Pip Value" value={formatCurrency(Math.round(pipValue * 100) / 100)} color="text-trade-accent" />
      </div>
    </CalcCard>
  );
}

function CompoundGrowthCalc() {
  const [startBalance, setStartBalance] = useState(10000);
  const [winRate, setWinRate] = useState(55);
  const [avgRR, setAvgRR] = useState(1.5);
  const [tradesPerMonth, setTradesPerMonth] = useState(20);
  const [months, setMonths] = useState(12);

  const chartData = useMemo(() => {
    const data = [{ month: 0, balance: startBalance }];
    let balance = startBalance;
    const riskPct = 1;
    const wr = winRate / 100;
    
    for (let m = 1; m <= months; m++) {
      for (let t = 0; t < tradesPerMonth; t++) {
        const risk = balance * (riskPct / 100);
        if (Math.random() < wr) {
          balance += risk * avgRR;
        } else {
          balance -= risk;
        }
      }
      data.push({ month: m, balance: Math.round(balance * 100) / 100 });
    }
    return data;
  }, [startBalance, winRate, avgRR, tradesPerMonth, months]);

  const finalBalance = chartData[chartData.length - 1]?.balance || startBalance;

  return (
    <CalcCard title="Compound Growth Calculator" testId="calc-compound">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Starting Balance</Label>
          <Input type="number" value={startBalance} onChange={e => setStartBalance(parseFloat(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Win Rate %</Label>
          <Input type="number" value={winRate} onChange={e => setWinRate(parseFloat(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Avg R:R</Label>
          <Input type="number" step="0.1" value={avgRR} onChange={e => setAvgRR(parseFloat(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Trades/Month</Label>
          <Input type="number" value={tradesPerMonth} onChange={e => setTradesPerMonth(parseInt(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Months</Label>
          <Input type="number" value={months} onChange={e => setMonths(parseInt(e.target.value) || 0)}
            className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
        </div>
      </div>

      <div className="bg-[#0f1117] rounded-md p-3 border border-[#2a2d3a] mb-4">
        <ResultRow label="Projected Balance" value={formatCurrency(finalBalance)} color="text-trade-accent" />
        <ResultRow label="Total Growth" value={`${((finalBalance / startBalance - 1) * 100).toFixed(1)}%`} color="text-trade-win-text" />
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
            <XAxis dataKey="month" tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Month", position: "insideBottom", offset: -5, fill: "#8892a4", fontSize: 10 }} />
            <YAxis tick={{ fill: "#8892a4", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(l) => `Month ${l}`}
              contentStyle={{ backgroundColor: "#1a1d29", border: "1px solid #2a2d3a", borderRadius: 8 }}
              itemStyle={{ color: "#e2e8f0" }} labelStyle={{ color: "#8892a4" }} />
            <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={false} name="Balance" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CalcCard>
  );
}

export default function Calculators() {
  return (
    <div className="space-y-4" data-testid="calculators-page">
      <h2 className="font-heading text-xl font-bold text-trade-text-primary">Trading Calculators</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PositionSizeCalc />
        <RiskRewardCalc />
        <PipValueCalc />
        <CompoundGrowthCalc />
      </div>
    </div>
  );
}
