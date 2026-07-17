import axiosInstance from "./axios.js";

/**
 * Send a message to the Business Copilot.
 * POST /api/copilot/chat
 * @param {string} message - The user's query
 * @param {string} [sessionId] - Existing MongoDB session ID to append to (optional)
 * @returns {Promise<{ answer: string, sessionId: string }>}
 */
export const sendCopilotMessage = async (message, sessionId) => {
  const body = { message };
  if (sessionId) body.sessionId = sessionId;
  const { data } = await axiosInstance.post("/copilot/chat", body);
  return data.data; // { answer: "...", sessionId: "..." }
};

/**
 * Fetch user's full chat history from the Business Copilot.
 * GET /api/copilot/history
 * @returns {Promise<Array>} Array of Conversation documents from MongoDB
 */
export const getCopilotHistory = async () => {
  const { data } = await axiosInstance.get("/copilot/history");
  return data.data; // The array of conversation docs (ApiResponse unwrapped)
};
