import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { loadConversationContext } from "./contextLoader.js";
import { executeAgenticQuery } from "./agent.js";
import copilotQueue from "../../queues/copilot.queue.js";
import mongoose from "mongoose";
import Conversation from "./conversation.model.js";

const ALLOWED_ROLES = ["seller", "superAdmin"];
// . POST: Handle Copilot Chat Session
export const handleCopilotChat = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;
  const userId = req.user?._id;
  const role = req.user?.role;

  if (!message) throw new ApiError(400, "Message query string required");
  if (!ALLOWED_ROLES.includes(role)) {
    throw new ApiError(403, "Copilot is only available for sellers and admins.");
  }

  // Naya chat hai toh string ID banao, purana hai toh reuse karo
  const targetSessionId = sessionId || new mongoose.Types.ObjectId().toString();

  const chatHistory = sessionId ? await loadConversationContext(targetSessionId) : [];
  const aiResponseText = await executeAgenticQuery(message, userId, role, chatHistory);

  // Frontend ko response mein answer aur real sessionId instantly return karo
  res.status(200).json(
    new ApiResponse(200, { answer: aiResponseText, sessionId: targetSessionId }, "Copilot response generated")
  );

  // Background mein save karne ke liye BullMQ bhej do
  try {
    await copilotQueue.add(
      "saveChatLog",
      { 
        sessionId: targetSessionId,
        userId, 
        role, 
        userMessage: message, 
        aiResponse: aiResponseText, 
        timestamp: new Date() 
      },
      { removeOnComplete: true, attempts: 3, backoff: 5000 }
    );
  } catch (queueError) {
    console.error("⚠️ Background logging failed:", queueError.message);
  }
});

// GET: Fetch User Chat History (Reverse Order)
export const getCopilotHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const role   = req.user?.role;

  if (!userId) throw new ApiError(401, "User not authenticated");
  if (!ALLOWED_ROLES.includes(role)) {
    throw new ApiError(403, "Copilot history is only for sellers and admins.");
  }

  // Newest chat sabse upar aayegi aur memory super-light rahegi (.lean())
  const history = await Conversation.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, history, "Chat history fetched successfully")
  );
});