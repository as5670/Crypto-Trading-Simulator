const axios = require("axios");

let cachedPrices = {};

const MOCK_PRICES = {
  bitcoin: { inr: 8100000 },
  ethereum: { inr: 300000 },
  solana: { inr: 12000 }
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

  // Fallback chain: cached prices -> mock prices
  if (Object.keys(cachedPrices).length > 0) {
    return cachedPrices;
  }
  return MOCK_PRICES;
};

module.exports = {
  fetchCryptoPrices
};