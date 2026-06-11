import express from "express";

import protect from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/adminMiddleware.js";
import { checkout, verifyPayment, getMyOrders, getAllOrders, updateOrderStatus, downloadInvoice, trackOrder, getAdminOrders, } from "./order.controller.js";

const router = express.Router();

router.get("/my-orders", protect, getMyOrders);
router.get("/track/:orderId", protect, trackOrder);
router.get("/invoice/:orderId", protect, downloadInvoice);

router.get("/super-admin/all-orders",protect, adminOnly, getAllOrders);
router.patch("/admin/update-status/:orderId", protect, adminOnly, updateOrderStatus);

router.get("/admin/my-orders", protect, adminOnly, getAdminOrders)

router.post("/checkout", protect, checkout);
router.post("/verify-payment", protect, verifyPayment);

export default router;
