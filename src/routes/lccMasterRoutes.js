
import express from "express";

import {
  getLCCStocks,
  getLCCStockById,
  transferToLCC,
  updateLCCStock,
} from "../controllers/lccMasterController.js";

const router = express.Router();

router.get("/", getLCCStocks);
router.get("/:id", getLCCStockById);

router.post("/", transferToLCC);
router.put("/:id", updateLCCStock);

export default router;
