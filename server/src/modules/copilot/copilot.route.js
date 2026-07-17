import express from "express";
import protect from "../../middleware/authMiddleware.js";
import { getCopilotHistory, handleCopilotChat } from "./copilot.controller.js";

const router = express.Router();

router.post("/chat", protect, handleCopilotChat);

router.get("/history", protect, getCopilotHistory);

export default router;
