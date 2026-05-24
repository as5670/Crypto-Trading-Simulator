const {
  fetchCryptoPrices
} = require("../services/cryptoService");

const socketHandler = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {

      console.log("User disconnected");
    });
  });

  setInterval(async () => {

    try {

      const prices = await fetchCryptoPrices();

      io.emit("priceUpdate", prices);

    } catch (error) {

      console.log(error);
    }

  }, 5000);
};

module.exports = socketHandler;