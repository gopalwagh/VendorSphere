import express from "express";

import protect from "../../middleware/authMiddleware.js";

import { addToCart, getCart, removeFromCart, updateCartQuantity } from "./cart.controller.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.patch("/update/:productId", protect, updateCartQuantity);
router.delete("/remove/:productId", protect, removeFromCart);

export default router;
