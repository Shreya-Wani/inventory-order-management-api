import cron from "node-cron";
import mongoose from "mongoose";
import Batch from "../models/batch.model.js";
import Product from "../models/product.model.js";

const runExpiryJob = () => {

    //Run every day at midnight
    cron.schedule("0 0 * * *", async () => {

        console.log("Running expiry cron job...");

        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            const today = new Date();

            const expiredBatches = await Batch.find({
                expiryDate: { $lt: today },
                isExpired: false,
                quantity: { $gt: 0 },
            }).session(session);

            for (const batch of expiredBatches) {

                const expiredQty = batch.Quntity;

                //mark batch expired
                batch.isExpired = true;
                batch.expiredQuantity = expiredQty;
                batch.quantity = 0;

                await batch.save({ session });

                //reduce product stock
                const product = await Product.findById(batch.product).session(session);

                if (product) {
                    product.stock -= expiredQty;
                    if (product.stock < 0) product.stock = 0;
                    await product.save({ session });
                }

                console.log(
                    `Batch expired: Product ${product?.name}, Quantity ${expiredQty}`
                );
            }

            await session.commitTransaction();
            session.endSession();

            console.log("Expiry cron completed.");
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Expiry cron failed:", error.message);
        }
    });
};

export default runExpiryJob;