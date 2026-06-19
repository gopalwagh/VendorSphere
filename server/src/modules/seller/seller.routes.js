import express from "express";
import protect from "../../middleware/authMiddleware.js";
import sellerOnly from "../../middleware/sellerMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";

import { 
  getAnalytics, 
  applySellerProfile, 
  getSellerProfile, 
  updateSellerProfile 
} from "./seller.controller.js";

const router = express.Router();

router.get("/analytics", protect, sellerOnly, getAnalytics);

router.post("/apply", protect, sellerOnly, upload.single("storeLogo"), applySellerProfile);

router.get("/profile", protect, sellerOnly, getSellerProfile);

router.put("/profile", protect, sellerOnly, upload.single("storeLogo"), updateSellerProfile);

export default router;
