import { required } from "joi";
import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        shopkeeper: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
        },

        expiryDate: {
            type: Date,
            required: true,
        },

        isExpired: {
            type: Boolean,
            default: false,
        },

        expiredQuantity: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Batch = mongoose.model("Batch", batchSchema);

export default Batch;

