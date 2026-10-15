
import mongoose from "mongoose";
import StockMaster from "../models/StockMaster.js";
import LCCMaster from "../models/LCCMaster.js";
import StockMasterTransaction from "../models/StockMasterTransaction.js";

// GET /api/lccmaster
export const getLCCStocks = async (req, res) => {
  try {
    const data = await LCCMaster.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/lccmaster/:id
export const getLCCStockById = async (req, res) => {
  try {
    const item = await LCCMaster.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "LCC product not found",
      });
    }

    return res.status(200).json({ data: item });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// POST /api/lccmaster
// Transfer quantity from Product Master to LCC.
export const transferToLCC = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      productId,
      lccId,
      qty,
      location = "LCC Building",
      updatedBy,
      transactionDate,
    } = req.body;

    const quantity = Number(qty);

    // if (
    //   !productId ||
    //   !lccId ||
    //   !Number.isInteger(quantity) ||
    //   quantity <= 0 ||
    //   !location.trim() ||
    //   !updatedBy?.trim()
    // ) {
    //   return res.status(400).json({
    //     message:
    //       "productId, lccId, positive qty, location and updatedBy are required",
    //   });
    // }

    if (
  typeof productId !== "string" ||
  !productId.trim() ||
  typeof lccId !== "string" ||
  !lccId.trim() ||
  !Number.isInteger(quantity) ||
  quantity <= 0 ||
  typeof location !== "string" ||
  !location.trim() ||
  typeof updatedBy !== "string" ||
  !updatedBy.trim()
) {
  return res.status(400).json({
    message:
      "productId, lccId, positive qty, location and updatedBy are required",
  });
}

    let result;

    await session.withTransaction(async () => {
      const product = await StockMaster.findOne({
        productId,
      }).session(session);

      if (!product) {
        const error = new Error("Product not found");
        error.status = 404;
        throw error;
      }

      if (product.balanceQty < quantity) {
        const error = new Error(
          `Only ${product.balanceQty} units are available in Product Master`
        );
        error.status = 400;
        throw error;
      }

      let lcc = await LCCMaster.findOne({
        productId,
        location: location.trim(),
      }).session(session);

      product.balanceQty -= quantity;
      await product.save({ session });

      if (!lcc) {
        lcc = new LCCMaster({
          lccId,
          productMasterId: product._id,
          productId: product.productId,
          productName: product.productName,
          location: location.trim(),
          totalQty: 0,
          balanceQty: 0,
        });
      }

      lcc.totalQty += quantity;
      lcc.balanceQty += quantity;
      await lcc.save({ session });

      const [transaction] =
        await StockMasterTransaction.create(
          [
            {
              stockMasterId: product._id,
              lccMasterId: lcc._id,
              qty: quantity,
              transactionDate:
                transactionDate || new Date(),
              location: location.trim(),
              sourceLocation: product.location,
              destinationLocation: location.trim(),
              updatedBy: updatedBy.trim(),
              balanceAfter: product.balanceQty,
            },
          ],
          { session }
        );

      result = { product, lcc, transaction };
    });

    return res.status(201).json({
      message: "Product transferred to LCC successfully",
      ...result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// PUT /api/lccmaster/:id
export const updateLCCStock = async (req, res) => {
  try {
    const {
      lccId,
      productName,
      location,
      totalQty,
      balanceQty,
    } = req.body;

    const item = await LCCMaster.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "LCC product not found",
      });
    }

    if (lccId !== undefined) item.lccId = lccId.trim();
    if (productName !== undefined) {
      item.productName = productName.trim();
    }
    if (location !== undefined) {
      item.location = location.trim();
    }

    if (
      totalQty !== undefined ||
      balanceQty !== undefined
    ) {
      const newTotal =
        totalQty === undefined
          ? item.totalQty
          : Number(totalQty);

      const newBalance =
        balanceQty === undefined
          ? item.balanceQty
          : Number(balanceQty);

      if (
        !Number.isInteger(newTotal) ||
        !Number.isInteger(newBalance) ||
        newTotal < 0 ||
        newBalance < 0 ||
        newBalance > newTotal
      ) {
        return res.status(400).json({
          message:
            "Quantities must be non-negative integers and balanceQty cannot exceed totalQty",
        });
      }

      item.totalQty = newTotal;
      item.balanceQty = newBalance;
    }

    await item.save();

    return res.status(200).json({
      message: "LCC product updated successfully",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
