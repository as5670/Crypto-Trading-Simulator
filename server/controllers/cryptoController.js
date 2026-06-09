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

    const prices = await fetchCryptoPrices();

    const coinPrice = prices[coin].inr;

    const totalCost = coinPrice * quantity;

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (user.balance < totalCost) {

      return res.status(400).json({
        message: "Insufficient balance"
      });
    }

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        balance: user.balance - totalCost
      }
    });

    const existingHolding = await prisma.holding.findFirst({
      where: {
        userId,
        coin
      }
    });

    if (existingHolding) {

  const totalOldInvestment =
    existingHolding.quantity *
    existingHolding.avgBuyPrice;

  const totalNewInvestment =
    quantity * coinPrice;

  const newQuantity =
    existingHolding.quantity + quantity;

  const newAvgBuyPrice =
    (
      totalOldInvestment +
      totalNewInvestment
    ) / newQuantity;

  await prisma.holding.update({

    where: {
      id: existingHolding.id
    },

    data: {

      quantity: newQuantity,

      avgBuyPrice: newAvgBuyPrice
    }

  });

} else {

  await prisma.holding.create({

    data: {

      coin,

      quantity,

      avgBuyPrice: coinPrice,

      userId
    }

  });
}

    await prisma.transaction.create({
      data: {
        coin,
        quantity,
        price: coinPrice,
        type: "BUY",
        userId
      }
    });
    const updatedHoldings =
  await prisma.holding.findMany({
    where: {
      userId
    }
  });

const updatedPrices =
  await fetchCryptoPrices();

let portfolioValue = 0;

updatedHoldings.forEach((holding) => {

  portfolioValue +=
    holding.quantity *
    updatedPrices[holding.coin].inr;

});

await prisma.portfolioSnapshot.create({

  data: {

    userId,

    value: portfolioValue

  }

});

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

    const holding = await prisma.holding.findFirst({
      where: {
        userId,
        coin
      }
    });

    if (!holding) {

      return res.status(404).json({
        message: "You do not own this coin"
      });
    }

    if (holding.quantity < quantity) {

      return res.status(400).json({
        message: "Not enough quantity to sell"
      });
    }

    const prices = await fetchCryptoPrices();

    const coinPrice = prices[coin].inr;

    const totalAmount = coinPrice * quantity;

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        balance: user.balance + totalAmount
      }
    });

    const remainingQuantity =
  parseFloat(
    (holding.quantity - quantity).toFixed(8)
  );

    if (remainingQuantity <= 0) {
console.log(holding);
      await prisma.holding.delete({
        where: {
          id: holding.id
        }
      });

    } else {

      await prisma.holding.update({
        where: {
          id: holding.id
        },
        data: {
          quantity: remainingQuantity
        }
      });
    }

    await prisma.transaction.create({
      data: {
        coin,
        quantity,
        price: coinPrice,
        type: "SELL",
        userId
      }
    });
const updatedHoldings =
  await prisma.holding.findMany({
    where: {
      userId
    }
  });

const updatedPrices =
  await fetchCryptoPrices();

let portfolioValue = 0;

updatedHoldings.forEach((holding) => {

  portfolioValue +=
    holding.quantity *
    updatedPrices[holding.coin].inr;

});

await prisma.portfolioSnapshot.create({

  data: {

    userId,

    value: portfolioValue

  }

});
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

      const currentPrice =
        prices[holding.coin].inr;

      const currentValue =
        currentPrice * holding.quantity;
const investedValue =holding.avgBuyPrice *holding.quantity;

  const profitLoss =currentValue -investedValue;
      totalPortfolioValue += currentValue;

      return {
        coin: holding.coin,

    quantity: holding.quantity,

    avgBuyPrice:
      holding.avgBuyPrice,

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
      balance: user.balance,
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

    const transactions =
      await prisma.transaction.findMany({

        where: {
          userId
        },

        orderBy: {
          createdAt: "desc"
        }
      });

    res.json({
      transactions
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
const getPortfolioHistory = async (
  req,
  res
) => {

  try {

    const userId =
      req.user.userId;

    const history =
      await prisma.portfolioSnapshot.findMany({

        where: {
          userId
        },

        orderBy: {
          createdAt: "asc"
        }

      });

    res.json({
      history
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