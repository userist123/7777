import { getPipMultiplier } from "./constants";

export const calculatePnL = (trade) => {
  if (trade.type !== "Trade" || !trade.exitPrice || !trade.entryPrice) {
    return { pnl: 0, pnlPct: 0, pnlPips: 0, rrActual: 0, status: trade.type === "Trade" ? "Open" : "Completed" };
  }

  const multiplier = getPipMultiplier(trade.pair);
  const direction = trade.direction === "Buy" ? 1 : -1;
  const priceDiff = (trade.exitPrice - trade.entryPrice) * direction;
  const pnlPips = priceDiff * multiplier;
  
  let pnl = 0;
  if (trade.pair.includes("XAU")) {
    pnl = priceDiff * trade.lotSize * 100;
  } else if (trade.pair.includes("XAG")) {
    pnl = priceDiff * trade.lotSize * 5000;
  } else if (trade.pair.includes("BTC") || trade.pair.includes("ETH") || trade.pair.includes("SOL") ||
             trade.pair.includes("DOGE") || trade.pair.includes("ADA") || trade.pair.includes("XRP") ||
             trade.pair.includes("DOT") || trade.pair.includes("ONDO") || trade.pair.includes("WIF") ||
             trade.pair.includes("BNB") || trade.pair.includes("ATOM") || trade.pair.includes("HYPE") ||
             trade.pair.includes("CRO") || trade.pair.includes("POL") || trade.pair.includes("AVAX") ||
             trade.pair.includes("NEAR")) {
    pnl = priceDiff * trade.lotSize;
  } else {
    pnl = priceDiff * trade.lotSize * 100000;
  }

  const pnlPct = trade.entryPrice !== 0 ? (priceDiff / trade.entryPrice) * 100 : 0;
  
  const slDiff = Math.abs(trade.entryPrice - trade.stopLoss);
  const tpDiff = Math.abs(trade.takeProfit - trade.entryPrice);
  const actualDiff = Math.abs(trade.exitPrice - trade.entryPrice);
  const rrActual = slDiff !== 0 ? (actualDiff / slDiff) * (pnl >= 0 ? 1 : -1) : 0;
  
  let status = "Open";
  if (trade.exitPrice) {
    if (Math.abs(pnlPct) < 0.1) status = "Breakeven";
    else if (pnl > 0) status = "Win";
    else status = "Loss";
  }

  return { pnl: Math.round(pnl * 100) / 100, pnlPct: Math.round(pnlPct * 100) / 100, pnlPips: Math.round(pnlPips * 10) / 10, rrActual: Math.round(rrActual * 100) / 100, status };
};

export const getTradeStats = (trades, startingBalance = 10000) => {
  const actualTrades = trades.filter(t => t.type === "Trade");
  const wins = actualTrades.filter(t => t.status === "Win");
  const losses = actualTrades.filter(t => t.status === "Loss");
  const breakevens = actualTrades.filter(t => t.status === "Breakeven");
  const openTrades = actualTrades.filter(t => t.status === "Open");
  const closedTrades = actualTrades.filter(t => t.status !== "Open");

  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = losses.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0);
  
  const deposits = trades.filter(t => t.type === "Deposit").reduce((sum, t) => sum + (t.amount || 0), 0);
  const withdrawals = trades.filter(t => t.type === "Withdrawal").reduce((sum, t) => sum + (t.amount || 0), 0);
  const balance = deposits - withdrawals + totalPnl;

  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.pnl || 0)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.pnl || 0)) : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  const expectedValue = closedTrades.length > 0 ? totalPnl / closedTrades.length : 0;
  
  const avgRR = closedTrades.length > 0
    ? closedTrades.reduce((sum, t) => sum + Math.abs(t.rrActual || 0), 0) / closedTrades.length
    : 0;

  const buyTrades = actualTrades.filter(t => t.direction === "Buy").length;
  const sellTrades = actualTrades.filter(t => t.direction === "Sell").length;

  // Streaks
  let maxWinStreak = 0, maxLoseStreak = 0, currentWin = 0, currentLose = 0;
  const sortedClosed = [...closedTrades].sort((a, b) => new Date(a.date) - new Date(b.date));
  sortedClosed.forEach(t => {
    if (t.status === "Win") { currentWin++; currentLose = 0; maxWinStreak = Math.max(maxWinStreak, currentWin); }
    else if (t.status === "Loss") { currentLose++; currentWin = 0; maxLoseStreak = Math.max(maxLoseStreak, currentLose); }
    else { currentWin = 0; currentLose = 0; }
  });

  // Max Drawdown
  let peak = deposits;
  let maxDrawdown = 0;
  let runningBalance = deposits;
  sortedClosed.forEach(t => {
    runningBalance += (t.pnl || 0);
    if (runningBalance > peak) peak = runningBalance;
    const dd = ((peak - runningBalance) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  });

  // Most used strategy / pair
  const stratCount = {};
  const pairCount = {};
  actualTrades.forEach(t => {
    stratCount[t.strategy] = (stratCount[t.strategy] || 0) + 1;
    pairCount[t.pair] = (pairCount[t.pair] || 0) + 1;
  });
  const mostUsedStrategy = Object.entries(stratCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const mostUsedPair = Object.entries(pairCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Monthly P/L
  const monthlyPnl = {};
  closedTrades.forEach(t => {
    const month = t.date?.substring(0, 7);
    if (month) {
      if (!monthlyPnl[month]) monthlyPnl[month] = 0;
      monthlyPnl[month] += (t.pnl || 0);
    }
  });
  const months = Object.entries(monthlyPnl).sort((a, b) => a[0].localeCompare(b[0]));
  const bestMonth = months.length > 0 ? months.reduce((best, m) => m[1] > best[1] ? m : best) : ["N/A", 0];
  const worstMonth = months.length > 0 ? months.reduce((worst, m) => m[1] < worst[1] ? m : worst) : ["N/A", 0];

  // Equity curve data
  let equityBalance = deposits;
  const equityCurve = [{ date: "Start", balance: deposits }];
  sortedClosed.forEach(t => {
    equityBalance += (t.pnl || 0);
    equityCurve.push({ date: t.date?.substring(0, 10), balance: Math.round(equityBalance * 100) / 100, pnl: t.pnl });
  });

  return {
    totalTrades: actualTrades.length,
    wins: wins.length,
    losses: losses.length,
    breakevens: breakevens.length,
    openTrades: openTrades.length,
    buyTrades,
    sellTrades,
    balance,
    totalPnl,
    grossProfit,
    grossLoss,
    winRate,
    avgWin,
    avgLoss,
    largestWin,
    largestLoss,
    profitFactor,
    expectedValue,
    avgRR,
    maxWinStreak,
    maxLoseStreak,
    maxDrawdown,
    mostUsedStrategy,
    mostUsedPair,
    bestMonth,
    worstMonth,
    monthlyPnl: months,
    equityCurve,
    deposits,
    withdrawals,
  };
};

export const getStrategyStats = (trades) => {
  const actualTrades = trades.filter(t => t.type === "Trade" && t.status !== "Open");
  const strategies = [...new Set(actualTrades.map(t => t.strategy))];
  
  return strategies.map(strategy => {
    const stratTrades = actualTrades.filter(t => t.strategy === strategy);
    const wins = stratTrades.filter(t => t.status === "Win");
    const losses = stratTrades.filter(t => t.status === "Loss");
    const totalPnl = stratTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossLoss = losses.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0);
    const winRate = stratTrades.length > 0 ? (wins.length / stratTrades.length) * 100 : 0;
    const avgRR = stratTrades.length > 0 ? stratTrades.reduce((sum, t) => sum + Math.abs(t.rrActual || 0), 0) / stratTrades.length : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const expectedValue = stratTrades.length > 0 ? totalPnl / stratTrades.length : 0;

    return { strategy, totalTrades: stratTrades.length, wins: wins.length, losses: losses.length, winRate, avgRR, profitFactor, totalPnl, expectedValue, grossProfit, grossLoss };
  });
};

export const getAccountStats = (trades) => {
  const accounts = [...new Set(trades.map(t => t.account))];
  return accounts.map(account => {
    const accTrades = trades.filter(t => t.account === account);
    const actualTrades = accTrades.filter(t => t.type === "Trade" && t.status !== "Open");
    const deposits = accTrades.filter(t => t.type === "Deposit").reduce((sum, t) => sum + (t.amount || 0), 0);
    const withdrawals = accTrades.filter(t => t.type === "Withdrawal").reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalPnl = actualTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const balance = deposits - withdrawals + totalPnl;
    const wins = actualTrades.filter(t => t.status === "Win").length;
    const losses = actualTrades.filter(t => t.status === "Loss").length;
    const winRate = actualTrades.length > 0 ? (wins / actualTrades.length) * 100 : 0;

    const sortedTrades = [...actualTrades].sort((a, b) => new Date(a.date) - new Date(b.date));
    let eq = deposits;
    const equityCurve = [{ date: "Start", balance: deposits }];
    sortedTrades.forEach(t => {
      eq += (t.pnl || 0);
      equityCurve.push({ date: t.date?.substring(0, 10), balance: Math.round(eq * 100) / 100 });
    });

    // Monthly
    const monthlyPnl = {};
    actualTrades.forEach(t => {
      const m = t.date?.substring(0, 7);
      if (m) { monthlyPnl[m] = (monthlyPnl[m] || 0) + (t.pnl || 0); }
    });

    return { account, balance, deposits, withdrawals, totalPnl, wins, losses, winRate, totalTrades: actualTrades.length, equityCurve, monthlyPnl: Object.entries(monthlyPnl).sort((a, b) => a[0].localeCompare(b[0])) };
  });
};
