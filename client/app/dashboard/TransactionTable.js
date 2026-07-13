import styles from "./dashboard.module.css";

const COIN_COLORS = { bitcoin: "#f7931a", ethereum: "#627eea", solana: "#9945ff" };

export default function TransactionTable({ transactions }) {
  return (
    <div className={styles["card"]}>
      <div className={styles["card-header"]} style={{ paddingBottom: 0 }}>
        <span className={styles["card-title"]}>Transaction History</span>
      </div>
      <div style={{ padding: "20px 0 0" }}>
        {!transactions || transactions.length === 0 ? (
          <div className={styles["empty-state"]}>No transactions yet</div>
        ) : (
          <table className={styles["tx-table"]}>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className={styles["tx-coin"]}>
                    <span
                      className={styles["coin-dot"]}
                      style={{ background: COIN_COLORS[tx.coin] || "#d4af37" }}
                    />
                    {tx.coin}
                  </td>
                  <td className={tx.type === "BUY" ? styles["tx-buy"] : styles["tx-sell"]}>
                    {tx.type.toUpperCase()}
                  </td>
                  <td>{tx.quantity}</td>
                  <td className={styles["tx-price"]}>
                    ₹{Number(tx.price).toLocaleString("en-IN")}
                  </td>
                  <td className={styles["tx-time"]}>
                    {new Date(tx.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
