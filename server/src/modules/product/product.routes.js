import express from "express";

import protect from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/adminMiddleware.js"
import upload from "../../middleware/uploadMiddleware.js";

import { createProduct, getAllProducts, getSingleProduct } from "./product.controller.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:productId", getSingleProduct);

router.post("/create", protect, adminOnly, upload.single("image"), createProduct);

export default router;