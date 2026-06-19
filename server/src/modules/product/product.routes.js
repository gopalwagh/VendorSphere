import express from "express";

import protect from "../../middleware/authMiddleware.js";
import sellerOnly from "../../middleware/sellerMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";

import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  addReview,
  getProductReviews,
  updateProduct,
  deleteProduct,
  getSellerProducts,
} from "./product.controller.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/reviews/:productId", getProductReviews);
router.get("/:productId", getSingleProduct);

router.get("/seller/products", protect, sellerOnly, getSellerProducts);
router.post("/create", protect, sellerOnly, upload.single("image"), createProduct);
router.patch("/:productId", protect, sellerOnly, upload.single("image"), updateProduct);
router.delete("/:productId", protect, sellerOnly, deleteProduct);
router.post("/review/:productId", protect, addReview);

export default router;
