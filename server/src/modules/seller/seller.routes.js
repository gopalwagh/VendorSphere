import express from "express";
import adminOnly from "../../middleware/adminMiddleware.js";
import superAdminOnly from "../../middleware/superAdminMiddleware.js";
import protect from "../../middleware/authMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";
import { getSellerProfile, applySellerProfile, getPendingApplications, approveApplication,rejectApplication, getSuperAdminDashboard, getApprovedApplications, getAllUsers } from "./seller.controller.js";

const router = express.Router();

router.post("/apply", protect, adminOnly, upload.single("storeLogo"), applySellerProfile);

router.get("/profile", protect, adminOnly,getSellerProfile);

// router.put("/profile", protect, adminOnly,updateSellerProfile);

// superadmin
router.get("/applications", protect, superAdminOnly, getPendingApplications);

router.get("/applications/approved",protect, superAdminOnly, getApprovedApplications);

router.get("/users",protect, superAdminOnly, getAllUsers);

router.patch("/:sellerProfileId/approve", protect, superAdminOnly, approveApplication);

router.patch("/:sellerProfileId/reject", protect, superAdminOnly, rejectApplication);

router.get("/dashboard", protect, superAdminOnly, getSuperAdminDashboard);

export default router;