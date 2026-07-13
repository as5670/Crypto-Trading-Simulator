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

const allowedOrigins = [
  "http://localhost:3000",
  "https://crypto-trading-simulator-psi.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const clientUrl = process.env.CLIENT_URL;
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith(".vercel.app") ||
                      (clientUrl && origin === clientUrl.replace(/\/$/, ""));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false); // Block other origins safely without crashing
    }
  },
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

socketHandler(io);
app.use(cors(corsOptions));
app.use(express.json());

app.use("/", cryptoRoutes);

app.use("/", authRoutes);

server.listen(5000, () => {
  console.log("Server running on port 5000");
});