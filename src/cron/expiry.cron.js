import cron from "node-cron";
import mongoose from "mongoose";
import Batch from "../models/batch.model.js";
import Product from "../models/product.model.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.model.js";

const runExpiryJob = () => {

    //Run every day at midnight
    cron.schedule("0 0 * * *", async () => {

        console.log("Running expiry cron job...");

        const session = await mongoose.startSession();
        session.startTransaction();

        const emailsToSend = [];

        try {

            const today = new Date();

            const expiredBatches = await Batch.find({
                expiryDate: { $lt: today },
                isExpired: false,
                quantity: { $gt: 0 },
            }).session(session);

            for (const batch of expiredBatches) {

                const expiredQty = batch.quantity;

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

                // Fetch shopkeeper
                const shopkeeper = await User.findById(batch.shopkeeper).session(session);

                if (shopkeeper) {
                    emailsToSend.push({
                        to: shopkeeper.email,
                        subject: "Batch Expiry Notification",
                        text: `
                        Product: ${product?.name}
                        Expired Quantity: ${expiredQty}
                        Expiry Date: ${batch.expiryDate.toDateString()}
                        Remaining Product Stock: ${product?.stock}
                        `,
                    });
                }
            }

            await session.commitTransaction();
            session.endSession();

            console.log("Expiry cron completed. Sending emails...");

            for (const email of emailsToSend) {
                try {
                    await sendEmail(email);
                } catch (emailError) {
                    console.error("Email sending failed:", emailError.message);
                }
            }

        } catch (error) {

            await session.abortTransaction();
            session.endSession();
            
            console.error("Expiry cron failed:", error.message);
        }
    });
};

export default runExpiryJob;