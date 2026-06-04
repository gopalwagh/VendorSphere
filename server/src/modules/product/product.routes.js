import express from "express";

import protect from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/adminMiddleware.js"
import upload from "../../middleware/uploadMiddleware.js";

import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  addReview,
  getProductReviews,
  updateProduct,
  deleteProduct,
} from "./product.controller.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/reviews/:productId", getProductReviews);
router.get("/:productId", getSingleProduct);

router.post("/create", protect, adminOnly, upload.single("image"), createProduct);
router.patch("/:productId", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:productId", protect, adminOnly, deleteProduct);
router.post("/review/:productId", protect, addReview);

export default router;
