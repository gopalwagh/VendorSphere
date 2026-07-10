import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { sendCopilotMessage } from "../../api/copilotApi";
import { ROLES, normalizeRole } from "../../features/auth/roleUtils";
import { useNavigate } from "react-router-dom";
import "./BusinessCopilotPage.css";

/* ── Suggestion chips ── */
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

/* ── Lightweight markdown renderer ── */
const renderText = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
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

/* ── Streaming text hook ── */
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
    setDisplayed("");
    setDone(false);
    idxRef.current = 0;
    clearInterval(timerRef.current);

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

/* ── Streamed bubble ── */
const StreamedBubble = ({ text, onDone }) => {
  const { displayed, done } = useStreamingText(text, true);
  useEffect(() => { if (done && onDone) onDone(); }, [done, onDone]);
  return (
    <div className="bcp-msg-bubble">
      {renderText(displayed)}
      {!done && <span className="bcp-cursor" />}
    </div>
  );
};

/* ── Static bubble ── */
const StaticBubble = ({ text }) => (
  <div className="bcp-msg-bubble">{renderText(text)}</div>
);

/* ══════════════════════════════════════════
   CHAT SESSION — holds messages for one session
   ══════════════════════════════════════════ */

const HISTORY_PAGE_SIZE = 10;

const BusinessCopilotPage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const normalizedRole = normalizeRole(user?.role);
  const isSuperAdmin = normalizedRole === ROLES.SUPER_ADMIN;
  const isSeller = normalizedRole === ROLES.SELLER;
  const navigate = useNavigate();

  // Redirect if not authorized
  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!isSeller && !isSuperAdmin) { navigate("/"); return; }
    if (isSeller && user?.sellerStatus !== "approved") { navigate("/seller/application"); return; }
  }, [isAuthenticated, isSeller, isSuperAdmin, user?.sellerStatus, navigate]);

  const chips = isSuperAdmin ? ADMIN_CHIPS : SELLER_CHIPS;
  const roleLabel = isSuperAdmin ? "Super Admin" : "Seller";

  /* ── Chat sessions (each session = { id, title, messages[] }) ── */
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem("bcp_sessions");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeSessionId, setActiveSessionId] = useState(null);

  /* ── History pagination ── */
  const [visibleCount, setVisibleCount] = useState(HISTORY_PAGE_SIZE);

  /* ── UI states ── */
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [error, setError] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* ── Light Mode State ── */
  const [isLightMode, setIsLightMode] = useState(() => {
    try {
      return localStorage.getItem("bcp_theme") === "light";
    } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("bcp_theme", isLightMode ? "light" : "dark"); }
    catch { /* quota */ }
  }, [isLightMode]);


  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  /* Persist sessions to localStorage */
  useEffect(() => {
    try { localStorage.setItem("bcp_sessions", JSON.stringify(sessions)); }
    catch { /* quota */ }
  }, [sessions]);

  /* Load messages when session changes */
  useEffect(() => {
    if (activeSessionId) {
      const sess = sessions.find((s) => s.id === activeSessionId);
      setMessages(sess ? sess.messages : []);
    } else {
      setMessages([]);
    }
    setError(null);
    setStreamingId(null);
    // eslint-disable-next-line
  }, [activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  /* ── Start a new session ── */
  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setError(null);
    setStreamingId(null);
    setMobileSidebarOpen(false);
  };

  /* ── Open a past session ── */
  const openSession = (id) => {
    setActiveSessionId(id);
    setMobileSidebarOpen(false);
  };

  /* ── Delete a session ── */
  const deleteSession = (e, id) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      startNewChat();
    }
  };

  /* ── Send message ── */
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || loading) return;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const userMsg = {
        id: Date.now(),
        role: "user",
        text: trimmed,
        time: timeStr,
      };

      let currentSessionId = activeSessionId;

      // Create session if none active
      if (!currentSessionId) {
        currentSessionId = `sess_${Date.now()}`;
        const newSession = {
          id: currentSessionId,
          title: trimmed.length > 42 ? trimmed.slice(0, 42) + "…" : trimmed,
          createdAt: now.toISOString(),
          messages: [],
        };
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(currentSessionId);
      }

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setError(null);
      setLoading(true);

      if (textareaRef.current) textareaRef.current.style.height = "24px";

      // Sync user message into sessions
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: updatedMessages }
            : s
        )
      );

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

        const withAi = [...updatedMessages, aiMsg];
        setMessages(withAi);
        setStreamingId(aiId);

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? { ...s, messages: withAi }
              : s
          )
        );
      } catch (err) {
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;
        let errorText = "Something went wrong. Please try again.";
        if (status === 429) errorText = "Copilot is busy. Please wait a moment.";
        else if (status === 403) errorText = "You don't have access to Business Copilot.";
        else if (serverMsg) errorText = serverMsg;
        setError(errorText);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, activeSessionId, messages]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "24px";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  const handleStreamingDone = useCallback((id) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, streaming: false } : m))
    );
    setStreamingId(null);

    // Persist settled messages
    setMessages((latest) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, messages: latest } : s
        )
      );
      return latest;
    });
  }, [activeSessionId]);

  /* ── Sorted sessions (newest first) & pagination ── */
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const visibleSessions = sortedSessions.slice(0, visibleCount);
  const hasMore = sortedSessions.length > visibleCount;

  const formatRelTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString();
  };

  if (!isAuthenticated || (!isSeller && !isSuperAdmin)) return null;

  return (
    <div className={`bcp-root ${isLightMode ? "light" : ""}`}>
      {/* ── Mobile sidebar overlay ── */}
      {mobileSidebarOpen && (
        <div
          className="bcp-sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ══ LEFT SIDEBAR ══ */}
      <aside className={`bcp-sidebar ${mobileSidebarOpen ? "mobile-open" : ""}`}>
        <div className="bcp-sidebar-header">
          <div className="bcp-brand">
            <div className="bcp-brand-icon">✦</div>
            <div className="bcp-brand-text">
              <h2>Business Copilot</h2>
              <p>Powered by Gemini AI</p>
            </div>
          </div>
          <div className="bcp-sidebar-actions">
            <button className="bcp-new-chat-btn" onClick={startNewChat}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              New Chat
            </button>
            <button className="bcp-theme-btn" onClick={() => setIsLightMode(!isLightMode)} title="Toggle Theme">
              {isLightMode ? "🌙" : "☀️"}
            </button>
          </div>
        </div>

        <div className="bcp-history-section">
          {visibleSessions.length === 0 ? (
            <div className="bcp-history-empty">
              No previous chats yet.<br />Start a conversation!
            </div>
          ) : (
            <>
              <div className="bcp-history-label">Recent Chats</div>
              {visibleSessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`bcp-history-item ${activeSessionId === sess.id ? "active" : ""}`}
                  onClick={() => openSession(sess.id)}
                >
                  <div className="bcp-history-item-content">
                    <div className="bcp-history-item-q">{sess.title}</div>
                    <div className="bcp-history-item-time">{formatRelTime(sess.createdAt)}</div>
                  </div>
                  <button 
                    className="bcp-delete-btn" 
                    onClick={(e) => deleteSession(e, sess.id)}
                    title="Delete Chat"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {hasMore && (
                <button
                  className="bcp-load-more-btn"
                  onClick={() => setVisibleCount((c) => c + HISTORY_PAGE_SIZE)}
                >
                  Load more chats
                </button>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ══ MAIN CHAT AREA ══ */}
      <div className="bcp-main">
        {/* Top bar - Simplified for dashboard layout */}
        <div className="bcp-topbar">
          <div className="bcp-topbar-left">
            <button
              className="bcp-sidebar-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              ☰
            </button>
          </div>
          <div className="bcp-status-indicator">
            <span className={`bcp-status-dot ${loading ? "busy" : ""}`} />
            {loading ? "Thinking…" : "Ready"}
          </div>
        </div>

        {/* Messages */}
        <div className="bcp-messages">
          {messages.length === 0 ? (
            <div className="bcp-welcome">
              <div className="bcp-welcome-icon">✦</div>
              <h2>Hello, {user?.name?.split(" ")[0] || roleLabel}!</h2>
              <p>
                I'm your AI-powered Business Copilot. Ask me anything about
                {isSuperAdmin
                  ? " platform revenue, seller performance, coupons, and more."
                  : " your sales, inventory, profitability, and customers."}
              </p>
              <div className="bcp-chips">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    className="bcp-chip"
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
                  className={`bcp-msg-row ${msg.role}`}
                >
                  <div className="bcp-msg-avatar">
                    {msg.role === "user" ? "👤" : "✦"}
                  </div>
                  <div className="bcp-msg-body">
                    <div className="bcp-msg-meta">
                      <span className="bcp-msg-name">
                        {msg.role === "user" ? (user?.name?.split(" ")[0] || "You") : "Copilot"}
                      </span>
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
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="bcp-msg-row assistant">
                  <div className="bcp-msg-avatar">✦</div>
                  <div className="bcp-msg-body">
                    <div className="bcp-msg-meta">
                      <span className="bcp-msg-name">Copilot</span>
                    </div>
                    <div className="bcp-typing">
                      <span className="bcp-typing-dot" />
                      <span className="bcp-typing-dot" />
                      <span className="bcp-typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div className="bcp-error">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Quick chips */}
              {messages.length > 0 && !loading && streamingId === null && (
                <div className="bcp-inline-chips">
                  {chips.slice(0, 3).map((chip) => (
                    <button
                      key={chip}
                      className="bcp-chip"
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

        {/* Input */}
        <div className="bcp-input-section">
          <div className={`bcp-input-wrap ${loading ? "locked" : ""}`}>
            <textarea
              ref={textareaRef}
              className="bcp-textarea"
              placeholder={loading ? "Waiting for response…" : "Ask your business copilot anything…"}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
              aria-label="Copilot message input"
              id="bcp-input"
            />
            <button
              className="bcp-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              id="bcp-send-btn"
            >
              {loading ? <div className="bcp-spinner" /> : "➤"}
            </button>
          </div>
          {loading && (
            <div className="bcp-locked-notice">
              <div className="bcp-spinner" />
              <span>Processing your request — please wait…</span>
            </div>
          )}
          <div className="bcp-input-hint">
            Press Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCopilotPage;
