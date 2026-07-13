const prisma = require("../config/db");

const {
  fetchCryptoPrices
} = require("../services/cryptoService");

const getPrices = async (req, res) => {

  try {

    const prices = await fetchCryptoPrices();

    res.json(prices);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error fetching prices"
    });
  }
};

const buyCrypto = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { coin, quantity } = req.body;

    const ALLOWED_COINS = ["bitcoin", "ethereum", "solana"];
    if (!coin || !ALLOWED_COINS.includes(coin.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid coin. Supported coins are bitcoin, ethereum, solana."
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid quantity"
      });
    }

    const coinLower = coin.toLowerCase();
    const prices = await fetchCryptoPrices();
    const coinPrice = prices[coinLower].inr;
    const totalCost = coinPrice * quantity;

    // Fetch user and existing holdings
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const userBalance = Number(user.balance);
    if (userBalance < totalCost) {
      return res.status(400).json({
        message: "Insufficient balance"
      });
    }

    const existingHolding = await prisma.holding.findUnique({
      where: {
        userId_coin: {
          userId,
          coin: coinLower
        }
      }
    });

    // Calculate new holding avgBuyPrice and quantity
    const existingQty = existingHolding ? existingHolding.quantity : 0;
    const existingAvgBuy = existingHolding ? Number(existingHolding.avgBuyPrice) : 0;
    const newQuantity = existingQty + quantity;
    const newAvgBuyPrice = (existingQty * existingAvgBuy + quantity * coinPrice) / newQuantity;

    // Calculate current portfolio value from all holdings (excluding balance)
    const holdings = await prisma.holding.findMany({
      where: { userId }
    });

    let currentPortfolioValue = 0;
    holdings.forEach((h) => {
      currentPortfolioValue += h.quantity * prices[h.coin].inr;
    });

    const newPortfolioValue = currentPortfolioValue + totalCost;

    // Run transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: userBalance - totalCost }
      }),
      prisma.holding.upsert({
        where: {
          userId_coin: {
            userId,
            coin: coinLower
          }
        },
        update: {
          quantity: newQuantity,
          avgBuyPrice: newAvgBuyPrice
        },
        create: {
          userId,
          coin: coinLower,
          quantity,
          avgBuyPrice: coinPrice
        }
      }),
      prisma.transaction.create({
        data: {
          userId,
          coin: coinLower,
          quantity,
          price: coinPrice,
          type: "BUY"
        }
      }),
      prisma.portfolioSnapshot.create({
        data: {
          userId,
          value: newPortfolioValue
        }
      })
    ]);

    res.json({
      message: "Crypto purchased successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

const sellCrypto = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { coin, quantity } = req.body;

    const ALLOWED_COINS = ["bitcoin", "ethereum", "solana"];
    if (!coin || !ALLOWED_COINS.includes(coin.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid coin. Supported coins are bitcoin, ethereum, solana."
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid quantity"
      });
    }

    const coinLower = coin.toLowerCase();
    const prices = await fetchCryptoPrices();
    const coinPrice = prices[coinLower].inr;
    const totalAmount = coinPrice * quantity;

    // Fetch user and existing holding
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const existingHolding = await prisma.holding.findUnique({
      where: {
        userId_coin: {
          userId,
          coin: coinLower
        }
      }
    });

    if (!existingHolding) {
      return res.status(404).json({
        message: "You do not own this coin"
      });
    }

    if (existingHolding.quantity < quantity) {
      return res.status(400).json({
        message: "Not enough quantity to sell"
      });
    }

    const remainingQuantity = parseFloat(
      (existingHolding.quantity - quantity).toFixed(8)
    );

    // Calculate current portfolio value from all holdings
    const holdings = await prisma.holding.findMany({
      where: { userId }
    });

    let currentPortfolioValue = 0;
    holdings.forEach((h) => {
      currentPortfolioValue += h.quantity * prices[h.coin].inr;
    });

    const newPortfolioValue = currentPortfolioValue - totalAmount;
    const userBalance = Number(user.balance);

    const operations = [
      prisma.user.update({
        where: { id: userId },
        data: { balance: userBalance + totalAmount }
      }),
      remainingQuantity <= 0
        ? prisma.holding.delete({
            where: {
              userId_coin: {
                userId,
                coin: coinLower
              }
            }
          })
        : prisma.holding.update({
            where: {
              userId_coin: {
                userId,
                coin: coinLower
              }
            },
            data: {
              quantity: remainingQuantity
            }
          }),
      prisma.transaction.create({
        data: {
          userId,
          coin: coinLower,
          quantity,
          price: coinPrice,
          type: "SELL"
        }
      }),
      prisma.portfolioSnapshot.create({
        data: {
          userId,
          value: newPortfolioValue
        }
      })
    ];

    await prisma.$transaction(operations);

    res.json({
      message: "Crypto sold successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.userId;

    const holdings = await prisma.holding.findMany({
      where: {
        userId
      }
    });

    const prices = await fetchCryptoPrices();
    let totalPortfolioValue = 0;

    const portfolio = holdings.map((holding) => {
      const currentPrice = prices[holding.coin].inr;
      const currentValue = currentPrice * holding.quantity;
      const investedValue = Number(holding.avgBuyPrice) * holding.quantity;
      const profitLoss = currentValue - investedValue;
      totalPortfolioValue += currentValue;

      return {
        coin: holding.coin,
        quantity: holding.quantity,
        avgBuyPrice: Number(holding.avgBuyPrice),
        currentPrice,
        investedValue,
        currentValue,
        profitLoss
      };
    });

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    res.json({
      balance: Number(user.balance),
      totalPortfolioValue,
      holdings: portfolio
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const formattedTransactions = transactions.map((tx) => ({
      ...tx,
      price: Number(tx.price)
    }));

    res.json({
      transactions: formattedTransactions
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

const getPortfolioHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const history = await prisma.portfolioSnapshot.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    const formattedHistory = history.map((item) => ({
      ...item,
      value: Number(item.value)
    }));

    res.json({
      history: formattedHistory
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};
module.exports = {
  getPrices,
  buyCrypto,
  sellCrypto,
  getPortfolio,
  getTransactions,
  getPortfolioHistory
};