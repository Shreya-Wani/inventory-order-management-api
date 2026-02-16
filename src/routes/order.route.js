import express from "express";
import { createOrder, getOrders, getSingleOrder, markOrderCompleted } from "../controllers/order.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Only customer can place order
router.post("/", protect, authorizeRoles("customer"), createOrder);

router.get("/", protect, getOrders);
router.get("/:id", protect, getSingleOrder);

router.patch(
  "/:id/complete",
  protect,
  authorizeRoles("shopkeeper"),
  markOrderCompleted
);

export default router;