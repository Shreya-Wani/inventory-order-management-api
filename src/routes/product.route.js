import express from "express";
import {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    addStock,
} from "../controllers/product.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Only shopkeeper can create product
router.post("/", protect, authorizeRoles("shopkeeper"), createProduct);

router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);
router.put("/:id", protect, authorizeRoles("shopkeeper"), updateProduct);
router.delete("/:id", protect, authorizeRoles("shopkeeper"), deleteProduct);
router.patch("/:id/add-stock", protect, authorizeRoles("shopkeeper"), addStock);

export default router;