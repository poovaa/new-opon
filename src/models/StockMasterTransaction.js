
import mongoose from "mongoose";

const stockMasterTransactionSchema = new mongoose.Schema(
  {
    stockMasterId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    lccMasterId: {
      type: String,
      required: false,
      trim: true,
    },

    transactionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    qty: {
      type: Number,
      required: true,
      min: 1,
    },

    assignDate: {
      type: Date,
      default: Date.now,
    },

    sourceLocation: {
      type: String,
      required: true,
      trim: true,
    },

    destinationLocation: {
      type: String,
      required: true,
      trim: true,
    },

    updatedBy: {
      type: String,
      required: true,
      trim: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const StockMasterTransaction = mongoose.model(
  "StockMasterTransaction",
  stockMasterTransactionSchema
);

export default StockMasterTransaction;
