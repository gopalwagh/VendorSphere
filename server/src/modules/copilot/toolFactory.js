// tools/toolFactory.js
import { FunctionTool } from "llamaindex";

/**
 * Wraps a handler so the identity (sellerId or role scope) is baked in
 * at creation time — never exposed as an LLM-fillable parameter.
 * This is the core defense against prompt-injection based data leaks.
 */
export const createBoundTool = ({ name, description, parameters, handler, boundContext }) => {
  return FunctionTool.from(
    async (llmArgs) => {
      try {
        return await handler({ ...llmArgs, ...boundContext });
      } catch (err) {
        // Ek tool ka fail hona poore agent loop ko crash nahi karega —
        // agent ko error string milegi, wo user ko gracefully bata dega
        console.error(`❌ Tool "${name}" execution failed:`, err);
        return JSON.stringify({ error: `${name} failed: ${err.message}` });
      }
    },
    { name, description, parameters }
  );
}