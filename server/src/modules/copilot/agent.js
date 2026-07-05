import { ReActAgent } from "llamaindex";
import { Gemini } from "@llamaindex/google";
import ApiError from "../../utils/ApiError.js";
import { buildSellerTools } from "./sellerTools.js";
import { buildAdminTools } from "./adminTools.js";

const ROLE_CONFIG = {
  seller: {
    buildTools: (userId) => buildSellerTools(userId),
    systemContext: () =>
      ` 
        You are the Business Copilot for a seller on VendorSphere.
        You only ever have access to this seller's own data.

        CURRENCY: All monetary values in tool data are Indian Rupees. Always display
        amounts with the ₹ symbol (e.g. ₹899.10). Never use $ or USD.

        RESPONSE FORMAT: Respond with ONLY the final natural-language answer. Never
        include your internal reasoning, planning, or words like "Thought:" or
        "Answer:" — the user should only see the polished final response.

        OPEN-ENDED QUESTIONS: For strategic questions with no single matching tool
        (e.g. "how do I increase my sales", "how to grow my business"), there is no
        one tool for this — combine getSalesTrend, getProfitabilityAnalysis,
        getTopSellingProducts, getCategoryBreakdown, getInventoryStatus, and
        getCustomerInsights as relevant, then synthesize 2-3 concrete recommendations
        grounded in the actual numbers you retrieved. Always attempt an answer using
        combinations of available tools before saying you cannot help.

        Rules:
        - Always use tools to fetch real numbers. Never guess or estimate.
        - For compound questions, break them into multiple tool calls yourself.
        - If a tool returns an error or empty data, mention that specific gap plainly.
        - End with one concrete, specific, actionable recommendation when relevant.
      `,
  },
  superAdmin: {
    buildTools: () => buildAdminTools(),
    systemContext: () =>
    `
      You are the Business Copilot for VendorSphere's platform administrator.

      CURRENCY: All monetary values are Indian Rupees. Always use ₹, never $.
      RESPONSE FORMAT: Only output the final answer — no "Thought:"/"Answer:" labels.

      You have platform-wide visibility across all sellers, coupons, and orders.
      Never fabricate figures — only use tool output. Combine revenue, seller
      performance, top products, and coupon data across multiple tool calls
      when the question needs it.
    `,
  },
};

// Safety net — strips any ReAct "Thought:"/"Answer:" scaffolding that
// leaks through despite the prompt instruction
const stripReactArtifacts = (text) => {
  if (!text) return text;
  const match = text.match(/Answer:\s*([\s\S]*)$/i);
  return (match ? match[1] : text).trim();
};

const sanitizeChatHistory = (chatHistory = []) => {
  return chatHistory
    .filter((m) => m && typeof (m.content ?? m.text) === "string" && (m.content ?? m.text).trim().length > 0)
    .map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
      content: m.content ?? m.text,
    }));
};

export const executeAgenticQuery = async (userMessage, userId, role, chatHistory = []) => {
  const config = ROLE_CONFIG[role];
  if (!config) throw new ApiError(403, "Copilot not available for this role.");

  try {
    const llm = new Gemini({
      model: "gemini-2.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.1,
    });

    const agent = new ReActAgent({
      tools: config.buildTools(userId),
      llm,
      verbose: process.env.NODE_ENV !== "production",
      maxIterations: 3,
    });

    const safeHistory = sanitizeChatHistory(chatHistory);

    const response = await agent.chat({
      message: `${config.systemContext()}\n\nUser query: "${userMessage}"`,
      chatHistory: safeHistory,
    });

    return stripReactArtifacts(response.response);
  } catch (error) {
    console.error("❌ Agentic Core Failure — full detail:", error);

    const isRateLimit = error?.message?.includes("429") || error?.message?.includes("quota");
    if (isRateLimit) {
      throw new ApiError(429, "Copilot is temporarily busy due to high demand. Please try again in a minute.");
    }
    throw new ApiError(500, "Failed to orchestrate copilot tools.");
  }
};