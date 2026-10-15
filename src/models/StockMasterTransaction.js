
import mongoose from "mongoose";

const stockMasterTransactionSchema = new mongoose.Schema(
  {
    stockMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockMaster",
      required: true,
      index: true,
    },

    lccMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LCCMaster",
      required: false,
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

    location: {
      type: String,
      required: true,
      trim: true,
    },

    sourceLocation: {
      type: String,
      trim: true,
    },

    destinationLocation: {
      type: String,
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
