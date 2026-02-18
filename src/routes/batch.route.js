import express from "express";
import { createBatch } from "../controllers/batch.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Only shopkeeper can create batch
router.post("/", protect, authorizeRoles("shopkeeper"), createBatch);

export default router;