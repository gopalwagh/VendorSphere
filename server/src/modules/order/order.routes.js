import express from "express";

import protect from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/adminMiddleware.js";
import { checkout, verifyPayment, getMyOrders, getAllOrders, updateOrderStatus, downloadInvoice, trackOrder} from "./order.controller.js";

const router = express.Router();

router.get("/my-orders", protect, getMyOrders);
router.get("/track/:orderId", protect, trackOrder);
router.get("/invoice/:orderId", protect, downloadInvoice);

router.get("/admin/all-orders",protect, adminOnly, getAllOrders);
router.patch("/admin/update-status/:orderId", protect, adminOnly, updateOrderStatus);

router.post("/checkout", protect, checkout);
router.post("/verify-payment", protect, verifyPayment);

export default router;
