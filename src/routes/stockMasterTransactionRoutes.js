
// import express from "express";
// import { refillStock } from "../controllers/stockMasterController.js";

// const router = express.Router();

// // Refill existing stock
// router.post("/:stockId/refill", refillStock);

// export default router;



import express from "express";

import {
  refillStock,
  getAllStockTransactions,
  getStockTransactionsByStockId
} from "../controllers/stockMasterTransactionController.js";

const router = express.Router();

// Refill a particular stock
router.post("/:stockId/refill", refillStock);

// Get all stock transaction history
router.get("/", getAllStockTransactions);

// Get transaction history for one stock
router.get("/:stockId", getStockTransactionsByStockId);

export default router;
