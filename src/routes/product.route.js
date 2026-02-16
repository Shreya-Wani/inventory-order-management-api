import express from "express";
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
} from "../controllers/product.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Only shopkeeper can create product
router.post("/", protect, authorizeRoles("shopkeeper"), createProduct);

router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);

export default router;