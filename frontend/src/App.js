import React, { useState, useEffect, useCallback, useMemo } from "react";
import "@/App.css";
import axios from "axios";
import {
  LayoutDashboard, ClipboardList, BarChart3, Building2, TrendingUp,
  FileText, CalendarDays, Calculator, ChevronLeft, ChevronRight,
  Moon, Sun, Plus, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Dashboard from "@/pages/Dashboard";
import TradeLog from "@/pages/TradeLog";
import StrategyReport from "@/pages/StrategyReport";
import AccountReport from "@/pages/AccountReport";
import MarketAnalysis from "@/pages/MarketAnalysis";
import AssetDetail from "@/pages/AssetDetail";
import TradingCalendar from "@/pages/TradingCalendar";
import Calculators from "@/pages/Calculators";
import AddTradeModal from "@/pages/AddTradeModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tradelog", label: "Trade Log", icon: ClipboardList },
  { id: "strategy", label: "Strategy Report", icon: BarChart3 },
  { id: "account", label: "Account Report", icon: Building2 },
  { id: "market", label: "Market Analysis", icon: TrendingUp },
  { id: "asset", label: "Asset Detail", icon: FileText },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "calculators", label: "Calculators", icon: Calculator },
];

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    account: "All",
    strategy: "All",
    pair: "All",
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/trades`);
      setTrades(res.data);
    } catch (_) { /* network error — UI shows empty state */ }
    finally { setLoading(false); }
  }, []);

  const seedTrades = useCallback(async () => {
    try {
      await axios.post(`${API}/trades/seed`);
      await fetchTrades();
    } catch (_) { /* seed endpoint failed — user can add trades manually */ }
  }, [fetchTrades]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  useEffect(() => {
    if (!loading && trades.length === 0) { seedTrades(); }
  }, [loading, trades.length, seedTrades]);

  const addTrade = useCallback(async (trade) => {
    try { await axios.post(`${API}/trades`, trade); await fetchTrades(); }
    catch (_) { /* handled by empty state */ }
  }, [fetchTrades]);

  const updateTrade = useCallback(async (id, trade) => {
    try { await axios.put(`${API}/trades/${id}`, trade); await fetchTrades(); }
    catch (_) { /* handled by empty state */ }
  }, [fetchTrades]);

  const deleteTrade = useCallback(async (id) => {
    try { await axios.delete(`${API}/trades/${id}`); await fetchTrades(); }
    catch (_) { /* handled by empty state */ }
  }, [fetchTrades]);

  const fetchMarketData = useCallback(async () => {
    try {
      setMarketLoading(true);
      const res = await axios.get(`${API}/market-data`);
      setMarketData(res.data);
    } catch (_) { /* market data unavailable — UI shows empty state */ }
    finally { setMarketLoading(false); }
  }, []);

  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      if (filters.account !== "All" && t.account !== filters.account) return false;
      if (filters.strategy !== "All" && t.strategy !== filters.strategy) return false;
      if (filters.pair !== "All" && t.pair !== filters.pair) return false;
      if (filters.dateRange.start && new Date(t.date) < new Date(filters.dateRange.start)) return false;
      if (filters.dateRange.end && new Date(t.date) > new Date(filters.dateRange.end)) return false;
      return true;
    });
  }, [trades, filters]);

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard trades={filteredTrades} allTrades={trades} filters={filters} setFilters={setFilters} />;
      case "tradelog":
        return <TradeLog trades={filteredTrades} allTrades={trades} onAdd={() => setShowAddTrade(true)} onUpdate={updateTrade} onDelete={deleteTrade} filters={filters} setFilters={setFilters} />;
      case "strategy":
        return <StrategyReport trades={filteredTrades} />;
      case "account":
        return <AccountReport trades={trades} />;
      case "market":
        return <MarketAnalysis marketData={marketData} loading={marketLoading} onFetch={fetchMarketData} />;
      case "asset":
        return <AssetDetail marketData={marketData} loading={marketLoading} onFetch={fetchMarketData} />;
      case "calendar":
        return <TradingCalendar trades={filteredTrades} />;
      case "calculators":
        return <Calculators />;
      default:
        return <Dashboard trades={filteredTrades} allTrades={trades} filters={filters} setFilters={setFilters} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? "dark" : ""}`}>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className={`fixed lg:relative z-50 h-full flex flex-col transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "w-16" : "w-60"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-[#0d0f15] border-r border-trade-border`}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 p-4 border-b border-trade-border h-14">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-trade-accent flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-trade-text-primary text-sm tracking-tight">TradeTracker</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-7 h-7 rounded-md bg-trade-accent flex items-center justify-center mx-auto">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200
                ${activeTab === item.id
                  ? "bg-trade-accent/15 text-trade-accent border border-trade-accent/20"
                  : "text-trade-text-secondary hover:bg-white/5 hover:text-trade-text-primary border border-transparent"
                }
                ${sidebarCollapsed ? "justify-center px-2" : ""}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="font-body truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="p-3 border-t border-trade-border space-y-2">
          {!sidebarCollapsed && (
            <Button
              data-testid="add-trade-sidebar-btn"
              onClick={() => setShowAddTrade(true)}
              className="w-full bg-trade-accent hover:bg-trade-accent/90 text-white rounded-md h-9 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Trade
            </Button>
          )}
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
            {!sidebarCollapsed && (
              <button
                data-testid="theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 text-xs text-trade-text-secondary hover:text-trade-text-primary transition-colors"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {darkMode ? "Light" : "Dark"}
              </button>
            )}
            <button
              data-testid="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded text-trade-text-secondary hover:text-trade-text-primary hover:bg-white/5 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#0f1117]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur-sm border-b border-trade-border h-14 flex items-center px-4 lg:px-6 gap-3">
          <button
            data-testid="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 rounded text-trade-text-secondary hover:text-trade-text-primary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-bold text-trade-text-primary text-base lg:text-lg tracking-tight">
            {NAV_ITEMS.find(n => n.id === activeTab)?.label || "Dashboard"}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <Button
              data-testid="add-trade-header-btn"
              onClick={() => setShowAddTrade(true)}
              size="sm"
              className="bg-trade-accent hover:bg-trade-accent/90 text-white rounded-md h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Trade
            </Button>
            <button
              data-testid="theme-toggle-header"
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded text-trade-text-secondary hover:text-trade-text-primary hover:bg-white/5 transition-colors lg:hidden"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-2 border-trade-accent border-t-transparent rounded-full" />
            </div>
          ) : (
            renderPage()
          )}
        </div>
      </main>

      {/* Add Trade Modal */}
      <AddTradeModal
        open={showAddTrade}
        onClose={() => setShowAddTrade(false)}
        onAdd={addTrade}
      />
    </div>
  );
}

export default App;
