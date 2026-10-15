
import mongoose from "mongoose";

const lccMasterSchema = new mongoose.Schema(
  {
    lccId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    productMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockMaster",
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
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
      default: "LCC Building",
    },
    totalQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    balanceQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

// Same product cannot have duplicate LCC records
// for the same location.
lccMasterSchema.index(
  { productId: 1, location: 1 },
  { unique: true }
);

const LCCMaster = mongoose.model(
  "LCCMaster",
  lccMasterSchema
);

export default LCCMaster;
