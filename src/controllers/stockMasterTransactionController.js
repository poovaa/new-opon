
import StockMaster from "../models/StockMaster.js";
import StockMasterTransaction from "../models/StockMasterTransaction.js";

// 1. Refill existing stock
export const refillStock = async (req, res) => {
  try {
    const { quantity, location, updatedBy } = req.body;
    const { stockId } = req.params;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    if (!location || !updatedBy) {
      return res.status(400).json({
        message: "Location and updatedBy are required"
      });
    }

    const stock = await StockMaster.findOne({ stockId });

    if (!stock) {
      return res.status(404).json({
        message: "Stock not found"
      });
    }

    // Update stock quantities
    stock.totalQty += quantity;
    stock.balanceQty += quantity;

    await stock.save();

    // Save a new history record for every refill
    const transaction = await StockMasterTransaction.create({
      stockMasterId: stock._id,
      qty: quantity,
      assignDate: new Date(),
      location,
      updatedBy,
      balanceAfter: stock.balanceQty
    });

    return res.status(201).json({
      message: "Stock refilled successfully",
      stock,
      transaction
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


// 2. Get all stock transactions
export const getAllStockTransactions = async (req, res) => {
  try {
    const transactions = await StockMasterTransaction.find()
      .populate("stockMasterId", "stockId stockName")
      .sort({ assignDate: -1 });

    return res.status(200).json({
      count: transactions.length,
      transactions
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


// 3. Get transactions for one stock
export const getStockTransactionsByStockId = async (req, res) => {
  try {
    const stock = await StockMaster.findOne({
      stockId: req.params.stockId
    });

    if (!stock) {
      return res.status(404).json({
        message: "Stock not found"
      });
    }

    const transactions = await StockMasterTransaction.find({
      stockMasterId: stock._id
    }).sort({ assignDate: -1 });

    return res.status(200).json({
      stockId: stock.stockId,
      stockName: stock.stockName,
      count: transactions.length,
      transactions
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
