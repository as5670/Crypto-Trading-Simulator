import styles from "./dashboard.module.css";

const COIN_SYMBOLS = { bitcoin: "₿", ethereum: "Ξ", solana: "◎" };
const COIN_COLORS  = { bitcoin: "#f7931a", ethereum: "#627eea", solana: "#9945ff" };

export default function TickerStrip({ prices }) {
  return (
    <div className={styles["ticker-strip"]}>
      {Object.entries(prices || {}).map(([coin, data]) => (
        <div key={coin} className={styles["ticker-card"]}>
          <div className={styles["ticker-left"]}>
            <div
              className={styles["coin-icon"]}
              style={{
                background: `${COIN_COLORS[coin] || "#d4af37"}22`,
                color: COIN_COLORS[coin] || "#d4af37",
                border: `1px solid ${COIN_COLORS[coin] || "#d4af37"}44`,
              }}
            >
              {COIN_SYMBOLS[coin] || coin[0].toUpperCase()}
            </div>
            <div>
              <div className={styles["ticker-name"]}>{coin}</div>
              <div className={styles["ticker-symbol"]}>
                {coin.slice(0, 3).toUpperCase()} · INR
              </div>
            </div>
          </div>
          <div className={styles["ticker-price"]}>
            ₹{Number(data?.inr || 0).toLocaleString("en-IN")}
          </div>
        </div>
      ))}
    </div>
  );
}
