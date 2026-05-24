const express = require("express");

const router = express.Router();

const {
  getPrices,
  buyCrypto,
  sellCrypto,
  getPortfolio,
  getTransactions
} = require("../controllers/cryptoController");
const authMiddleware = require("../middleware/authMiddleware");
router.get("/prices", getPrices);

router.post(
  "/buy",
  authMiddleware,
  buyCrypto
);
router.post(
  "/sell",
  authMiddleware,
  sellCrypto
);
router.get(
  "/portfolio",
  authMiddleware,
  getPortfolio
);
router.get(
  "/transactions",
  authMiddleware,
  getTransactions
);
module.exports = router;