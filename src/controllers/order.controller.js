import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createOrderSchema } from "../validations/order.validation.js";
import Batch from "../models/batch.model.js";

// Place Order (Customer Only + Transaction)
export const createOrder = asyncHandler(async (req, res) => {

  const { error } = createOrderSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const { items } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {

      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        throw new ApiError(404, "Product not found");
      }

      // Fetch non-expired batches sorted by expiry (FIFO by expiry)
      const batches = await Batch.find({
        product: item.productId,
        expiryDate: { $gte: new Date() },
        quantity: { $gt: 0 },
      })
        .sort({ expiryDate: 1 })
        .session(session);

      if (!batches.length) {
        throw new ApiError(400, `No available stock for product: ${product.name}`);
      }

      let remainingQty = item.quantity;

      //first check total available in batches
      const totalBatchStock = batches.reduce(
        (sum, batch) => sum + batch.quantity, 0
      );

      if (totalBatchStock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for product: ${product.name}`
        );
      }

      //Deduct from batches FIFO 
      for (const batch of batches) {

        if (batch.quantity >= remainingQty) {
          batch.quantity -= remainingQty;
          await batch.save({ session });
          remainingQty = 0;
          break;
        } else {
          remainingQty -= batch.quantity;
          batch.quantity = 0;
          await batch.save({ session });
        }
      }

      //update product total stock
      product.stock -= item.quantity;
      await product.save({ session });

      totalAmount += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    const order = await Order.create(
      [
        {
          customer: req.user._id,
          items: orderItems,
          totalAmount,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(new ApiResponse(201, order[0], "Order placed successfully"));

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export const getOrders = asyncHandler(async (req, res) => {

  const {
    page = 1,
    limit = 5,
    sortKey = "createdAt",
    sortOrder = "desc"
  } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  let matchStage = {
    isActive: true,
    isDelete: false,
  };

  // Customer sees only their orders
  if (req.user.role === "customer") {
    matchStage.customer = req.user._id;
  }

  const ordersResult = await Order.aggregate([

    { $match: matchStage },

    // Unwind items array
    { $unwind: "$items" },

    // Lookup product inside each item
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "items.product"
      }
    },

    { $unwind: "$items.product" },

    // Shopkeeper filtering
    ...(req.user.role === "shopkeeper"
      ? [{
          $match: {
            "items.product.shopkeeper": req.user._id
          }
        }]
      : []),

    // Regroup order after unwind
    {
      $group: {
        _id: "$_id",
        customer: { $first: "$customer" },
        totalAmount: { $first: "$totalAmount" },
        status: { $first: "$status" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        items: { $push: "$items" }
      }
    },

    {
      $facet: {
        data: [
          {
            $sort: {
              [sortKey]: sortOrder === "asc" ? 1 : -1
            }
          },
          { $skip: skip },
          { $limit: limitNum }
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    }

  ]);

  const data = ordersResult[0].data;
  const total = ordersResult[0].totalCount[0]?.count || 0;

  return res.status(200).json(
    new ApiResponse(200, {
      total,
      page: pageNum,
      limit: limitNum,
      data
    }, "Orders fetched successfully")
  );
});

//get single order
export const getSingleOrder = asyncHandler(async (req, res) => {

  const order = await Order.findOne({
    _id: req.params.id,
    isActive: true,
    isDelete: false,
  })
    .populate("items.product");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Customer can see only their order
  if (
    req.user.role === "customer" &&
    order.customer.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

//mark order as completed
export const markOrderCompleted = asyncHandler(async (req, res) => {

  const order = await Order.findOne({
    _id: req.params.id,
    isActive: true,
    isDelete: false,
  })
    .populate("items.product");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (req.user.role !== "shopkeeper") {
    throw new ApiError(403, "Only shopkeeper can complete orders");
  }

  const hasProduct = order.items.some(item =>
    item.product.shopkeeper.toString() === req.user._id.toString()
  );

  if (!hasProduct) {
    throw new ApiError(403, "You cannot complete this order");
  }

  order.status = "completed";
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order marked as completed"));
});

// Cancel Order (Customer Only + Restore Stock)
export const cancelOrder = asyncHandler(async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .session(session);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Only customer can cancel their own order
    if (
      req.user.role !== "customer" ||
      order.customer.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(403, "Access denied");
    }

    if (order.status !== "pending") {
      throw new ApiError(400, "Only pending orders can be cancelled");
    }

    // 🔥 Restore stock
    for (const item of order.items) {

      const product = await Product.findById(item.product._id).session(session);

      if (!product) {
        throw new ApiError(404, "Product not found");
      }

      // Restore product stock
      product.stock += item.quantity;
      await product.save({ session });

      // Restore batches (add back to earliest non-expired batch)
      const batches = await Batch.find({
        product: product._id,
      })
        .sort({ expiryDate: 1 })
        .session(session);

      let remainingQty = item.quantity;

      for (const batch of batches) {
        batch.quantity += remainingQty;
        await batch.save({ session });
        break; // simple restore logic
      }
    }

    order.status = "cancelled";
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order cancelled successfully"));

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});