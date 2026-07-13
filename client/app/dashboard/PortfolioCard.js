import styles from "./dashboard.module.css";

const COIN_SYMBOLS = { bitcoin: "₿", ethereum: "Ξ", solana: "◎" };
const COIN_COLORS  = { bitcoin: "#f7931a", ethereum: "#627eea", solana: "#9945ff" };

export default function PortfolioCard({ portfolio }) {
  if (!portfolio) return null;

  return (
    <div className={styles["card"]} style={{ position: "sticky", top: 24 }}>
      <div className={styles["card-header"]}>
        <span className={styles["card-title"]}>Portfolio</span>
        <span className={styles["card-badge"]}>Live</span>
      </div>
      <div className={styles["portfolio-stats"]}>
        <div className={styles["stat-cell"]}>
          <div className={styles["stat-label"]}>Cash Balance</div>
          <div className={styles["stat-value"]}>
            ₹{Number(portfolio?.balance || 0).toLocaleString("en-IN")}
          </div>
        </div>
        <div className={styles["stat-cell"]}>
          <div className={styles["stat-label"]}>Total Value</div>
          <div className={styles["stat-value"]}>
            ₹{Number(portfolio?.totalPortfolioValue || 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>
      <div className={styles["holdings-list"]}>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text-dim)",
            marginBottom: 4
          }}
        >
          Holdings
        </div>
        {portfolio?.holdings?.length === 0 && (
          <div className={styles["empty-state"]} style={{ padding: "24px 0" }}>
            No holdings
          </div>
        )}

        {portfolio?.holdings?.map((h) => (
          <div key={h.coin} className={styles["holding-row"]}>
            <div className={styles["holding-left"]}>
              <div
                className={styles["coin-icon"]}
                style={{
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  background: `${COIN_COLORS[h.coin] || "#d4af37"}20`,
                  color: COIN_COLORS[h.coin] || "#d4af37",
                  border: `1px solid ${COIN_COLORS[h.coin] || "#d4af37"}35`,
                }}
              >
                {COIN_SYMBOLS[h.coin] || h.coin[0].toUpperCase()}
              </div>
              <div>
                <div className={styles["holding-name"]}>{h.coin}</div>
                <div className={styles["holding-qty"]}>Qty: {h.quantity}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#a89878",
                    marginTop: 3
                  }}
                >
                  Avg Buy: ₹ {Number(h.avgBuyPrice || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className={styles["holding-value"]}>
                ₹ {Number(h.currentValue || 0).toLocaleString("en-IN")}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: h.profitLoss >= 0 ? "#22c55e" : "#ef4444"
                }}
              >
                {h.profitLoss >= 0 ? "+" : ""}
                ₹ {Number(h.profitLoss || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
