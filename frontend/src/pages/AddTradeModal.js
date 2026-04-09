import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAIRS, STRATEGIES, ACCOUNTS, DIRECTIONS, TRADE_TYPES } from "@/lib/constants";

export default function AddTradeModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({
    account: "Account 1", type: "Trade", date: new Date().toISOString().substring(0, 16),
    strategy: "Strategy 1", pair: "EUR/USD", direction: "Buy",
    lotSize: 0.1, leverage: 100, entryPrice: 0, stopLoss: 0, takeProfit: 0,
    exitPrice: "", exitDate: "", notes: "", amount: 0,
    pnl: 0, pnlPct: 0, pnlPips: 0, rrActual: 0, status: "Open", duration: "",
  });

  const handleSubmit = () => {
    const trade = {
      ...form,
      lotSize: parseFloat(form.lotSize) || 0,
      leverage: parseInt(form.leverage) || 100,
      entryPrice: parseFloat(form.entryPrice) || 0,
      stopLoss: parseFloat(form.stopLoss) || 0,
      takeProfit: parseFloat(form.takeProfit) || 0,
      exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : null,
      exitDate: form.exitDate || null,
      amount: parseFloat(form.amount) || 0,
      date: new Date(form.date).toISOString(),
    };

    // Compute P/L if trade type and has exit
    if (trade.type === "Trade" && trade.exitPrice && trade.entryPrice) {
      const dir = trade.direction === "Buy" ? 1 : -1;
      const diff = (trade.exitPrice - trade.entryPrice) * dir;
      trade.pnlPct = trade.entryPrice ? (diff / trade.entryPrice) * 100 : 0;
      
      if (trade.pair.includes("XAU")) trade.pnl = diff * trade.lotSize * 100;
      else if (trade.pair.includes("BTC") || trade.pair.includes("ETH") || trade.pair.includes("SOL") || trade.pair.includes("USDT")) trade.pnl = diff * trade.lotSize;
      else trade.pnl = diff * trade.lotSize * 100000;
      
      trade.pnl = Math.round(trade.pnl * 100) / 100;
      trade.pnlPct = Math.round(trade.pnlPct * 100) / 100;
      
      const slDiff = Math.abs(trade.entryPrice - trade.stopLoss);
      trade.rrActual = slDiff ? Math.round((Math.abs(diff) / slDiff) * (trade.pnl >= 0 ? 1 : -1) * 100) / 100 : 0;
      trade.status = Math.abs(trade.pnlPct) < 0.1 ? "Breakeven" : trade.pnl > 0 ? "Win" : "Loss";
    } else if (trade.type !== "Trade") {
      trade.status = "Completed";
    }

    onAdd(trade);
    onClose();
    setForm({
      account: "Account 1", type: "Trade", date: new Date().toISOString().substring(0, 16),
      strategy: "Strategy 1", pair: "EUR/USD", direction: "Buy",
      lotSize: 0.1, leverage: 100, entryPrice: 0, stopLoss: 0, takeProfit: 0,
      exitPrice: "", exitDate: "", notes: "", amount: 0,
      pnl: 0, pnlPct: 0, pnlPips: 0, rrActual: 0, status: "Open", duration: "",
    });
  };

  const isDeposit = form.type === "Deposit" || form.type === "Withdrawal";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1d29] border-[#2a2d3a] text-trade-text-primary max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Add New {form.type}</DialogTitle>
          <p className="text-sm text-trade-text-secondary">Fill in the details below</p>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger data-testid="add-trade-type" className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
                  {TRADE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Account</Label>
              <Select value={form.account} onValueChange={v => setForm(f => ({ ...f, account: v }))}>
                <SelectTrigger data-testid="add-trade-account" className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
                  {ACCOUNTS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Date & Time</Label>
            <Input data-testid="add-trade-date" type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
          </div>

          {isDeposit ? (
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Amount ($)</Label>
              <Input data-testid="add-trade-amount" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Pair</Label>
                  <Select value={form.pair} onValueChange={v => setForm(f => ({ ...f, pair: v }))}>
                    <SelectTrigger data-testid="add-trade-pair" className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1d29] border-[#2a2d3a] max-h-48">
                      {PAIRS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Direction</Label>
                  <Select value={form.direction} onValueChange={v => setForm(f => ({ ...f, direction: v }))}>
                    <SelectTrigger data-testid="add-trade-direction" className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
                      {DIRECTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Strategy</Label>
                  <Select value={form.strategy} onValueChange={v => setForm(f => ({ ...f, strategy: v }))}>
                    <SelectTrigger data-testid="add-trade-strategy" className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
                      {STRATEGIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Lot Size</Label>
                  <Input data-testid="add-trade-lotsize" type="number" step="0.01" value={form.lotSize} onChange={e => setForm(f => ({ ...f, lotSize: e.target.value }))}
                    className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Entry Price</Label>
                  <Input data-testid="add-trade-entry" type="number" step="0.0001" value={form.entryPrice} onChange={e => setForm(f => ({ ...f, entryPrice: e.target.value }))}
                    className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Stop Loss</Label>
                  <Input data-testid="add-trade-sl" type="number" step="0.0001" value={form.stopLoss} onChange={e => setForm(f => ({ ...f, stopLoss: e.target.value }))}
                    className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Take Profit</Label>
                  <Input data-testid="add-trade-tp" type="number" step="0.0001" value={form.takeProfit} onChange={e => setForm(f => ({ ...f, takeProfit: e.target.value }))}
                    className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Exit Price (optional)</Label>
                  <Input data-testid="add-trade-exit" type="number" step="0.0001" value={form.exitPrice} onChange={e => setForm(f => ({ ...f, exitPrice: e.target.value }))}
                    className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" placeholder="Leave empty if open" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Leverage</Label>
                  <Input data-testid="add-trade-leverage" type="number" value={form.leverage} onChange={e => setForm(f => ({ ...f, leverage: e.target.value }))}
                    className="bg-[#0f1117] border-[#2a2d3a] text-sm h-9 font-mono-num" />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-widest text-trade-text-secondary">Notes</Label>
            <textarea data-testid="add-trade-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded text-sm p-2 text-trade-text-primary resize-none h-20 font-body" placeholder="Trade notes..." />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button data-testid="cancel-add-trade" variant="ghost" onClick={onClose} className="text-trade-text-secondary">Cancel</Button>
          <Button data-testid="submit-add-trade" onClick={handleSubmit} className="bg-trade-accent hover:bg-trade-accent/90 text-white">
            Add {form.type}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
