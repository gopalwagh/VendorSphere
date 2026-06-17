import { getAnalytics } from "./admin.controller.js";
import protect from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/adminMiddleware.js";
import express from "express";

const router = express.Router();

router.get( "/analytics", protect, adminOnly, getAnalytics );

export default router;