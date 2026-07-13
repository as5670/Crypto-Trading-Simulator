import styles from "./dashboard.module.css";

export default function TradeBar({
  selectedCoin,
  setSelectedCoin,
  quantity,
  setQuantity,
  handleBuy,
  handleSell,
  loading
}) {
  return (
    <div className={styles["trade-bar"]}>
      <span className={styles["trade-label"]}>Execute Trade</span>
      <select
        className={styles["trade-select"]}
        value={selectedCoin}
        onChange={(e) => setSelectedCoin(e.target.value)}
      >
        <option value="bitcoin">Bitcoin</option>
        <option value="ethereum">Ethereum</option>
        <option value="solana">Solana</option>
      </select>
      <input
        type="number"
        placeholder="Quantity"
        className={styles["trade-input"]}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <div className={styles["trade-divider"]} />
      <button
        className={styles["btn-buy"]}
        onClick={handleBuy}
        disabled={loading}
      >
        {loading ? "···" : "Buy"}
      </button>
      <button
        className={styles["btn-sell"]}
        onClick={handleSell}
        disabled={loading}
      >
        {loading ? "···" : "Sell"}
      </button>
    </div>
  );
}
