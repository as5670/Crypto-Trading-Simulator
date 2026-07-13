import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function useCrypto() {
  const [prices, setPrices] = useState({});
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [quantity, setQuantity] = useState("");
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [portfolioHistory, setPortfolioHistory] = useState([]);

  useEffect(() => {
    setMounted(true);
    const loggedIn = localStorage.getItem("loggedIn");
    if (!loggedIn) {
      window.location.href = "/login";
      return;
    }
    fetchPrices();
    fetchPortfolio();
    fetchTransactions();
    fetchPortfolioHistory();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      withCredentials: true
    });
    socket.on("priceUpdate", (updatedPrices) => {
      setPrices(updatedPrices);
      fetchPortfolio();
      fetchPortfolioHistory();
    });
    return () => { socket.disconnect(); };
  }, [mounted]);

  const fetchPrices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prices`);
      if (res.ok) {
        setPrices(await res.json());
      }
    } catch (e) { console.log(e); }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio`, {
        credentials: "include"
      });
      if (res.status === 401) {
        localStorage.removeItem("loggedIn");
        window.location.href = "/login";
        return;
      }
      if (res.ok) {
        setPortfolio(await res.json());
      }
    } catch (e) { console.log(e); }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        credentials: "include"
      });
      if (res.status === 401) {
        localStorage.removeItem("loggedIn");
        window.location.href = "/login";
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (e) { console.log(e); }
  };

  const fetchPortfolioHistory = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio-history`, {
        credentials: "include"
      });
      if (res.status === 401) {
        localStorage.removeItem("loggedIn");
        window.location.href = "/login";
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPortfolioHistory(data.history || []);
      }
    } catch (error) { console.log(error); }
  };

  const handleBuy = async () => {
    if (!quantity || Number(quantity) <= 0) return alert("Enter valid quantity");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin: selectedCoin, quantity: Number(quantity) }),
        credentials: "include"
      });
      
      const data = await res.json();
      alert(data.message);
      
      if (res.ok) {
        fetchPortfolio();
        fetchTransactions();
        fetchPortfolioHistory();
        setQuantity("");
      }
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const handleSell = async () => {
    if (!quantity || Number(quantity) <= 0) return alert("Enter valid quantity");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin: selectedCoin, quantity: Number(quantity) }),
        credentials: "include"
      });
      
      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        fetchPortfolio();
        fetchTransactions();
        fetchPortfolioHistory();
        setQuantity("");
      }
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (e) { console.log(e); }
    localStorage.removeItem("loggedIn");
    window.location.href = "/login";
  };

  const portfolioChartData = portfolioHistory.map((item) => ({
    date: new Date(item.createdAt).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }),
    value: item.value
  }));

  return {
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
  };
}
