"use client";

import useCrypto from "./useCrypto";
import TickerStrip from "./TickerStrip";
import TradeBar from "./TradeBar";
import PortfolioCard from "./PortfolioCard";
import TransactionTable from "./TransactionTable";
import styles from "./dashboard.module.css";
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
      <div
        style={{
          background: "rgba(20,18,14,0.95)",
          border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: 8,
          padding: "10px 16px",
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          color: "#d4af37",
        }}
      >
        <p style={{ color: "#a89060", marginBottom: 2, textTransform: "capitalize" }}>
          {label}
        </p>
        <p>₹ {Number(payload[0].value).toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const {
    prices,
    selectedCoin,
    setSelectedCoin,
    quantity,
    setQuantity,
    portfolio,
    transactions,
    loading,
    mounted,
    portfolioChartData,
    handleBuy,
    handleSell,
    handleLogout
  } = useCrypto();

  if (!mounted) return null;

  return (
    <div className={styles["dash-root"]}>
      <div className={styles["ambient"]} />
      <div className={styles["content"]}>
        <header className={styles["header"]}>
          <div className={styles["header-left"]}>
            <span className={styles["header-eyebrow"]}>
              Private Wealth · Digital Assets
            </span>
            <h1 className={styles["header-title"]}>
              Crypto <span>Desk</span>
            </h1>
          </div>
          <div className={styles["header-right"]}>
            <div className={styles["live-badge"]}>
              <span className={styles["live-dot"]} />
              Live Market
            </div>
            <button className={styles["btn-logout"]} onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </header>

        <TickerStrip prices={prices} />

        <TradeBar
          selectedCoin={selectedCoin}
          setSelectedCoin={setSelectedCoin}
          quantity={quantity}
          setQuantity={setQuantity}
          handleBuy={handleBuy}
          handleSell={handleSell}
          loading={loading}
        />

        <div className={styles["main-grid"]}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div className={styles["card"]}>
              <div className={styles["card-header"]}>
                <span className={styles["card-title"]}>Portfolio Performance</span>
                <span className={styles["card-badge"]}>Real-time</span>
              </div>
              <div className={styles["chart-wrap"]}>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={portfolioChartData}
                    margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#5a5040", fontFamily: "DM Mono", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.07)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#5a5040", fontFamily: "DM Mono", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#d4af37"
                      strokeWidth={2}
                      dot={{ r: 5, fill: "#0d0c09", stroke: "#d4af37", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#d4af37", stroke: "#f0d060", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <TransactionTable transactions={transactions} />
          </div>

          <PortfolioCard portfolio={portfolio} />
        </div>
      </div>
    </div>
  );
}