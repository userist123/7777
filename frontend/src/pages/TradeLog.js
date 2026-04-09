import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { LayoutGrid, List, Plus, Download, Search, ArrowUpDown, Trash2, Eye } from "lucide-react";
import { formatCurrency, formatPct, STRATEGY_COLORS, ACCOUNTS, STRATEGIES, PAIRS } from "@/lib/constants";

const MiniChart = ({ status }) => {
  const isWin = status === "Win";
  const points = isWin ? "10,35 20,30 30,25 40,20 50,15 60,10" : "10,10 20,15 30,20 40,25 50,30 60,35";
  return (
    <svg width="70" height="40" viewBox="0 0 70 45" className="opacity-40">
      <defs>
        <linearGradient id={`grad-${isWin ? 'w' : 'l'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isWin ? "#4ade80" : "#f87171"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isWin ? "#4ade80" : "#f87171"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${points} 60,45 10,45`} fill={`url(#grad-${isWin ? 'w' : 'l'})`} />
      <polyline points={points} fill="none" stroke={isWin ? "#4ade80" : "#f87171"} strokeWidth="1.5" />
    </svg>
  );
};

const TradeCard = ({ trade, onClick }) => {
  const statusConfig = {
    Win: { bg: "bg-trade-win-bg", text: "text-trade-win-text", border: "border-trade-win-border" },
    Loss: { bg: "bg-trade-loss-bg", text: "text-trade-loss-text", border: "border-trade-loss-border" },
    Breakeven: { bg: "bg-trade-warn-bg", text: "text-trade-warn-text", border: "border-trade-warn-border" },
    Open: { bg: "bg-trade-accent/10", text: "text-trade-accent", border: "border-trade-accent/30" },
  };
  const cfg = statusConfig[trade.status] || statusConfig.Open;
  
  return (
    <div
      data-testid={`trade-card-${trade.id}`}
      onClick={() => onClick(trade)}
      className="bg-[#1a1d29] border border-[#2a2d3a] rounded-lg p-4 cursor-pointer trade-card-hover relative overflow-hidden"
    >
      <div className="absolute top-2 right-2 opacity-60">
        <MiniChart status={trade.status} />
      </div>
      <div className="flex items-start justify-between relative z-10">
        <span className="font-heading font-bold text-trade-text-primary text-sm">{trade.pair}</span>
        {trade.strategy && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-body font-medium"
            style={{ backgroundColor: (STRATEGY_COLORS[trade.strategy] || "#6b7280") + "20", color: STRATEGY_COLORS[trade.strategy] || "#6b7280" }}>
            {trade.strategy}
          </span>
        )}
      </div>
      <div className="mt-6 relative z-10">
        <Badge className={`${cfg.bg} ${cfg.text} ${cfg.border} border text-[10px] px-2 py-0.5`}>
          {trade.status}
        </Badge>
        <p className={`font-mono-num text-lg font-bold mt-1 ${trade.pnl >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>
          {formatPct(trade.pnlPct)}
        </p>
        <p className="text-xs text-trade-text-secondary font-body mt-0.5">
          {new Date(trade.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </div>
  );
};

const TradeDetailModal = ({ trade, open, onClose, onDelete }) => {
  if (!trade) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1d29] border-[#2a2d3a] text-trade-text-primary max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            {trade.pair}
            <Badge className={trade.status === "Win" ? "bg-trade-win-bg text-trade-win-text border-trade-win-border" : trade.status === "Loss" ? "bg-trade-loss-bg text-trade-loss-text border-trade-loss-border" : "bg-trade-warn-bg text-trade-warn-text border-trade-warn-border"}>
              {trade.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            ["Direction", trade.direction],
            ["Account", trade.account],
            ["Strategy", trade.strategy],
            ["Entry", trade.entryPrice],
            ["Exit", trade.exitPrice || "Open"],
            ["Stop Loss", trade.stopLoss],
            ["Take Profit", trade.takeProfit],
            ["Lot Size", trade.lotSize],
            ["Leverage", `${trade.leverage}x`],
            ["P/L ($)", formatCurrency(trade.pnl)],
            ["P/L (%)", formatPct(trade.pnlPct)],
            ["P/L (pips)", trade.pnlPips?.toFixed(1)],
            ["R:R", trade.rrActual?.toFixed(2)],
            ["Duration", trade.duration || "N/A"],
            ["Date", new Date(trade.date).toLocaleDateString()],
            ["Exit Date", trade.exitDate ? new Date(trade.exitDate).toLocaleDateString() : "N/A"],
          ].map(([label, val]) => (
            <div key={label} className="bg-[#0f1117] rounded p-2 border border-[#2a2d3a]">
              <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">{label}</p>
              <p className="font-mono-num text-sm font-medium mt-0.5">{val}</p>
            </div>
          ))}
        </div>
        {trade.notes && (
          <div className="mt-3 bg-[#0f1117] rounded p-3 border border-[#2a2d3a]">
            <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary mb-1">Notes</p>
            <p className="text-sm text-trade-text-primary">{trade.notes}</p>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button data-testid="delete-trade-btn" variant="destructive" size="sm" onClick={() => { onDelete(trade.id); onClose(); }}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function TradeLog({ trades, allTrades, onAdd, onUpdate, onDelete, filters, setFilters }) {
  const [viewMode, setViewMode] = useState("visual");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [localFilters, setLocalFilters] = useState({ pair: "All", outcome: "All", strategy: "All", direction: "All" });

  const actualTrades = useMemo(() => {
    let result = trades.filter(t => t.type === "Trade");
    if (localFilters.pair !== "All") result = result.filter(t => t.pair === localFilters.pair);
    if (localFilters.outcome !== "All") result = result.filter(t => t.status === localFilters.outcome);
    if (localFilters.strategy !== "All") result = result.filter(t => t.strategy === localFilters.strategy);
    if (localFilters.direction !== "All") result = result.filter(t => t.direction === localFilters.direction);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => t.pair.toLowerCase().includes(s) || t.notes?.toLowerCase().includes(s) || t.strategy?.toLowerCase().includes(s));
    }
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const dir = sortDir === "asc" ? 1 : -1;
      if (typeof aVal === "number") return (aVal - bVal) * dir;
      return String(aVal || "").localeCompare(String(bVal || "")) * dir;
    });
    return result;
  }, [trades, localFilters, search, sortField, sortDir]);

  const uniquePairs = useMemo(() => [...new Set(trades.filter(t => t.type === "Trade").map(t => t.pair))], [trades]);
  const uniqueStrategies = useMemo(() => [...new Set(trades.filter(t => t.type === "Trade" && t.strategy).map(t => t.strategy))], [trades]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const exportCSV = () => {
    const headers = ["Date", "Account", "Pair", "Direction", "Strategy", "Entry", "Exit", "SL", "TP", "Lot Size", "P/L ($)", "P/L (%)", "P/L (pips)", "R:R", "Status", "Duration", "Notes"];
    const rows = actualTrades.map(t => [t.date, t.account, t.pair, t.direction, t.strategy, t.entryPrice, t.exitPrice, t.stopLoss, t.takeProfit, t.lotSize, t.pnl, t.pnlPct, t.pnlPips, t.rrActual, t.status, t.duration, t.notes].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trades.csv";
    a.click();
  };

  return (
    <div className="space-y-4" data-testid="tradelog-page">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button data-testid="view-visual" size="sm" variant={viewMode === "visual" ? "default" : "ghost"} onClick={() => setViewMode("visual")}
            className={viewMode === "visual" ? "bg-trade-accent text-white" : "text-trade-text-secondary"}>
            <LayoutGrid className="w-4 h-4 mr-1" /> Visual
          </Button>
          <Button data-testid="view-table" size="sm" variant={viewMode === "table" ? "default" : "ghost"} onClick={() => setViewMode("table")}
            className={viewMode === "table" ? "bg-trade-accent text-white" : "text-trade-text-secondary"}>
            <List className="w-4 h-4 mr-1" /> Table
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-trade-text-secondary" />
            <Input data-testid="search-trades" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trades..."
              className="pl-8 h-8 w-48 bg-[#0f1117] border-[#2a2d3a] text-trade-text-primary text-sm" />
          </div>
          <Button data-testid="add-trade-btn" size="sm" onClick={onAdd} className="bg-trade-accent hover:bg-trade-accent/90 text-white h-8">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Trade
          </Button>
          <Button data-testid="export-csv-btn" size="sm" variant="outline" onClick={exportCSV} className="border-[#2a2d3a] text-trade-text-secondary h-8">
            <Download className="w-3.5 h-3.5 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar flex flex-wrap gap-2 p-3 bg-[#1a1d29] border border-[#2a2d3a] rounded-lg">
        <Select value={localFilters.pair} onValueChange={v => setLocalFilters(f => ({ ...f, pair: v }))}>
          <SelectTrigger data-testid="log-filter-pair" className="w-32 h-8 bg-[#0f1117] border-[#2a2d3a] text-trade-text-primary text-xs">
            <SelectValue placeholder="Pair" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
            <SelectItem value="All">All Pairs</SelectItem>
            {uniquePairs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={localFilters.outcome} onValueChange={v => setLocalFilters(f => ({ ...f, outcome: v }))}>
          <SelectTrigger data-testid="log-filter-outcome" className="w-32 h-8 bg-[#0f1117] border-[#2a2d3a] text-trade-text-primary text-xs">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
            <SelectItem value="All">All Outcomes</SelectItem>
            <SelectItem value="Win">Win</SelectItem>
            <SelectItem value="Loss">Loss</SelectItem>
            <SelectItem value="Breakeven">Breakeven</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
          </SelectContent>
        </Select>
        <Select value={localFilters.strategy} onValueChange={v => setLocalFilters(f => ({ ...f, strategy: v }))}>
          <SelectTrigger data-testid="log-filter-strategy" className="w-36 h-8 bg-[#0f1117] border-[#2a2d3a] text-trade-text-primary text-xs">
            <SelectValue placeholder="Strategy" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
            <SelectItem value="All">All Strategies</SelectItem>
            {uniqueStrategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={localFilters.direction} onValueChange={v => setLocalFilters(f => ({ ...f, direction: v }))}>
          <SelectTrigger data-testid="log-filter-direction" className="w-28 h-8 bg-[#0f1117] border-[#2a2d3a] text-trade-text-primary text-xs">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1d29] border-[#2a2d3a]">
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Buy">Buy</SelectItem>
            <SelectItem value="Sell">Sell</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {viewMode === "visual" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {actualTrades.map(trade => (
            <TradeCard key={trade.id} trade={trade} onClick={(t) => { setSelectedTrade(t); setDetailOpen(true); }} />
          ))}
          {actualTrades.length === 0 && (
            <div className="col-span-full text-center py-16 text-trade-text-secondary">
              <p className="text-lg font-heading">No trades found</p>
              <p className="text-sm mt-1">Try adjusting your filters or add a new trade</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#1a1d29] border border-[#2a2d3a] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a2d3a] hover:bg-transparent">
                  {["#", "Date", "Account", "Pair", "Direction", "Strategy", "Entry", "Exit", "SL", "TP", "Lots", "P/L ($)", "P/L (%)", "Pips", "R:R", "Status", "Duration"].map(col => (
                    <TableHead key={col} className="text-[10px] uppercase tracking-widest text-trade-text-secondary cursor-pointer hover:text-trade-text-primary whitespace-nowrap"
                      onClick={() => handleSort(col.toLowerCase().replace(/[^a-z]/g, ''))}>
                      {col} <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {actualTrades.map((trade, i) => {
                  const rowBg = trade.status === "Win" ? "bg-trade-win-bg/30" : trade.status === "Loss" ? "bg-trade-loss-bg/30" : trade.status === "Breakeven" ? "bg-trade-warn-bg/30" : "bg-trade-accent/5";
                  return (
                    <TableRow key={trade.id} className={`${rowBg} border-[#2a2d3a] cursor-pointer hover:bg-white/5`}
                      onClick={() => { setSelectedTrade(trade); setDetailOpen(true); }} data-testid={`trade-row-${trade.id}`}>
                      <TableCell className="font-mono-num text-xs text-trade-text-secondary">{i + 1}</TableCell>
                      <TableCell className="font-mono-num text-xs whitespace-nowrap">{new Date(trade.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs">{trade.account}</TableCell>
                      <TableCell className="font-heading font-bold text-xs">{trade.pair}</TableCell>
                      <TableCell className={`text-xs font-medium ${trade.direction === "Buy" ? "text-trade-win-text" : "text-trade-loss-text"}`}>{trade.direction}</TableCell>
                      <TableCell className="text-xs">{trade.strategy}</TableCell>
                      <TableCell className="font-mono-num text-xs">{trade.entryPrice}</TableCell>
                      <TableCell className="font-mono-num text-xs">{trade.exitPrice || "-"}</TableCell>
                      <TableCell className="font-mono-num text-xs">{trade.stopLoss}</TableCell>
                      <TableCell className="font-mono-num text-xs">{trade.takeProfit}</TableCell>
                      <TableCell className="font-mono-num text-xs">{trade.lotSize}</TableCell>
                      <TableCell className={`font-mono-num text-xs font-semibold ${trade.pnl >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{formatCurrency(trade.pnl)}</TableCell>
                      <TableCell className={`font-mono-num text-xs font-semibold ${trade.pnlPct >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>{formatPct(trade.pnlPct)}</TableCell>
                      <TableCell className="font-mono-num text-xs">{trade.pnlPips?.toFixed(1)}</TableCell>
                      <TableCell className="font-mono-num text-xs">{trade.rrActual?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${trade.status === "Win" ? "bg-trade-win-bg text-trade-win-text border-trade-win-border" : trade.status === "Loss" ? "bg-trade-loss-bg text-trade-loss-text border-trade-loss-border" : trade.status === "Breakeven" ? "bg-trade-warn-bg text-trade-warn-text border-trade-warn-border" : "bg-trade-accent/10 text-trade-accent"} border`}>
                          {trade.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono-num text-xs">{trade.duration || "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <TradeDetailModal trade={selectedTrade} open={detailOpen} onClose={() => setDetailOpen(false)} onDelete={onDelete} />
    </div>
  );
}
