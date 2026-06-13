import express from "express";

import protect from "../../middleware/authMiddleware.js";

import { addToCart, getCart, removeFromCart, updateCartQuantity } from "./cart.controller.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.patch("/:productId", protect, updateCartQuantity);
router.delete("/:productId", protect, removeFromCart);

export default router;
