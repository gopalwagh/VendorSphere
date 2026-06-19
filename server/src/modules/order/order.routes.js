import express from "express";

import protect from "../../middleware/authMiddleware.js";
import sellerOnly from "../../middleware/sellerMiddleware.js";
import superAdminOnly from "../../middleware/superAdminMiddleware.js";
import { checkout, verifyPayment, getMyOrders, getAllOrders, updateOrderStatus, downloadInvoice, trackOrder, getSellerOrders, } from "./order.controller.js";

const router = express.Router();

router.get("/my-orders", protect, getMyOrders);
router.get("/track/:orderId", protect, trackOrder);
router.get("/invoice/:orderId", protect, downloadInvoice);

router.get("/super-admin/all-orders", protect, superAdminOnly, getAllOrders);
router.patch("/seller/update-status/:orderId", protect, sellerOnly, updateOrderStatus);

router.get("/seller/my-orders", protect, sellerOnly, getSellerOrders)

router.post("/checkout", protect, checkout);
router.post("/verify-payment", protect, verifyPayment);

export default router;
