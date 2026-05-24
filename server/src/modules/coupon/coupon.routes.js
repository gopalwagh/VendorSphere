import express from "express";

import { createCoupon, applyCoupon } from "./coupon.controller.js";
import protect from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/create", protect, adminOnly, createCoupon);
router.post("/apply",protect, applyCoupon);

export default router;