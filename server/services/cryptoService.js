const axios = require("axios");

let cachedPrices = {};

const fetchCryptoPrices = async () => {

  if (
    Object.keys(cachedPrices).length > 0
  ) {

    return cachedPrices;
  }

  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=inr"
  );

  cachedPrices = response.data;

  setTimeout(() => {

    cachedPrices = {};

  }, 10000);

  return cachedPrices;
};

module.exports = {
  fetchCryptoPrices
};