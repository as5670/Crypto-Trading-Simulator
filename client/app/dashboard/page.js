"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(20,18,14,0.95)",
        border: "1px solid rgba(212,175,55,0.3)",
        borderRadius: 8,
        padding: "10px 16px",
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
        color: "#d4af37",
      }}>
        <p style={{ color: "#a89060", marginBottom: 2, textTransform: "capitalize" }}>{label}</p>
        <p>₹ {Number(payload[0].value).toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
};

const COIN_SYMBOLS = { bitcoin: "₿", ethereum: "Ξ", solana: "◎" };
const COIN_COLORS  = { bitcoin: "#f7931a", ethereum: "#627eea", solana: "#9945ff" };

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --obsidian: #0d0c09; --obsidian-2: #141208; --obsidian-3: #1c1a12;
    --gold: #d4af37; --gold-light: #f0d060;
    --gold-dim: rgba(212,175,55,0.15); --gold-border: rgba(212,175,55,0.25);
    --text-primary: #f5f0e8; --text-secondary: #a89878; --text-dim: #5a5040;
    --green: #22c55e; --red: #ef4444;
    --glass: rgba(255,255,255,0.03); --glass-border: rgba(255,255,255,0.07);
  }
  .dash-root { min-height: 100vh; background: var(--obsidian); color: var(--text-primary); font-family: 'DM Sans', sans-serif; position: relative; overflow-x: hidden; }
  .dash-root::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; opacity: 0.6; }
  .ambient { position: fixed; top: -30vh; left: 50%; transform: translateX(-50%); width: 80vw; height: 60vh; background: radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%); pointer-events: none; z-index: 0; }
  .content { position: relative; z-index: 1; max-width: 1400px; margin: 0 auto; padding: 40px 48px 80px; }
  .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 56px; border-bottom: 1px solid var(--gold-border); padding-bottom: 28px; }
  .header-left { display: flex; flex-direction: column; gap: 4px; }
  .header-eyebrow { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); opacity: 0.7; }
  .header-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; line-height: 1; }
  .header-title span { color: var(--gold); }
  .header-right { display: flex; align-items: center; gap: 20px; }
  .live-badge { display: flex; align-items: center; gap: 7px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em; color: var(--text-secondary); }
  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--green); } 50% { opacity: 0.5; box-shadow: 0 0 3px var(--green); } }
  .btn-logout { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; background: transparent; border: 1px solid var(--gold-border); color: var(--text-secondary); padding: 9px 20px; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
  .btn-logout:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-dim); }
  .ticker-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
  .ticker-card { background: var(--obsidian-3); border: 1px solid var(--glass-border); border-radius: 12px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; transition: border-color 0.2s; }
  .ticker-card:hover { border-color: var(--gold-border); }
  .ticker-left { display: flex; align-items: center; gap: 14px; }
  .coin-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; }
  .ticker-name { font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 14px; text-transform: capitalize; color: var(--text-primary); }
  .ticker-symbol { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-dim); margin-top: 2px; letter-spacing: 0.08em; }
  .ticker-price { font-family: 'DM Mono', monospace; font-size: 17px; font-weight: 500; color: var(--gold-light); letter-spacing: -0.02em; }
  .trade-bar { background: var(--obsidian-3); border: 1px solid var(--glass-border); border-radius: 12px; padding: 24px 28px; display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
  .trade-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-dim); white-space: nowrap; }
  .trade-select { background: var(--obsidian-2); border: 1px solid var(--glass-border); color: var(--text-primary); font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 10px 14px; border-radius: 8px; outline: none; cursor: pointer; transition: border-color 0.2s; min-width: 130px; }
  .trade-select:focus { border-color: var(--gold-border); }
  .trade-input { background: var(--obsidian-2); border: 1px solid var(--glass-border); color: var(--text-primary); font-family: 'DM Mono', monospace; font-size: 14px; padding: 10px 14px; border-radius: 8px; outline: none; width: 140px; transition: border-color 0.2s; }
  .trade-input::placeholder { color: var(--text-dim); }
  .trade-input:focus { border-color: var(--gold-border); }
  .trade-divider { width: 1px; height: 32px; background: var(--glass-border); margin: 0 4px; }
  .btn-buy, .btn-sell { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 500; padding: 11px 28px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s; }
  .btn-buy { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.35); color: var(--green); }
  .btn-buy:hover:not(:disabled) { background: rgba(34,197,94,0.25); box-shadow: 0 0 16px rgba(34,197,94,0.2); }
  .btn-sell { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: var(--red); }
  .btn-sell:hover:not(:disabled) { background: rgba(239,68,68,0.22); box-shadow: 0 0 16px rgba(239,68,68,0.15); }
  .btn-buy:disabled, .btn-sell:disabled { opacity: 0.4; cursor: not-allowed; }
  .main-grid { display: grid; grid-template-columns: 1fr 400px; gap: 28px; align-items: start; }
  .card { background: var(--obsidian-3); border: 1px solid var(--glass-border); border-radius: 16px; overflow: hidden; }
  .card-header { padding: 22px 28px 0; display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 400; color: var(--text-primary); letter-spacing: 0.02em; }
  .card-badge { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); background: var(--gold-dim); border: 1px solid var(--gold-border); padding: 4px 10px; border-radius: 20px; }
  .portfolio-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--glass-border); margin: 20px 28px; border-radius: 10px; overflow: hidden; border: 1px solid var(--glass-border); }
  .stat-cell { background: var(--obsidian-2); padding: 16px 20px; }
  .stat-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px; }
  .stat-value { font-family: 'DM Mono', monospace; font-size: 20px; font-weight: 500; color: var(--gold-light); letter-spacing: -0.03em; }
  .holdings-list { padding: 0 28px 24px; display: flex; flex-direction: column; gap: 10px; }
  .holding-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: var(--obsidian-2); border: 1px solid var(--glass-border); border-radius: 10px; transition: border-color 0.2s; }
  .holding-row:hover { border-color: var(--gold-border); }
  .holding-left { display: flex; align-items: center; gap: 12px; }
  .holding-name { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; text-transform: capitalize; color: var(--text-primary); }
  .holding-qty { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
  .holding-value { font-family: 'DM Mono', monospace; font-size: 14px; color: var(--gold-light); font-weight: 500; }
  .chart-wrap { padding: 20px 16px 24px; }
  .tx-table { width: 100%; border-collapse: collapse; }
  .tx-table thead th { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-dim); padding: 14px 20px; text-align: left; background: var(--obsidian-2); border-bottom: 1px solid var(--glass-border); font-weight: 400; }
  .tx-table tbody tr { border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.15s; }
  .tx-table tbody tr:hover { background: rgba(212,175,55,0.03); }
  .tx-table tbody td { padding: 13px 20px; font-family: 'DM Mono', monospace; font-size: 13px; color: var(--text-secondary); }
  .tx-coin { text-transform: capitalize; color: var(--text-primary) !important; font-weight: 500; }
  .tx-buy { color: var(--green) !important; }
  .tx-sell { color: var(--red) !important; }
  .tx-price { color: var(--gold-light) !important; }
  .tx-time { font-size: 11px; color: var(--text-dim) !important; }
  .coin-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }
  .empty-state { text-align: center; padding: 48px; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.1em; color: var(--text-dim); }
`;

export default function DashboardPage() {
  const [prices, setPrices] = useState({});
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [quantity, setQuantity] = useState("");
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [portfolioHistory, setPortfolioHistory]= useState([]);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
    fetchPrices();
    fetchPortfolio();
    fetchTransactions();
  fetchPortfolioHistory();

  }, []);

  useEffect(() => {
    if (!mounted) return;
    const socket = io("http://localhost:5000");
    socket.on("priceUpdate", (updatedPrices) => {setPrices(updatedPrices); fetchPortfolio()});
    return () => { socket.disconnect(); };
  }, [mounted]);

  const fetchPrices = async () => {
    try {
      const res = await fetch("http://localhost:5000/prices");
      setPrices(await res.json());
    } catch (e) { console.log(e); }
  };

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/portfolio", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPortfolio(await res.json());
    } catch (e) { console.log(e); }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/transactions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransactions(data.transactions);
    } catch (e) { console.log(e); }
  };
const fetchPortfolioHistory =
  async () => {

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          "http://localhost:5000/portfolio-history",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await response.json();

      setPortfolioHistory(
        data.history || []
      );

    } catch (error) {

      console.log(error);

    }

  };
  const handleBuy = async () => {
    if (!quantity || Number(quantity) <= 0) return alert("Enter valid quantity");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ coin: selectedCoin, quantity: Number(quantity) })
      });
      const data = await res.json();
      alert(data.message);
      fetchPortfolio(); fetchTransactions();
        fetchPortfolioHistory();

    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const handleSell = async () => {
    if (!quantity || Number(quantity) <= 0) return alert("Enter valid quantity");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ coin: selectedCoin, quantity: Number(quantity) })
      });
      const data = await res.json();
      alert(data.message);
      fetchPortfolio(); fetchTransactions();  fetchPortfolioHistory();

    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const chartData = Object.entries(prices || {}).map(([coin, data]) => ({
    coin: coin.charAt(0).toUpperCase() + coin.slice(1),
    price: data.inr
  }));
const portfolioChartData =
  portfolioHistory.map(
    (item) => ({

      date:
        new Date(
          item.createdAt
        ).toLocaleDateString([], {
    hour: "2-digit",
    minute: "2-digit"
  }),

      value:
        item.value

    })
  );
  if (!mounted) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="dash-root">
        <div className="ambient" />
        <div className="content">

          <header className="header">
            <div className="header-left">
              <span className="header-eyebrow">Private Wealth · Digital Assets</span>
              <h1 className="header-title">Crypto <span>Desk</span></h1>
            </div>
            <div className="header-right">
              <div className="live-badge">
                <span className="live-dot" />
                Live Market
              </div>
              <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
            </div>
          </header>

          <div className="ticker-strip">
            {Object.entries(prices || {}).map(([coin, data]) => (
              <div key={coin} className="ticker-card">
                <div className="ticker-left">
                  <div className="coin-icon" style={{
                    background: `${COIN_COLORS[coin] || "#d4af37"}22`,
                    color: COIN_COLORS[coin] || "#d4af37",
                    border: `1px solid ${COIN_COLORS[coin] || "#d4af37"}44`,
                  }}>
                    {COIN_SYMBOLS[coin] || coin[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="ticker-name">{coin}</div>
                    <div className="ticker-symbol">{coin.slice(0, 3).toUpperCase()} · INR</div>
                  </div>
                </div>
                <div className="ticker-price">
                  ₹{Number(data?.inr || 0).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          <div className="trade-bar">
            <span className="trade-label">Execute Trade</span>
            <select className="trade-select" value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)}>
              <option value="bitcoin">Bitcoin</option>
              <option value="ethereum">Ethereum</option>
              <option value="solana">Solana</option>
            </select>
            <input
              type="number"
              placeholder="Quantity"
              className="trade-input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <div className="trade-divider" />
            <button className="btn-buy" onClick={handleBuy} disabled={loading}>
              {loading ? "···" : "Buy"}
            </button>
            <button className="btn-sell" onClick={handleSell} disabled={loading}>
              {loading ? "···" : "Sell"}
            </button>
          </div>

          <div className="main-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

              <div className="card">
                <div className="card-header">
                  <span className="card-title"> Portfolio Performance</span>
                  <span className="card-badge">Real-time</span>
                </div>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={portfolioChartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: "#5a5040", fontFamily: "DM Mono", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.07)" }} tickLine={false} />
                      <YAxis tick={{ fill: "#5a5040", fontFamily: "DM Mono", fontSize: 11 }} axisLine={false} tickLine={false} width={80} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={2}
                        dot={{ r: 5, fill: "#0d0c09", stroke: "#d4af37", strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: "#d4af37", stroke: "#f0d060", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="card-header" style={{ paddingBottom: 0 }}>
                  <span className="card-title">Transaction History</span>
                </div>
                <div style={{ padding: "20px 0 0" }}>
                  {(!transactions || transactions.length === 0) ? (
                    <div className="empty-state">No transactions yet</div>
                  ) : (
                    <table className="tx-table">
                      <thead>
                        <tr>
                          <th>Asset</th><th>Type</th><th>Qty</th><th>Price</th><th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td className="tx-coin">
                              <span className="coin-dot" style={{ background: COIN_COLORS[tx.coin] || "#d4af37" }} />
                              {tx.coin}
                            </td>
                            <td className={tx.type === "buy" ? "tx-buy" : "tx-sell"}>{tx.type.toUpperCase()}</td>
                            <td>{tx.quantity}</td>
                            <td className="tx-price">₹{Number(tx.price).toLocaleString("en-IN")}</td>
                            <td className="tx-time">
                              {new Date(tx.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {portfolio && (
              <div className="card" style={{ position: "sticky", top: 24 }}>
                <div className="card-header">
                  <span className="card-title">Portfolio</span>
                  <span className="card-badge">Live</span>
                </div>
                <div className="portfolio-stats">
                  <div className="stat-cell">
                    <div className="stat-label">Cash Balance</div>
                    <div className="stat-value">₹{Number(portfolio?.balance || 0).toLocaleString("en-IN")}</div>
                  </div>
                  <div className="stat-cell">
                    <div className="stat-label">Total Value</div>
                    <div className="stat-value">₹{Number(portfolio?.totalPortfolioValue || 0).toLocaleString("en-IN")}</div>
                  </div>
                </div>
                <div className="holdings-list">
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 4 }}>
                    Holdings
                  </div>
                  {portfolio?.holdings?.length === 0 && (
                    <div className="empty-state" style={{ padding: "24px 0" }}>No holdings</div>
                  )}
                  
                  
                  {portfolio?.holdings?.map((h) => (

  <div
    key={h.coin}
    className="holding-row"
  >

    <div className="holding-left">

      <div
        className="coin-icon"
        style={{
          width: 32,
          height: 32,
          fontSize: 14,
          background: `${COIN_COLORS[h.coin] || "#d4af37"}20`,
          color: COIN_COLORS[h.coin] || "#d4af37",
          border: `1px solid ${
            COIN_COLORS[h.coin] || "#d4af37"
          }35`,
        }}
      >

        {COIN_SYMBOLS[h.coin] ||
          h.coin[0].toUpperCase()}

      </div>

      <div>

        <div className="holding-name">

          {h.coin}

        </div>

        <div className="holding-qty">

          Qty: {h.quantity}

        </div>

        <div
          style={{
            fontSize: 11,
            color: "#a89878",
            marginTop: 3
          }}
        >

          Avg Buy:
          ₹ {Number(
            h.avgBuyPrice || 0
          ).toLocaleString("en-IN")}

        </div>

      </div>

    </div>

    <div style={{ textAlign: "right" }}>

      <div className="holding-value">

        ₹ {Number(
          h.currentValue || 0
        ).toLocaleString("en-IN")}

      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          fontWeight: 600,
          color:
            h.profitLoss >= 0
              ? "#22c55e"
              : "#ef4444"
        }}
      >

        {h.profitLoss >= 0
          ? "+"
          : ""}

        ₹ {Number(
          h.profitLoss || 0
        ).toLocaleString("en-IN")}

      </div>

    </div>

  </div>

))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}