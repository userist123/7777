import React, { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import {
  LayoutDashboard, BarChart3, Target, Globe, FileText,
  Clock, BookOpen, Image, TrendingUp, ChevronLeft,
  ChevronRight, Moon, Sun, Menu, RefreshCw, DollarSign
} from "lucide-react";
import Dashboard from "@/pages/Dashboard";
import PreturiVolume from "@/pages/PreturiVolume";
import IndicatoriTehnici from "@/pages/IndicatoriTehnici";
import SemnaleIntrare from "@/pages/SemnaleIntrare";
import IndicatoriMacro from "@/pages/IndicatoriMacro";
import FisaActiv from "@/pages/FisaActiv";
import IstoricTrending from "@/pages/IstoricTrending";
import GhidInvatare from "@/pages/GhidInvatare";
import AnalizaGrafic from "@/pages/AnalizaGrafic";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "preturi", label: "Preturi & Volume", icon: DollarSign },
  { id: "tehnici", label: "Indicatori Tehnici", icon: BarChart3 },
  { id: "semnale", label: "Semnale Intrare", icon: Target },
  { id: "macro", label: "Indicatori Macro", icon: Globe },
  { id: "fisa", label: "Fisa Activ", icon: FileText },
  { id: "istoric", label: "Istoric & Trending", icon: Clock },
  { id: "ghid", label: "Ghid Invatare", icon: BookOpen },
  { id: "analiza", label: "Analiza Grafic", icon: Image },
];

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [marketData, setMarketData] = useState(null);
  const [marketLoading, setMarketLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const fetchMarketData = useCallback(async () => {
    try {
      setMarketLoading(true);
      const res = await axios.get(`${API}/market-data`);
      if (res.data.loading) {
        setTimeout(fetchMarketData, 5000);
        return;
      }
      setMarketData(res.data);
    } catch (_) {
      setTimeout(fetchMarketData, 10000);
    } finally {
      setMarketLoading(false);
    }
  }, []);

  useEffect(() => { fetchMarketData(); }, [fetchMarketData]);

  useEffect(() => {
    if (!marketData) return;
    const interval = setInterval(fetchMarketData, 300000);
    return () => clearInterval(interval);
  }, [marketData, fetchMarketData]);

  const refreshData = useCallback(async () => {
    try {
      await axios.get(`${API}/market-data/refresh`);
      setTimeout(fetchMarketData, 3000);
    } catch (_) {}
  }, [fetchMarketData]);

  const renderPage = () => {
    const props = { marketData, loading: marketLoading, onRefresh: refreshData, api: API };
    switch (activeTab) {
      case "dashboard": return <Dashboard {...props} />;
      case "preturi": return <PreturiVolume {...props} />;
      case "tehnici": return <IndicatoriTehnici {...props} />;
      case "semnale": return <SemnaleIntrare {...props} />;
      case "macro": return <IndicatoriMacro {...props} />;
      case "fisa": return <FisaActiv {...props} />;
      case "istoric": return <IstoricTrending {...props} />;
      case "ghid": return <GhidInvatare {...props} />;
      case "analiza": return <AnalizaGrafic {...props} />;
      default: return <Dashboard {...props} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? "dark" : ""}`}>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <aside
        data-testid="sidebar"
        className={`fixed lg:relative z-50 h-full flex flex-col transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "w-16" : "w-56"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-[#0d0f15] border-r border-trade-border`}
      >
        <div className="flex items-center gap-2 p-3 border-b border-trade-border h-14">
          <div className="w-7 h-7 rounded-md bg-trade-accent flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-heading font-bold text-trade-text-primary text-sm tracking-tight">Market Analyzer</span>
          )}
        </div>
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-all duration-200
                ${activeTab === item.id
                  ? "bg-trade-accent/15 text-trade-accent border border-trade-accent/20"
                  : "text-trade-text-secondary hover:bg-white/5 hover:text-trade-text-primary border border-transparent"}
                ${sidebarCollapsed ? "justify-center px-2" : ""}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="font-body truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-trade-border space-y-2">
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
            {!sidebarCollapsed && (
              <button data-testid="theme-toggle" onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 text-xs text-trade-text-secondary hover:text-trade-text-primary transition-colors">
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {darkMode ? "Light" : "Dark"}
              </button>
            )}
            <button data-testid="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded text-trade-text-secondary hover:text-trade-text-primary hover:bg-white/5 transition-colors">
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-[#0f1117]">
        <header className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur-sm border-b border-trade-border h-12 flex items-center px-4 lg:px-6 gap-3">
          <button data-testid="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 rounded text-trade-text-secondary hover:text-trade-text-primary">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-bold text-trade-text-primary text-sm lg:text-base tracking-tight">
            {NAV_ITEMS.find(n => n.id === activeTab)?.label || "Dashboard"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {marketData?.timestamp && (
              <span className="text-[10px] text-trade-text-secondary font-mono hidden sm:block">
                {new Date(marketData.timestamp).toLocaleTimeString()}
              </span>
            )}
            <button data-testid="refresh-btn" onClick={refreshData}
              className={`p-1.5 rounded text-trade-text-secondary hover:text-trade-accent hover:bg-white/5 transition-colors ${marketLoading ? "animate-spin" : ""}`}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>
        <div className="p-3 lg:p-5">
          {marketLoading && !marketData ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="animate-spin w-8 h-8 border-2 border-trade-accent border-t-transparent rounded-full" />
              <p className="text-trade-text-secondary text-sm">Se incarca datele de piata ({">"}85 active)...</p>
            </div>
          ) : (
            renderPage()
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
