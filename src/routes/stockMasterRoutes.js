import express from "express";

import {
  updateStock,
  createStock,
  getStocks,
  restockStock,
} from "../controllers/stockMasterController.js";

const router = express.Router();

router.get("/", getStocks);

router.post("/create", createStock);

router.put("/update/:id", updateStock);

router.post("/restock/:id", restockStock);

export default router;