const cors = require("cors");
require("dotenv").config();

const express = require("express");

const http = require("http");

const { Server } = require("socket.io");

const socketHandler = require("./sockets/socketHandler");

const cryptoRoutes = require("./routes/cryptoRoutes");

const authRoutes = require("./routes/authRoutes");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

socketHandler(io);
app.use(cors());
app.use(express.json());

app.use("/", cryptoRoutes);

app.use("/", authRoutes);

server.listen(5000, () => {
  console.log("Server running on port 5000");
});