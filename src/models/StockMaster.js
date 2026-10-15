import mongoose from "mongoose";

const stockMasterSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    receivedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    yourName: {
      type: String,
      required: true,
      trim: true,
    },

    totalQty: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceQty: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const StockMaster = mongoose.model(
  "StockMaster",
  stockMasterSchema
);

export default StockMaster;