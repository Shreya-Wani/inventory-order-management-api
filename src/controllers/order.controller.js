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
