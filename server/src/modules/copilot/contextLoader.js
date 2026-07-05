import Conversation from "./conversation.model.js";

/*
 * Fetches the recent 6 chat messages from MongoDB for LLM context window
 */
export const loadConversationContext = async (userId) => {
    try {
        const conversation = await Conversation.findOne({ userId });
        
        if (!conversation || !conversation.messages) {
            return [];
        }

        // Sirf pichle 6 messages bhejna taaki context limit clean rahe
        return conversation.messages.slice(-4).map(msg => ({
            role: msg.role,
            text: msg.text
        }));
    } catch (error) {
        console.error("⚠️ Context Loader DB Failure (Ignored for pipeline safety):", error);
        return [];
    }
};