import { Worker } from "bullmq";
import mongoose from "mongoose";
import Conversation from "../modules/copilot/conversation.model.js";

const copilotWorker = new Worker(
  "copilotQueue",
  async (job) => {
    const { 
      sessionId, 
      userId, 
      sellerId, 
      userMessage, 
      botResponse, 
      aiResponse, 
      answer 
    } = job.data;

    const conversationUserId = userId || sellerId;
    const responseText = botResponse || aiResponse || answer || "";

    if (!sessionId || !conversationUserId || !userMessage || !responseText) {
      throw new Error("Invalid copilot job payload");
    }

    let userObjectId = new mongoose.Types.ObjectId(conversationUserId);
    const MAX_STORED_MESSAGES = 40; // Rolling window filter

    try {
      await Conversation.findOneAndUpdate(
        { _id: sessionId },
        {
          $setOnInsert: {
            userId: userObjectId,
            title: userMessage.length > 42 ? userMessage.slice(0, 42) + "…" : userMessage,
          },
          $push: {
            messages: {
              $each: [
                { role: "user", text: userMessage },
                { role: "model", text: responseText },
              ],
              $slice: -MAX_STORED_MESSAGES,
            },
          },
        },
        {
          upsert: true,
          returnDocument: 'after', //  'new: true' ki jagah ab ye use hoga deprecation se bachne ke liye
          setDefaultsOnInsert: true,
        }
      );
    } catch (dbError) {
      console.error("[BullMQ] ❌ DB Save Error in Copilot Worker:", dbError.message);
      throw dbError; 
    }
    console.log(`[BullMQ] Copilot conversation saved for user: ${conversationUserId}`);
  },
  {
    connection: {
      url: process.env.REDIS_URL,
    },
    skipNetworkCheck: true,
    suppressVersionCheck: true,
  }
);

export default copilotWorker;