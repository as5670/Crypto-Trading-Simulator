const axios = require("axios");

let cachedPrices = {};

const BASE_PRICES = {
  bitcoin: 8100000,
  ethereum: 300000,
  solana: 12000
};

let currentMockPrices = {
  bitcoin: { inr: BASE_PRICES.bitcoin },
  ethereum: { inr: BASE_PRICES.ethereum },
  solana: { inr: BASE_PRICES.solana }
};

const getFluctuatedMockPrices = () => {
  // Apply a small random fluctuation (-0.1% to +0.1%) to make the mock prices feel "live"
  for (const coin in currentMockPrices) {
    const changePercent = (Math.random() - 0.5) * 0.002;
    currentMockPrices[coin].inr = Math.round(currentMockPrices[coin].inr * (1 + changePercent));
  }
  return currentMockPrices;
};

const fetchCryptoPrices = async () => {
  try {
    // If we already have fresh cached prices, use them
    if (Object.keys(cachedPrices).length > 0) {
      return cachedPrices;
    }

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=inr",
      { timeout: 5000 }
    );

    if (response.data && response.data.bitcoin && response.data.ethereum && response.data.solana) {
      cachedPrices = response.data;
      
      // Clear cache after 10 seconds to fetch fresh prices on next call
      setTimeout(() => {
        cachedPrices = {};
      }, 10000);

      return response.data;
    }
  } catch (error) {
    console.warn("CoinGecko API error, using fallback prices:", error.message);
  }

  // Fallback chain: cached prices -> fluctuated mock prices
  if (Object.keys(cachedPrices).length > 0) {
    return cachedPrices;
  }
  return getFluctuatedMockPrices();
};

module.exports = {
  fetchCryptoPrices
};