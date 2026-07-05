import express from "express";
import protect from "../../middleware/authMiddleware.js";
import { handleCopilotChat } from "./copilot.controller.js";

const router = express.Router();

router.post("/chat", protect, handleCopilotChat);

export default router;
