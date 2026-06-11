import express from "express";

import { createCoupon, applyCoupon, } from "./coupon.controller.js";
import protect from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/adminMiddleware.js";

const router = express.Router();

// router.get("/", protect, adminOnly, getAllCoupons);
router.post("/super-admin/create", protect, adminOnly, createCoupon);
// router.delete("/:couponId", protect, adminOnly, deleteCoupon);
router.post("/apply",protect, applyCoupon);

export default router;