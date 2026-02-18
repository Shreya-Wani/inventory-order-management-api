import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createOrderSchema } from "../validations/order.validation.js";


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

      if (product.stock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for product: ${product.name}`
        );
      }

      // Deduct stock
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

//Get Orders
export const getOrders = asyncHandler(async (req, res) => {

  let orders;

  if (req.user.role === "customer") {
    // Customer sees only their orders
    orders = await Order.find({ customer: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });

  } else if (req.user.role === "shopkeeper") {
    // Shopkeeper sees orders containing their products
    orders = await Order.find()
      .populate("items.product")
      .sort({ createdAt: -1 });

    orders = orders.filter(order =>
      order.items.some(item =>
        item.product.shopkeeper.toString() === req.user._id.toString()
      )
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

//get single order
export const getSingleOrder = asyncHandler(async (req, res) => {

  const order = await Order.findById(req.params.id)
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

  const order = await Order.findById(req.params.id)
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

