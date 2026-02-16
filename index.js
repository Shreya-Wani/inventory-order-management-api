import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import globalErrorHandler from "./src/middlewares/errorMiddleware.js";
import authRoutes from "./src/routes/auth.route.js";
import productRoutes from "./src/routes/product.route.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(globalErrorHandler);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });