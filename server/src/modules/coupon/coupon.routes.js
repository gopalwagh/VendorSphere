import express from "express";

import { createCoupon, applyCoupon, getAllCoupons,deleteCoupon } from "./coupon.controller.js";
import protect from "../../middleware/authMiddleware.js";
import superAdminOnly from "../../middleware/superAdminMiddleware.js";

const router = express.Router();

router.get("/", protect, superAdminOnly, getAllCoupons);

router.post("/create", protect, superAdminOnly, createCoupon);

router.delete("/:couponId", protect, superAdminOnly, deleteCoupon);

router.post("/apply",protect,applyCoupon);

export default router;