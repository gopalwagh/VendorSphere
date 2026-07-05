import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { sendCopilotMessage } from "../../api/copilotApi";
import { ROLES, normalizeRole } from "../../features/auth/roleUtils";
import "./BusinessCopilot.css";

/* ── Role-specific suggestion chips ── */
const SELLER_CHIPS = [
  "Show my sales trend",
  "Which products are low on stock?",
  "Show my top selling products",
  "Analyse my profitability",
  "Customer insights",
];

const ADMIN_CHIPS = [
  "Platform revenue this month",
  "Top sellers by revenue",
  "Pending seller applications",
  "Best selling products",
  "Coupon effectiveness report",
];

/* ── Lightweight markdown-like renderer ── */
const renderText = (text) => {
  // Bold: **text**
  let parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Highlight ₹ amounts
    const rupeeRegex = /(₹[\d,]+(?:\.\d+)?)/g;
    const subParts = part.split(rupeeRegex);
    return subParts.map((sub, j) =>
      rupeeRegex.test(sub) ? (
        <span key={`${i}-${j}`} className="rupee-highlight">{sub}</span>
      ) : (
        sub
      )
    );
  });
};

/* ── Streaming text hook: character-by-character reveal ── */
const useStreamingText = (text, isStreaming) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!isStreaming || !text) {
      setDisplayed(text || "");
      setDone(true);
      return;
    }
    // Reset
    setDisplayed("");
    setDone(false);
    idxRef.current = 0;
    clearInterval(timerRef.current);

    // Adaptive speed: longer texts render faster
    const speed = text.length > 800 ? 4 : text.length > 300 ? 8 : 14;

    timerRef.current = setInterval(() => {
      idxRef.current += 1;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) {
        clearInterval(timerRef.current);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(timerRef.current);
  }, [text, isStreaming]);

  return { displayed, done };
};

/* ── Single streamed assistant message ── */
const StreamedBubble = ({ text, onDone }) => {
  const { displayed, done } = useStreamingText(text, true);

  useEffect(() => {
    if (done && onDone) onDone();
  }, [done, onDone]);

  return (
    <div className="copilot-bubble">
      {renderText(displayed)}
      {!done && <span className="copilot-cursor" />}
    </div>
  );
};

/* ── Static bubble (user or settled assistant) ── */
const StaticBubble = ({ text }) => (
  <div className="copilot-bubble">{renderText(text)}</div>
);

/*               MAIN COMPONENT                   */

const BusinessCopilot = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const normalizedRole = normalizeRole(user?.role);
  const isSuperAdmin = normalizedRole === ROLES.SUPER_ADMIN;
  const isSeller = normalizedRole === ROLES.SELLER;

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [error, setError] = useState(null);
  const [unseenCount, setUnseenCount] = useState(0);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Only render for seller or superAdmin
  if (!isAuthenticated || (!isSeller && !isSuperAdmin)) return null;
  // For sellers, only show if approved
  if (isSeller && user?.sellerStatus !== "approved") return null;

  const chips = isSuperAdmin ? ADMIN_CHIPS : SELLER_CHIPS;
  const roleLabel = isSuperAdmin ? "Super Admin" : "Seller";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpen = () => {
    setOpen(true);
    setClosing(false);
    setUnseenCount(0);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 220);
  };

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || loading) return;

      const userMsg = {
        id: Date.now(),
        role: "user",
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setError(null);
      setLoading(true);

      // Auto-resize textarea back
      if (textareaRef.current) {
        textareaRef.current.style.height = "22px";
      }

      try {
        const data = await sendCopilotMessage(trimmed);
        const aiId = Date.now() + 1;

        const aiMsg = {
          id: aiId,
          role: "assistant",
          text: data.answer,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          streaming: true,
        };

        setMessages((prev) => [...prev, aiMsg]);
        setStreamingId(aiId);

        if (!open) {
          setUnseenCount((c) => c + 1);
        }
      } catch (err) {
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;
        let errorText = "Something went wrong. Please try again.";
        if (status === 429) errorText = "Copilot is busy. Please wait a moment and try again.";
        else if (status === 403) errorText = "You don't have access to Business Copilot.";
        else if (serverMsg) errorText = serverMsg;
        setError(errorText);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, open]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaInput = (e) => {
    setInput(e.target.value);
    // Auto-grow
    e.target.style.height = "22px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleStreamingDone = useCallback((id) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, streaming: false } : m))
    );
    setStreamingId(null);
  }, []);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <>
      {/* ── FAB ── */}
      <button
        className={`copilot-fab ${open ? "open" : ""}`}
        onClick={open ? handleClose : handleOpen}
        title="Business Copilot"
        aria-label="Open Business Copilot"
      >
        <span className="copilot-fab-icon">{open ? "✕" : "✦"}</span>
        {!open && unseenCount > 0 && (
          <span className="copilot-badge">{unseenCount}</span>
        )}
      </button>

      {/* ── Panel ── */}
      {(open || closing) && (
        <div className={`copilot-panel ${closing ? "closing" : ""}`} role="dialog" aria-label="Business Copilot">
          {/* Header */}
          <div className="copilot-header">
            <div className="copilot-avatar">✦</div>
            <div className="copilot-header-info">
              <p className="copilot-header-title">Business Copilot</p>
              <p className="copilot-header-sub">
                <span className={`copilot-status-dot ${loading ? "busy" : ""}`} />
                {loading ? "Thinking…" : `${roleLabel} AI · Powered by Gemini`}
              </p>
            </div>
            <button className="copilot-close-btn" onClick={handleClose} aria-label="Close">✕</button>
          </div>

          {/* Messages */}
          <div className="copilot-messages" id="copilot-messages">
            {messages.length === 0 ? (
              <div className="copilot-welcome">
                <div className="copilot-welcome-icon">✦</div>
                <h3>Hello, {user?.name?.split(" ")[0] || roleLabel}!</h3>
                <p>
                  I'm your AI-powered Business Copilot. Ask me anything about
                  {isSuperAdmin
                    ? " platform revenue, seller performance, coupons, and more."
                    : " your sales, inventory, profitability, and customers."}
                </p>
                <div className="copilot-welcome-chips">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      className={`copilot-chip ${loading ? "locked" : ""}`}
                      onClick={() => !loading && sendMessage(chip)}
                      disabled={loading}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`copilot-message ${msg.role}`}
                  >
                    <div className="copilot-message-meta">
                      <span className="meta-icon">
                        {msg.role === "user" ? "👤" : "✦"}
                      </span>
                      <span>{msg.role === "user" ? "You" : "Copilot"}</span>
                      <span>· {msg.time}</span>
                    </div>
                    {msg.role === "assistant" && msg.streaming && streamingId === msg.id ? (
                      <StreamedBubble
                        text={msg.text}
                        onDone={() => handleStreamingDone(msg.id)}
                      />
                    ) : (
                      <StaticBubble text={msg.text} />
                    )}
                  </div>
                ))}

                {/* Typing indicator while fetching */}
                {loading && (
                  <div className="copilot-message assistant" style={{ animation: "none" }}>
                    <div className="copilot-message-meta">
                      <span className="meta-icon">✦</span>
                      <span>Copilot</span>
                    </div>
                    <div className="copilot-typing">
                      <span className="copilot-typing-dot" />
                      <span className="copilot-typing-dot" />
                      <span className="copilot-typing-dot" />
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && !loading && (
                  <div className="copilot-error-bubble">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Suggestion chips after first exchange */}
                {messages.length > 0 && !loading && streamingId === null && (
                  <div className="copilot-welcome-chips" style={{ paddingBottom: "4px" }}>
                    {chips.slice(0, 3).map((chip) => (
                      <button
                        key={chip}
                        className="copilot-chip"
                        onClick={() => sendMessage(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="copilot-input-area">
            <div className={`copilot-input-row ${loading ? "locked" : ""}`}>
              <textarea
                ref={textareaRef}
                className="copilot-textarea"
                placeholder={loading ? "Waiting for response…" : "Ask your copilot anything…"}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
                aria-label="Copilot message input"
                id="copilot-input"
              />
              <button
                className="copilot-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                aria-label="Send message"
                id="copilot-send-btn"
              >
                {loading ? (
                  <div className="copilot-spinner" />
                ) : (
                  "➤"
                )}
              </button>
            </div>
            {loading && (
              <div className="copilot-locked-notice">
                <div className="copilot-spinner" />
                <span>Processing your request — please wait…</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessCopilot;