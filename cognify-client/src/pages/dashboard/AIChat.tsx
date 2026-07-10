import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./chat/Sidebar";
import { ChatMain } from "./chat/ChatMain";
import { ContextPanel } from "./chat/ContextPanel";
import { WorkspacesView, AgentsView, AnalyticsView } from "./chat/EmbeddedViews";
import { api } from "../../utils/api";
import { Paperclip, Search, X } from "lucide-react";

type AgentType = "code" | "research" | "business";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  agentType?: AgentType;
  isStreaming?: boolean;
  followUps?: string[];
}

interface Session {
  id: string;
  title: string;
  agentType: AgentType;
  timestamp: string;
  lastMessage: string;
}

const SEED_SESSIONS: Session[] = [
  { id: "s1", title: "Express Rate Limiting", agentType: "code", timestamp: "2m ago", lastMessage: "Implement Redis-backed rate limiter" },
  { id: "s2", title: "Market Analysis Q2", agentType: "business", timestamp: "1h ago", lastMessage: "Revenue projections look strong" },
  { id: "s3", title: "Competitor Research", agentType: "research", timestamp: "3h ago", lastMessage: "Linear vs Notion comparison" },
  { id: "s4", title: "Auth Middleware", agentType: "code", timestamp: "Yesterday", lastMessage: "JWT validation strategy" },
];

const SEED_MESSAGES: Message[] = [
  {
    id: "m1",
    role: "user",
    content: "Implement rate limiting for our Express API endpoints using Redis.",
    timestamp: "10:30 AM",
  },
  {
    id: "m2",
    role: "assistant",
    agentType: "code",
    content: "Here's a production-ready rate limiter using `express-rate-limit` with a Redis store:\n\n" +
      "```typescript\n" +
      "import rateLimit from 'express-rate-limit';\n" +
      "import RedisStore from 'rate-limit-redis';\n" +
      "import { createClient } from 'redis';\n\n" +
      "const redis = createClient({ url: process.env.REDIS_URL });\n" +
      "await redis.connect();\n\n" +
      "export const apiLimiter = rateLimit({\n" +
      "  windowMs: 15 * 60 * 1000,  // 15 minutes\n" +
      "  max: 100,\n" +
      "  standardHeaders: true,\n" +
      "  legacyHeaders: false,\n" +
      "  store: new RedisStore({\n" +
      "    sendCommand: (...args: string[]) => redis.sendCommand(args),\n" +
      "  }),\n" +
      "  handler: (req, res) => {\n" +
      "    res.status(429).json({\n" +
      "      error: 'Too many requests',\n" +
      "      retryAfter: res.getHeader('Retry-After'),\n" +
      "    });\n" +
      "  },\n" +
      "});\n" +
      "```\n\n" +
      "Apply to all routes:\n\n" +
      "```typescript\n" +
      "// server.ts\n" +
      "app.use('/api/', apiLimiter);\n" +
      "```\n\n" +
      "For auth routes use a stricter limit:\n\n" +
      "```typescript\n" +
      "export const authLimiter = rateLimit({\n" +
      "  windowMs: 60 * 60 * 1000,  // 1 hour\n" +
      "  max: 10,\n" +
      "  store: new RedisStore({ sendCommand: (...a) => redis.sendCommand(a) }),\n" +
      "});\n\n" +
      "app.use('/api/auth/', authLimiter);\n" +
      "```",
    timestamp: "10:31 AM",
    followUps: ["Audit authController.ts schema", "Add per-user limits", "Show PM2 cluster config"],
  },
];

const STREAM_RESPONSES: Record<AgentType, { content: string; followUps: string[] }> = {
  code: {
    content: "Here's a production-ready solution to rate limiting in Express using Redis:\n\n" +
      "```typescript\n" +
      "import rateLimit from 'express-rate-limit';\n" +
      "import RedisStore from 'rate-limit-redis';\n" +
      "import { createClient } from 'redis';\n\n" +
      "const redis = createClient({ url: process.env.REDIS_URL });\n" +
      "await redis.connect();\n\n" +
      "export const apiLimiter = rateLimit({\n" +
      "  windowMs: 15 * 60 * 1000,  // 15 minutes\n" +
      "  max: 100,\n" +
      "  standardHeaders: true,\n" +
      "  legacyHeaders: false,\n" +
      "  store: new RedisStore({\n" +
      "    sendCommand: (...args: string[]) => redis.sendCommand(args),\n" +
      "  }),\n" +
      "});\n" +
      "```\n\n" +
      "Make sure to run Express with `trust proxy` enabled if you are behind a reverse proxy. Library versions are `express-rate-limit@7.1.0` and `rate-limit-redis@4.0.1`.",
    followUps: ["Audit authController.ts schema", "Add per-user limits", "Show PM2 cluster config"],
  },
  research: {
    content: "### Research & Insights: Rate Limiting Architectures\n\n" +
      "We analyzed rate-limiting mechanisms across modern SaaS infrastructures. Key findings:\n\n" +
      "- **Redis-Backed Limiting**: Best for stateless microservice clusters. Ensures synchronization across PM2 clusters.\n" +
      "- **Token Bucket vs Leaky Bucket**: Leaky bucket is highly suitable for APIs requiring a constant egress rate, whereas token bucket allows bursts.\n" +
      "- **Risk Minimization**: Ensure fallback logic is established so that Redis connection downtime does not block API access.\n\n" +
      "*Reference: Indexed file: API Architecture Docs (v3.1)*",
    followUps: ["Analyze rate limit risks", "Compare Token Bucket to Sliding Window", "Draft fallbacks policy"],
  },
  business: {
    content: "### Executive Summary: Rate Limiting & API Monetization\n\n" +
      "Implementing tier-based rate limiting directly impacts platform profitability and customer retention. Recommendations:\n\n" +
      "| Tier | Daily Limit | Forecasted Q4 Revenue Impact | Est. Churn Reduction |\n" +
      "| :--- | :--- | :--- | :--- |\n" +
      "| **Free** | 1,000 reqs/day | 0% (Base) | +5.0% |\n" +
      "| **Pro** | 50,000 reqs/day | +18.4% growth | +12.5% |\n" +
      "| **Enterprise** | Custom | +34.2% growth | +22.0% |\n\n" +
      "We forecast a **14.2% reduction in server bandwidth costs** in the first 30 days due to protection against credential stuffing attacks.",
    followUps: ["Calculate tier pricing offsets", "Draft Enterprise rate limits", "Generate API cost report"],
  },
};

export const AIChat = () => {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem("chat_sessions");
    if (saved) return JSON.parse(saved);
    return SEED_SESSIONS;
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem("activeSessionId") || "s1";
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`messages_${localStorage.getItem("activeSessionId") || "s1"}`);
    if (saved) return JSON.parse(saved);
    return (localStorage.getItem("activeSessionId") || "s1") === "s1" ? SEED_MESSAGES : [];
  });

  const [inputText, setInputText] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("code");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "work" | "code">("chat");
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [workspaceName, setWorkspaceName] = useState("Personal Work");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!activeWorkspaceId) {
      setWorkspaceFiles([]);
      return;
    }
    const fetchWorkspaceFiles = async () => {
      try {
        const res = await api.get(`/files/${activeWorkspaceId}`);
        setWorkspaceFiles(res.data || []);
      } catch (err) {
        console.error("Failed to load workspace files:", err);
      }
    };
    fetchWorkspaceFiles();
  }, [activeWorkspaceId]);

  const navigate = useNavigate();
  const location = useLocation();

  // Derive active view from current URL on first render
  const viewFromPath = (): "chat" | "workspaces" | "agents" | "analytics" => {
    if (location.pathname.includes("workspaces")) return "workspaces";
    if (location.pathname.includes("agents")) return "agents";
    if (location.pathname.includes("analytics")) return "analytics";
    return "chat";
  };

  // Custom navigation state (rendered directly inside layout)
  const [activeView, setActiveView] = useState<"chat" | "workspaces" | "agents" | "analytics">(viewFromPath);

  // Sync URL whenever activeView changes
  useEffect(() => {
    const pathMap: Record<string, string> = {
      chat: "/dashboard/chat",
      workspaces: "/dashboard/workspaces",
      agents: "/dashboard/agents",
      analytics: "/dashboard/analytics",
    };
    const targetPath = pathMap[activeView];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [activeView]);

  // Accordion Context Panel State
  const [expandedSection, setExpandedSection] = useState<"files" | "memory" | "config">("files");
  const [temperature, setTemperature] = useState(0.2);
  const [ragThreshold, setRagThreshold] = useState(0.82);

  // Search Modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Streaming Controller references
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingTimeoutRef = useRef<any>(null);
  const isCancelledRef = useRef(false);

  // Drag and Drop state
  const [isDragOver, setIsDragOver] = useState(false);

  // Inline error state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastFailedMessageText = useRef<string>("");

  /* Sync workspace config & profile details */
  useEffect(() => {
    const loadUserAndWorkspace = async () => {
      try {
        const savedUserStr = localStorage.getItem("user");
        if (savedUserStr) {
          setUser(JSON.parse(savedUserStr));
        } else {
          const userRes = await api.get("/auth/me").catch(() => null);
          if (userRes?.data) {
            setUser(userRes.data);
            localStorage.setItem("user", JSON.stringify(userRes.data));
          }
        }

        const wsRes = await api.get("/workspaces").catch(() => null);
        if (wsRes?.data?.length) {
          const savedWsId = localStorage.getItem("activeWorkspaceId");
          const activeWs = wsRes.data.find((w: any) => w.id === savedWsId) || wsRes.data[0];
          setWorkspaceName(activeWs.name);
          setActiveWorkspaceId(activeWs.id);
        }
      } catch { }
    };

    loadUserAndWorkspace();

    const onWsChange = () => {
      const savedWsId = localStorage.getItem("activeWorkspaceId");
      setActiveWorkspaceId(savedWsId || "");
      api.get("/workspaces").then((res) => {
        if (res?.data?.length) {
          const activeWs = res.data.find((w: any) => w.id === savedWsId);
          if (activeWs) setWorkspaceName(activeWs.name);
        }
      }).catch(() => { });
    };
    window.addEventListener("activeWorkspaceIdChanged", onWsChange);
    return () => window.removeEventListener("activeWorkspaceIdChanged", onWsChange);
  }, []);

  /* LocalStorage syncing */
  useEffect(() => {
    localStorage.setItem("chat_sessions", JSON.stringify(sessions));
    window.dispatchEvent(new Event("chatSessionsChanged"));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(`messages_${activeSessionId}`, JSON.stringify(messages));
  }, [messages, activeSessionId]);

  useEffect(() => {
    const handleActiveSessionChanged = () => {
      const newId = localStorage.getItem("activeSessionId") || "s1";
      setActiveSessionId(newId);
      const saved = localStorage.getItem(`messages_${newId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages(newId === "s1" ? SEED_MESSAGES : []);
      }
    };
    window.addEventListener("activeSessionIdChanged", handleActiveSessionChanged);
    return () => window.removeEventListener("activeSessionIdChanged", handleActiveSessionChanged);
  }, []);

  /* Keyboard shortcut for Search (⌘K / Ctrl+K) */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearchModal((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* Switch Agent config */
  const switchAgent = (type: AgentType) => {
    setSelectedAgent(type);
    if (type === "code") setTemperature(0.2);
    else if (type === "research") setTemperature(0.5);
    else setTemperature(0.7);
  };

  /* Session navigation selectors */
  const selectSession = (id: string) => {
    localStorage.setItem("activeSessionId", id);
    setActiveSessionId(id);
    window.dispatchEvent(new Event("activeSessionIdChanged"));
    setInputText("");
    setAttachedFiles([]);
    setErrorMsg(null);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    localStorage.removeItem(`messages_${id}`);

    if (activeSessionId === id) {
      const fallbackId = filtered.length > 0 ? filtered[0].id : "s1";
      localStorage.setItem("activeSessionId", fallbackId);
      setActiveSessionId(fallbackId);
      window.dispatchEvent(new Event("activeSessionIdChanged"));
    }
  };

  /* New chat generator */
  const newChat = () => {
    const id = `s-${Date.now()}`;
    const newSession: Session = {
      id,
      title: "New Conversation",
      agentType: selectedAgent,
      timestamp: "Just now",
      lastMessage: "",
    };

    setSessions((prev) => [newSession, ...prev]);
    localStorage.setItem("activeSessionId", id);
    setActiveSessionId(id);
    setMessages([]);
    setInputText("");
    setAttachedFiles([]);
    setErrorMsg(null);
  };

  /* Streaming simulation controller */
  const startStreamingSimulation = useCallback((userText: string) => {
    setIsStreaming(true);
    isCancelledRef.current = false;
    setErrorMsg(null);

    const aId = `a-${Date.now()}`;
    const targetAgent = selectedAgent;
    const responseTemplate = STREAM_RESPONSES[targetAgent];

    const aiMsgPlaceholder: Message = {
      id: aId,
      role: "assistant",
      agentType: targetAgent,
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isStreaming: true,
    };

    setMessages((p) => [...p, aiMsgPlaceholder]);

    const words = responseTemplate.content.split(" ");
    let currentWordIndex = 0;
    let accumulatedContent = "";

    const streamNextWord = () => {
      if (isCancelledRef.current) return;

      if (currentWordIndex < words.length) {
        accumulatedContent += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
        setMessages((p) =>
          p.map((m) => (m.id === aId ? { ...m, content: accumulatedContent } : m))
        );
        currentWordIndex++;
        streamingTimeoutRef.current = setTimeout(streamNextWord, 30);
      } else {
        // Complete streaming
        setMessages((p) =>
          p.map((m) =>
            m.id === aId
              ? {
                ...m,
                content: responseTemplate.content,
                isStreaming: false,
                followUps: responseTemplate.followUps,
              }
              : m
          )
        );
        setIsStreaming(false);

        // Update session's last message and title if it's the first message
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              const updatedTitle = s.title === "New Conversation" ? userText.slice(0, 30) + (userText.length > 30 ? "..." : "") : s.title;
              return { ...s, title: updatedTitle, lastMessage: responseTemplate.content.slice(0, 60), agentType: targetAgent };
            }
            return s;
          })
        );
      }
    };

    streamingTimeoutRef.current = setTimeout(streamNextWord, 200);
  }, [selectedAgent, activeSessionId]);

  /* Stop stream trigger */
  const stopStreaming = () => {
    isCancelledRef.current = true;
    if (streamingTimeoutRef.current) {
      clearTimeout(streamingTimeoutRef.current);
    }
    setIsStreaming(false);
    setMessages((p) => p.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)));
  };

  /* Send message controller */
  const handleSend = useCallback(async (text: string = inputText) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((p) => [...p, userMsg]);
    setInputText("");
    setAttachedFiles([]);
    setErrorMsg(null);
    setIsStreaming(true);
    isCancelledRef.current = false;

    const aId = `a-${Date.now()}`;
    const targetAgent = selectedAgent;

    // Show a loading message
    const aiMsgPlaceholder: Message = {
      id: aId,
      role: "assistant",
      agentType: targetAgent,
      content: "Thinking...",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isStreaming: true,
    };
    setMessages((p) => [...p, aiMsgPlaceholder]);

    try {
      const response = await api.post("/agents/run", {
        message: text,
        workspace_id: activeWorkspaceId || undefined,
        agent_type: targetAgent
      });

      const responseContent = response.data.response;
      const followUps = response.data.followUps || [
        "Audit code syntax",
        "Add error handling",
        "Show alternative approach"
      ];

      // Simulate streaming the actual response from the backend word-by-word
      const words = responseContent.split(" ");
      let currentWordIndex = 0;
      let accumulatedContent = "";

      const streamNextWord = () => {
        if (isCancelledRef.current) return;

        if (currentWordIndex < words.length) {
          accumulatedContent += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
          setMessages((p) =>
            p.map((m) => (m.id === aId ? { ...m, content: accumulatedContent } : m))
          );
          currentWordIndex++;
          streamingTimeoutRef.current = setTimeout(streamNextWord, 20);
        } else {
          // Completed
          setMessages((p) =>
            p.map((m) =>
              m.id === aId
                ? {
                    ...m,
                    content: responseContent,
                    isStreaming: false,
                    followUps,
                  }
                : m
            )
          );
          setIsStreaming(false);

          // Update session details
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === activeSessionId) {
                const updatedTitle = s.title === "New Conversation" ? text.slice(0, 30) + (text.length > 30 ? "..." : "") : s.title;
                return { ...s, title: updatedTitle, lastMessage: responseContent.slice(0, 60), agentType: targetAgent };
              }
              return s;
            })
          );
        }
      };

      streamNextWord();
    } catch (err: any) {
      console.error("AI agent execution failed:", err);
      lastFailedMessageText.current = text;
      setErrorMsg(err.response?.data?.message || "Failed to generate response. Please check backend server.");
      // Remove placeholder on failure
      setMessages((p) => p.filter((m) => m.id !== aId));
      setIsStreaming(false);
    }
  }, [inputText, isStreaming, selectedAgent, activeWorkspaceId, activeSessionId]);

  /* Retry failed send trigger */
  const handleRetry = () => {
    if (!lastFailedMessageText.current) return;
    const textToRetry = lastFailedMessageText.current;
    lastFailedMessageText.current = "";
    setErrorMsg(null);
    handleSend(textToRetry);
  };

  /* File Attach handlers */
  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAttachMockFile = () => { alert("File upload is not connected."); };
/* Drag and Drop DragEvents controllers */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      files.forEach((file) => {
        const id = `drag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setAttachedFiles((p) => [
          ...p,
          { id, filename: file.name, mimetype: file.type || "text/plain", size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` },
        ]);
      });
    }
  };

  /* Search modal filter logic */
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isConversationActive = messages.length > 0;

  /* Render main content based on view selection */
  const renderMainContent = () => {
    switch (activeView) {
      case "workspaces":
        return <WorkspacesView />;
      case "agents":
        return <AgentsView />;
      case "analytics":
        return <AnalyticsView />;

      case "chat":
      default:
        return (
          <ChatMain
            messages={messages}
            activeSessionTitle={sessions.find((s) => s.id === activeSessionId)?.title || "New Chat"}
            selectedAgent={selectedAgent}
            setSelectedAgent={switchAgent}
            inputText={inputText}
            setInputText={setInputText}
            onSend={handleSend}
            isStreaming={isStreaming}
            onStopStreaming={stopStreaming}
            attachedFiles={attachedFiles}
            onRemoveFile={removeAttachedFile}
            onAttachFileClick={handleAttachMockFile}
            workspaceName={workspaceName}
            errorMsg={errorMsg}
            onRetry={handleRetry}
          />
        );
    }
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden text-[var(--dash-text)] bg-[var(--dash-bg)] relative"
      style={{ fontFamily: "'Instrument Sans', 'Inter', sans-serif" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop overlay indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center border-2 border-dashed border-[#22D3EE] bg-[rgba(34,211,238,0.06)] pointer-events-none select-none">
          <div className="flex flex-col items-center gap-3">
            <Paperclip className="h-10 w-10 text-[#22D3EE] animate-bounce" />
            <span className="text-sm font-semibold text-[var(--dash-text)]">
              Drop files to attach to conversation context
            </span>
          </div>
        </div>
      )}

      {/* Search Modal Panel (⌘K) */}
      {showSearchModal && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-[15vh] select-none"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="w-full max-w-[480px] bg-[var(--dash-card-bg)] border border-[rgba(0,0,0,0.12)] rounded-xl overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
          >
            <div className="flex items-center px-4 py-3 border-b border-[rgba(0,0,0,0.08)]">
              <Search className="h-4 w-4 text-[var(--dash-muted2)] mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search recent conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-sm text-[var(--dash-text)] focus:ring-0 placeholder-[#b5b2ae]"
                autoFocus
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-[var(--dash-muted2)] hover:text-[var(--dash-text)] p-1 bg-transparent border-none cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto p-2 flex flex-col gap-0.5">
              {filteredSessions.length === 0 ? (
                <div className="text-xs text-[var(--dash-muted2)] py-4 text-center">No sessions match search query.</div>
              ) : (
                filteredSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      selectSession(s.id);
                      setShowSearchModal(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded text-xs text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)] transition-all cursor-pointer bg-transparent border-none"
                  >
                    <p className="font-medium truncate">{s.title}</p>
                    <p className="text-[10px] text-[var(--dash-muted2)] truncate mt-0.5">{s.lastMessage || "Empty session"}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3-Panel Render System */}

      {/* Sidebar Panel (Left) */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        onNewChat={newChat}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        user={user}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onToggleSearch={() => setShowSearchModal((p) => !p)}
        activeView={activeView}
        onSelectView={setActiveView}
      />

      {/* Main Panel Content Render (Center) */}
      {renderMainContent()}

      {/* Context Panel (Right, Conditional sliding) */}
      {activeView === "chat" && isConversationActive && (
        <ContextPanel
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
          files={attachedFiles}
          onAddFileClick={handleAttachMockFile}
          temperature={temperature}
          setTemperature={setTemperature}
          ragThreshold={ragThreshold}
          setRagThreshold={setRagThreshold}
          selectedAgentModel={STREAM_RESPONSES[selectedAgent] ? "claude-3.5-sonnet" : "claude-3.5-sonnet"}
        />
      )}
    </div>
  );
};
export default AIChat;
