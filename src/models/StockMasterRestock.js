
import mongoose from "mongoose";
import Counter from "./Counter.js";

const stockMasterRestockSchema = new mongoose.Schema(
  {
    restockId: {
      type: String,
      unique: true,
      trim: true,
    },

    stockMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockMaster",
      required: true,
      index: true,
    },

    restockDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    updatedBy: {
      type: String,
      required: true,
      trim: true,
    },

    restockQty: {
      type: Number,
      required: true,
      min: 0.000001,
    },
  },
  { timestamps: true }
);

stockMasterRestockSchema.pre("validate", async function () {
  if (this.restockId) return;

  const counter = await Counter.findByIdAndUpdate(
    "restockId",
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  this.restockId = `RST${String(counter.sequence).padStart(3, "0")}`;
});

const StockMasterRestock = mongoose.model(
  "StockMasterRestock",
  stockMasterRestockSchema
);

export default StockMasterRestock;
