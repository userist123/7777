import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function TradingCalendar({ trades }) {
  const [viewMode, setViewMode] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Feb 2026
  const [weekNotes, setWeekNotes] = useState({});

  const tradeDates = useMemo(() => {
    const map = {};
    trades.filter(t => t.type === "Trade").forEach(t => {
      const dateKey = t.date?.substring(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(t);
    });
    return map;
  }, [trades]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const navigateMonth = (dir) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  const navigateWeek = (dir) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  // Month view calendar grid
  const monthGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7; // Monday-based
    const totalDays = lastDay.getDate();
    
    const cells = [];
    // Empty cells before first day
    for (let i = 0; i < startDay; i++) cells.push(null);
    // Day cells
    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, dateKey, trades: tradeDates[dateKey] || [] });
    }
    return cells;
  }, [year, month, tradeDates]);

  // Week view
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(d);
      date.setDate(d.getDate() + i);
      const dateKey = date.toISOString().substring(0, 10);
      days.push({ date, dateKey, dayName: DAYS[i], trades: tradeDates[dateKey] || [] });
    }
    return days;
  }, [currentDate, tradeDates]);

  const weekKey = weekDays[0]?.dateKey || "";

  return (
    <div className="space-y-4" data-testid="trading-calendar-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button data-testid="cal-view-week" size="sm" variant={viewMode === "week" ? "default" : "ghost"} onClick={() => setViewMode("week")}
            className={viewMode === "week" ? "bg-trade-accent text-white" : "text-trade-text-secondary"}>
            Week
          </Button>
          <Button data-testid="cal-view-month" size="sm" variant={viewMode === "month" ? "default" : "ghost"} onClick={() => setViewMode("month")}
            className={viewMode === "month" ? "bg-trade-accent text-white" : "text-trade-text-secondary"}>
            Month
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button data-testid="cal-prev" size="sm" variant="ghost" onClick={() => viewMode === "month" ? navigateMonth(-1) : navigateWeek(-1)}
            className="text-trade-text-secondary hover:text-trade-text-primary">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-heading font-bold text-trade-text-primary text-sm min-w-32 text-center">
            {viewMode === "month"
              ? `${MONTHS[month]} ${year}`
              : `${weekDays[0]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDays[6]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
            }
          </span>
          <Button data-testid="cal-next" size="sm" variant="ghost" onClick={() => viewMode === "month" ? navigateMonth(1) : navigateWeek(1)}
            className="text-trade-text-secondary hover:text-trade-text-primary">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Month View */}
      {viewMode === "month" && (
        <Card className="bg-[#1a1d29] border-[#2a2d3a]">
          <CardContent className="p-3">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] uppercase tracking-widest text-trade-text-secondary py-1">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map((cell, i) => {
                if (!cell) return <div key={`empty-${i}`} className="h-24 bg-[#0f1117] rounded" />;
                const netPnl = cell.trades.reduce((s, t) => s + (t.pnl || 0), 0);
                const hasTrades = cell.trades.length > 0;
                const bgColor = hasTrades ? (netPnl > 0 ? "bg-trade-win-bg/40" : "bg-trade-loss-bg/40") : "bg-[#0f1117]";
                
                return (
                  <div key={cell.dateKey} className={`${bgColor} rounded p-1.5 h-24 overflow-hidden border border-transparent hover:border-[#2a2d3a] transition-colors`}
                    data-testid={`cal-day-${cell.dateKey}`}>
                    <span className="text-[10px] text-trade-text-secondary font-mono-num">{cell.day}</span>
                    <div className="mt-0.5 space-y-0.5 overflow-y-auto max-h-16">
                      {cell.trades.slice(0, 3).map(t => (
                        <div key={t.id} className="flex items-center gap-1 text-[9px]">
                          <span className="font-heading font-bold text-trade-text-primary truncate">{t.pair}</span>
                          <Badge className={`text-[8px] px-1 py-0 ${t.status === "Win" ? "bg-trade-win-bg text-trade-win-text" : t.status === "Loss" ? "bg-trade-loss-bg text-trade-loss-text" : "bg-trade-warn-bg text-trade-warn-text"}`}>
                            {t.status === "Win" ? "W" : t.status === "Loss" ? "L" : "BE"}
                          </Badge>
                        </div>
                      ))}
                      {cell.trades.length > 3 && (
                        <span className="text-[8px] text-trade-text-secondary">+{cell.trades.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(wd => {
            const netPnl = wd.trades.reduce((s, t) => s + (t.pnl || 0), 0);
            const hasTrades = wd.trades.length > 0;
            return (
              <Card key={wd.dateKey} className={`bg-[#1a1d29] border-[#2a2d3a] ${hasTrades ? (netPnl > 0 ? "ring-1 ring-trade-win-border/30" : "ring-1 ring-trade-loss-border/30") : ""}`}>
                <CardHeader className="p-2 pb-1">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-trade-text-secondary">{wd.dayName}</p>
                    <p className="font-mono-num text-sm font-bold text-trade-text-primary">{wd.date.getDate()}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-0 space-y-1.5">
                  {wd.trades.map(t => (
                    <div key={t.id} className="bg-[#0f1117] rounded p-2 border border-[#2a2d3a]">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-trade-text-primary text-[10px]">{t.pair}</span>
                        <Badge className={`text-[8px] px-1 py-0 ${t.status === "Win" ? "bg-trade-win-bg text-trade-win-text" : t.status === "Loss" ? "bg-trade-loss-bg text-trade-loss-text" : "bg-trade-warn-bg text-trade-warn-text"}`}>
                          {t.status}
                        </Badge>
                      </div>
                      <p className="text-[9px] text-trade-text-secondary mt-0.5">{t.direction} | {t.strategy}</p>
                      <p className={`font-mono-num text-xs font-bold ${t.pnl >= 0 ? "text-trade-win-text" : "text-trade-loss-text"}`}>
                        {t.pnl >= 0 ? "+" : ""}{t.pnlPct?.toFixed(2)}%
                      </p>
                    </div>
                  ))}
                  {wd.trades.length === 0 && (
                    <div className="text-center py-4 text-[10px] text-trade-text-secondary">No trades</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Strategy Planning Notes */}
      <Card className="bg-[#1a1d29] border-[#2a2d3a]">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-sm font-heading text-trade-text-primary">Strategy Planning Notes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <textarea
            data-testid="strategy-planning-notes"
            value={weekNotes[weekKey] || ""}
            onChange={e => setWeekNotes(n => ({ ...n, [weekKey]: e.target.value }))}
            className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-md text-sm p-3 text-trade-text-primary resize-none h-32 font-body"
            placeholder="Write your strategy planning notes for this week..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
