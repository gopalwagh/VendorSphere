import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { loadConversationContext } from "./contextLoader.js";
import { executeAgenticQuery } from "./agent.js";
import copilotQueue from "../../queues/copilot.queue.js";

const ALLOWED_ROLES = ["seller", "superAdmin"];

export const handleCopilotChat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user?._id;
  const role = req.user?.role;

  if (!message) throw new ApiError(400, "Message query string required");
  if (!ALLOWED_ROLES.includes(role)) {
    throw new ApiError(403, "Copilot is only available for sellers and admins.");
  }

  const chatHistory = await loadConversationContext(userId);
  
  const aiResponseText = await executeAgenticQuery(message, userId, role, chatHistory);

  res.status(200).json(
    new ApiResponse(200, { answer: aiResponseText }, "Copilot response generated")
  );
  // response added Db through copilotQueue 
  try {
    await copilotQueue.add(
      "saveChatLog",
      { 
        userId, role, 
        userMessage: message, 
        aiResponse: aiResponseText, 
        timestamp: new Date() },
      { 
        removeOnComplete: true, 
        attempts: 3, 
        backoff: 5000 
      }
    );
  } catch (queueError) {
    console.error("⚠️ Background logging failed:", queueError.message);
  }
});