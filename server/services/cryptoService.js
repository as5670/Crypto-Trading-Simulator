const axios = require("axios");

const fetchCryptoPrices = async () => {

  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=inr"
  );

  return response.data;
};

module.exports = {
  fetchCryptoPrices
};