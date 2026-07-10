import { Worker } from "bullmq";
import mongoose from "mongoose";
import Conversation from "../modules/copilot/conversation.model.js";

const copilotWorker = new Worker(
  "copilotQueue",
  async (job) => {
    const {
      userId,
      sellerId,
      userMessage,
      botResponse,
      aiResponse,
      answer,
    } = job.data;

    const conversationUserId = userId || sellerId;
    const responseText = botResponse || aiResponse || answer || "";

    if (!conversationUserId || !userMessage || !responseText) {
      throw new Error("Invalid copilot job payload");
    }

    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(conversationUserId);
    } catch {
      throw new Error(`Invalid conversationUserId: ${conversationUserId}`);
    }

    // Cap stored history to last 40 messages (20 turns) — document ko unbounded
    // grow hone se rokta hai, aur contextLoader ko hamesha sirf recent tail chahiye hoti hai
    const MAX_STORED_MESSAGES = 40;

    await Conversation.findOneAndUpdate(
      { userId: userObjectId },
      {
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
        new: true,
        setDefaultsOnInsert: true,
      }
    );

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