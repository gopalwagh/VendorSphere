import { getDashboardStats, getRevenueChart, getTopProducts, getUserGrowth } from "./admin.controller.js";
import protect from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/adminMiddleware.js";
import express from "express";

const router = express.Router();

router.get("/dashboard", protect,  adminOnly, getDashboardStats);
router.get("/revenue", protect,  adminOnly, getRevenueChart);
router.get("/top-products", protect, adminOnly, getTopProducts);
router.get("/users-growth", protect,adminOnly, getUserGrowth);

export default router;