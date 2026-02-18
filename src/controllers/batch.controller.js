import mongoose from "mongoose";
import Batch from "../models/batch.model.js";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createBatch = asyncHandler(async (req, res) => {

    const { productId, quantity, expiryDate } = req.body;

    if (!productId || !quantity || !expiryDate) {
        throw new ApiError(400, "All fields are required");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const product = await Product.findById(productId).session(session);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        if (product.shopkeeper.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You can create batch only for your product");
        }

        const batch = await Batch.create(
            [
                {
                    product: productId,
                    shopkeeper: req.user._id,
                    quantity,
                    expiryDate,
                },
            ],
            { session }
        );

        // Update product total quantity
        product.stock += quantity;
        await product.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(
            new ApiResponse(201, batch[0], "Batch created successfully")
        );

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
})