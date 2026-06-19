import express from "express";
import superAdminOnly from "../../middleware/superAdminMiddleware.js";
import protect from "../../middleware/authMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";
import { 
  getPendingApplications,
  approveApplication,
  rejectApplication, 
  getSuperAdminDashboard, 
  getApprovedApplications, 
  getAllUsers, 
} from "./superAdmin.controller.js";

const router = express.Router();

router.get("/applications", protect, superAdminOnly, getPendingApplications);

router.get("/applications/approved",protect, superAdminOnly, getApprovedApplications);

router.get("/users",protect, superAdminOnly, getAllUsers);

router.get("/dashboard", protect, superAdminOnly, getSuperAdminDashboard);

router.patch("/:sellerProfileId/approve", protect, superAdminOnly, approveApplication);

router.patch("/:sellerProfileId/reject", protect, superAdminOnly, rejectApplication);

export default router;
