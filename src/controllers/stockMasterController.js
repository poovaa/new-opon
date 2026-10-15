import StockMaster from "../models/StockMaster.js";
import StockMasterRestock from "../models/StockMasterRestock.js";

// GET: Fetch all products
export const getStocks = async (req, res) => {
  try {
    const stocks = await StockMaster.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Products fetched successfully",
      data: stocks,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch products",
    });
  }
};

// CREATE: Add a new product
export const createStock = async (req, res) => {
  try {
    const {
      productId,
      productName,
      location,
      receivedDate,
      yourName,
      totalQty,
    } = req.body;

    if (
      typeof productId !== "string" ||
      !productId.trim() ||
      typeof productName !== "string" ||
      !productName.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      typeof yourName !== "string" ||
      !yourName.trim() ||
      totalQty === undefined ||
      totalQty === null ||
      totalQty === ""
    ) {
      return res.status(400).json({
        message:
          "Product ID, Product Name, Location, Your Name and Total Quantity are required",
      });
    }

    const total = Number(totalQty);

    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({
        message: "Please enter a valid Total Quantity",
      });
    }

    const entryDate = receivedDate
      ? new Date(receivedDate)
      : new Date();

    if (Number.isNaN(entryDate.getTime())) {
      return res.status(400).json({
        message: "Please enter a valid received date",
      });
    }

    const stock = await StockMaster.create({
      productId: productId.trim(),
      productName: productName.trim(),
      location: location.trim(),
      receivedDate: entryDate,
      yourName: yourName.trim(),
      totalQty: total,
      balanceQty: total,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: stock,
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 400).json({
      message:
        error.code === 11000
          ? "Product ID already exists"
          : error.message,
    });
  }
};

// UPDATE: Edit product name, location, received date,
// your name and total quantity
export const updateStock = async (req, res) => {
  try {
    const {
      productName,
      location,
      receivedDate,
      yourName,
      totalQty,
    } = req.body;

    if (
      typeof productName !== "string" ||
      !productName.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      typeof yourName !== "string" ||
      !yourName.trim() ||
      totalQty === undefined ||
      totalQty === null ||
      totalQty === ""
    ) {
      return res.status(400).json({
        message:
          "Product Name, Location, Your Name and Total Quantity are required",
      });
    }

    const total = Number(totalQty);

    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({
        message: "Please enter a valid Total Quantity",
      });
    }

    const stock = await StockMaster.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Preserve quantity already used or transferred
    const usedQty = stock.totalQty - stock.balanceQty;

    if (total < usedQty) {
      return res.status(400).json({
        message: `Total Quantity cannot be less than used quantity (${usedQty}).`,
      });
    }

    let entryDate = stock.receivedDate;

    if (receivedDate !== undefined && receivedDate !== "") {
      entryDate = new Date(receivedDate);

      if (Number.isNaN(entryDate.getTime())) {
        return res.status(400).json({
          message: "Please enter a valid received date",
        });
      }
    }

    stock.productName = productName.trim();
    stock.location = location.trim();
    stock.receivedDate = entryDate;
    stock.yourName = yourName.trim();
    stock.totalQty = total;
    stock.balanceQty = total - usedQty;

    await stock.save();

    return res.status(200).json({
      message: "Product updated successfully",
      data: stock,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update product",
    });
  }
};

// RESTOCK: Add more quantity to an existing product
export const restockStock = async (req, res) => {
  let restockRecord;

  try {
    const { qty, location, updatedBy, assignDate } = req.body;

    const restockQty = Number(qty);

    if (
      qty === "" ||
      qty === undefined ||
      qty === null ||
      !Number.isFinite(restockQty) ||
      restockQty <= 0
    ) {
      return res.status(400).json({
        message: "Restock quantity must be greater than zero",
      });
    }

    if (
      typeof location !== "string" ||
      !location.trim() ||
      typeof updatedBy !== "string" ||
      !updatedBy.trim()
    ) {
      return res.status(400).json({
        message: "Location and Updated By are required",
      });
    }

    const restockDate = assignDate
      ? new Date(assignDate)
      : new Date();

    if (Number.isNaN(restockDate.getTime())) {
      return res.status(400).json({
        message: "Please enter a valid restock date",
      });
    }

    const stock = await StockMaster.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Save restock history
    restockRecord = await StockMasterRestock.create({
      stockMasterId: stock._id,
      restockDate,
      location: location.trim(),
      updatedBy: updatedBy.trim(),
      restockQty,
    });

    // Increase total quantity and available balance
    stock.totalQty += restockQty;
    stock.balanceQty += restockQty;

    await stock.save();

    return res.status(200).json({
      message: "Product restocked successfully",
      data: stock,
      restock: restockRecord,
    });
  } catch (error) {
    if (restockRecord?._id) {
      try {
        await StockMasterRestock.findByIdAndDelete(
          restockRecord._id
        );
      } catch (cleanupError) {
        console.error(
          "Restock history cleanup failed:",
          cleanupError.message
        );
      }
    }

    return res.status(500).json({
      message: error.message || "Failed to restock product",
    });
  }
};