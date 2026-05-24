import express from "express";

import protect from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/adminMiddleware.js"
import upload from "../../middleware/uploadMiddleware.js";

import { createProduct, getAllProducts, getSingleProduct, addReview, getProductReviews } from "./product.controller.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:productId", getSingleProduct);
router.get("/reviews/:productId", getProductReviews);

router.post("/create", protect, adminOnly, upload.single("image"), createProduct);
router.post("/review/:productId", protect, addReview);

export default router;