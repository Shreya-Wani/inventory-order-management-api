import express from "express";
import { createOrder } from "../controllers/order.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Only customer can place order
router.post("/", protect, authorizeRoles("customer"), createOrder);

export default router;