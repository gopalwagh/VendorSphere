import axiosInstance from "./axios.js";

/**
 * Send a message to the Business Copilot.
 * POST /api/copilot/chat
 * @param {string} message - The user's query
 * @returns {Promise<{ answer: string }>}
 */
export const sendCopilotMessage = async (message) => {
  const { data } = await axiosInstance.post("/copilot/chat", { message });
  return data.data; // { answer: "..." }
};
