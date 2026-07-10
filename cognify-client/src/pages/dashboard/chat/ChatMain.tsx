import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Mic,
  ChevronDown,
  Copy,
  Check,
  Search,
  RotateCcw,
  AlertCircle,
  FileText,
  X,
  Code2,
  TrendingUp,
} from "lucide-react";
import { CognifyIcon } from "../../../../notusComponents/logo";

/* ─── Design tokens ──────────────────────────────────── */
const T = {
  bg: "var(--dash-bg)",
  bgSubtle: "var(--dash-hover)",
  bgHover: "var(--dash-hover)",
  border: "var(--dash-border)",
  borderMd: "var(--dash-border)",
  text0: "var(--dash-text)",
  text1: "var(--dash-muted)",
  text2: "var(--dash-muted)",
  text3: "var(--dash-muted2)",
  orange: "#22D3EE",
  orangeDim: "rgba(34,211,238,0.10)",
  green: "#2d9e6b",
  red: "#dc2626",
  redDim: "rgba(220,38,38,0.08)",
};

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

interface ChatMainProps {
  messages: Message[];
  activeSessionTitle: string;
  selectedAgent: AgentType;
  setSelectedAgent: (agent: AgentType) => void;
  inputText: string;
  setInputText: (text: string) => void;
  onSend: (text?: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  attachedFiles: any[];
  onRemoveFile: (id: string) => void;
  onAttachFileClick: () => void;
  workspaceName: string;
  errorMsg: string | null;
  onRetry: () => void;
}

const AGENTS: Record<AgentType, {
  label: string;
  icon: React.ReactNode;
  model: string;
  placeholder: string;
  description: string;
}> = {
  code: {
    label: "Code Agent",
    icon: <Code2 style={{ width: 13, height: 13 }} />,
    model: "claude-3.5-sonnet",
    placeholder: "Send message to Code Agent…",
    description: "Code-first technical agent for building features",
  },
  research: {
    label: "Research Agent",
    icon: <Search style={{ width: 13, height: 13 }} />,
    model: "claude-3.5-sonnet",
    placeholder: "Send message to Research Agent…",
    description: "Structured research, summaries & data verification",
  },
  business: {
    label: "Business Agent",
    icon: <TrendingUp style={{ width: 13, height: 13 }} />,
    model: "claude-3.5-sonnet",
    placeholder: "Send message to Business Agent…",
    description: "Executive insights, reports & financial models",
  },
};

/* ─── Code block — stays dark for readability ─────── */
const CodeBlock: React.FC<{ lang: string; code: string; blockId: string }> = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const tokenRegex = /(&amp;|&lt;|&gt;|&quot;|&#39;)|(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|import|from|export|default|class|extends|constructor|function|return|async|await|if|else|for|while|try|catch|finally|throw|new|this|true|false|null|undefined|interface|type|string|number|boolean|any|void)\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)(?=\s*\()|(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)/g;

  const highlightedHtml = escaped.replace(
    tokenRegex,
    (match, entity, comment, stringVal, keyword, func, ident) => {
      if (entity) return entity;
      if (comment) return `<span style="color:#6b7280;">${comment}</span>`;
      if (stringVal) return `<span style="color:#86efac;">${stringVal}</span>`;
      if (keyword) return `<span style="color:#22D3EE;">${keyword}</span>`;
      if (func) return `<span style="color:#93c5fd;">${func}</span>`;
      if (ident) return `<span style="color:#d1d5db;">${ident}</span>`;
      return match;
    }
  );

  return (
    <div
      style={{
        margin: "14px 0",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.12)",
        background: "#111111",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#0a0a0a",
        }}
      >
        <span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {lang || "code"}
        </span>
        <button
          onClick={copyCode}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            color: copied ? "#2d9e6b" : "#555",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {copied ? <Check style={{ width: 11, height: 11 }} /> : <Copy style={{ width: 11, height: 11 }} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          padding: "14px 16px",
          overflowX: "auto",
          color: "#d1d5db",
          fontSize: 12.5,
          lineHeight: 1.65,
          fontFamily: "Geist Mono, JetBrains Mono, monospace",
          margin: 0,
        }}
      >
        <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
      </pre>
    </div>
  );
};

/* ─── Message content parser ─────────────────────── */
const MessageContent: React.FC<{ msg: Message }> = ({ msg }) => {
  let content = msg.content;
  const backtickCount = (content.match(/```/g) || []).length;
  if (backtickCount % 2 !== 0) content += "\n```";

  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const lines = part.split("\n");
          const lang = lines[0].replace("```", "").trim();
          const code = lines.slice(1, lines.length - 1).join("\n");
          return <CodeBlock key={i} lang={lang} code={code} blockId={`${msg.id}-${i}`} />;
        }
        if (!part.trim() && i !== parts.length - 1) return null;
        return (
          <p
            key={i}
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              color: T.text1,
              margin: 0,
              userSelect: "text",
            }}
          >
            {part}
            {i === parts.length - 1 && msg.isStreaming && (
              <span
                style={{
                  display: "inline-block",
                  color: T.orange,
                  fontWeight: 800,
                  marginLeft: 2,
                  animation: "pulse 0.8s infinite",
                }}
              >▍</span>
            )}
          </p>
        );
      })}
    </div>
  );
};

/* ─── Main component ─────────────────────────────── */
export const ChatMain: React.FC<ChatMainProps> = ({
  messages,
  selectedAgent,
  setSelectedAgent,
  inputText,
  setInputText,
  onSend,
  isStreaming,
  onStopStreaming,
  attachedFiles,
  onRemoveFile,
  onAttachFileClick,
  workspaceName,
  errorMsg,
  onRetry,
}) => {
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const agent = AGENTS[selectedAgent];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  const isEmpty = messages.length === 0;

  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100%",
        background: T.bg,
        fontFamily: "'Instrument Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');
        .cm-scroll::-webkit-scrollbar { width: 4px; }
        .cm-scroll::-webkit-scrollbar-track { background: transparent; }
        .cm-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
        .cm-range { -webkit-appearance: none; appearance: none; height: 3px; border-radius: 2px; outline: none; cursor: pointer; }
        .cm-range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #22D3EE; cursor: pointer; }
        .cm-range::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #22D3EE; cursor: pointer; border: none; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
      `}</style>

      {/* Top bar */}
      <div
        style={{
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          flexShrink: 0,
          borderBottom: `1px solid ${T.border}`,
          background: T.bg,
        }}
      >
        {/* Workspace pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 20,
            border: `1px solid ${T.border}`,
            fontSize: 12,
            color: T.text1,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.orange, flexShrink: 0 }} />
          <span style={{ fontWeight: 500, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {workspaceName}
          </span>
          <ChevronDown style={{ width: 12, height: 12, color: T.text3 }} />
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Avatar */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: T.orange,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            SH
          </div>
        </div>
      </div>

      {/* Messages canvas */}
      <div className="cm-scroll" style={{ flex: 1, overflowY: "auto", width: "100%" }}>
        {isEmpty ? (
          /* Empty state */
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 24px",
              userSelect: "none",
            }}
          >
            {/* Logo mark */}
            <CognifyIcon size={52} style={{ marginBottom: 20 }} />

            <h2 style={{ fontSize: 22, fontWeight: 600, color: T.text0, textAlign: "center", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              What are you building today?
            </h2>
          </div>
        ) : (
          /* Message list */
          <div style={{ maxWidth: 680, margin: "0 auto", width: "100%", padding: "32px 20px", display: "flex", flexDirection: "column", gap: 28 }}>
            {messages.map((msg) => {
              if (msg.role === "system") {
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: "center" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "Geist Mono, monospace",
                        color: T.text3,
                        padding: "3px 12px",
                        borderRadius: 999,
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      {msg.content}
                    </span>
                  </div>
                );
              }

              if (msg.role === "user") {
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, maxWidth: "68%" }}>
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: "12px 12px 2px 12px",
                          border: `1px solid ${T.border}`,
                          background: T.bgSubtle,
                          fontSize: 14,
                          color: T.text0,
                          lineHeight: 1.6,
                          userSelect: "text",
                        }}
                      >
                        {msg.content}
                      </div>
                      <span style={{ fontSize: 10, color: T.text3 }}>{msg.timestamp}</span>
                    </div>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: T.orange,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0,
                        marginTop: 2,
                        userSelect: "none",
                      }}
                    >
                      ME
                    </div>
                  </div>
                );
              }

              /* AI response */
              const agentLabel = msg.agentType === "code" ? "Code Agent" : msg.agentType === "research" ? "Research Agent" : "Business Agent";
              return (
                <div key={msg.id} style={{ display: "flex", gap: 12 }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: `1.5px solid ${T.orange}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 900,
                      color: T.orange,
                      flexShrink: 0,
                      userSelect: "none",
                      background: T.orangeDim,
                    }}
                  >
                    C
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.orange }}>{agentLabel}</span>
                      <span style={{ fontSize: 10, color: T.text3 }}>{msg.timestamp}</span>
                    </div>

                    <MessageContent msg={msg} />

                    {/* Follow-up pills */}
                    {msg.followUps && !msg.isStreaming && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                        {msg.followUps.map((pill) => (
                          <button
                            key={pill}
                            onClick={() => onSend(pill)}
                            style={{
                              fontSize: 11,
                              color: T.text2,
                              border: `1px solid ${T.border}`,
                              borderRadius: 999,
                              padding: "4px 12px",
                              background: T.bg,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              transition: "border-color 120ms, color 120ms",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.orange; e.currentTarget.style.color = T.orange; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2; }}
                          >
                            {pill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        style={{
          width: "100%",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: T.bg,
          paddingBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <div style={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Attached files */}
          {attachedFiles.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {attachedFiles.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: `1px solid ${T.border}`,
                    fontSize: 11,
                    color: T.text1,
                    background: T.bgSubtle,
                  }}
                >
                  <FileText style={{ width: 12, height: 12, color: T.orange }} />
                  <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.filename}</span>
                  <button
                    onClick={() => onRemoveFile(f.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: T.text3, padding: 0, lineHeight: 1 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = T.red)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = T.text3)}
                  >
                    <X style={{ width: 11, height: 11 }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {errorMsg && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid rgba(220,38,38,0.2)`,
                background: T.redDim,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 12,
                color: T.red,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle style={{ width: 14, height: 14 }} />
                <span>Something went wrong. Try again.</span>
              </div>
              <button
                onClick={onRetry}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 5,
                  border: `1px solid rgba(220,38,38,0.3)`,
                  color: T.red,
                  background: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "inherit",
                }}
              >
                <RotateCcw style={{ width: 11, height: 11 }} />
                Retry
              </button>
            </div>
          )}

          {/* Composer */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: 12,
              border: `1px solid ${T.border}`,
              background: T.bgSubtle,
              transition: "border-color 150ms",
            }}
            onFocus={() => {}}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={agent.placeholder}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: 14,
                color: T.text0,
                padding: "14px 16px 8px",
                minHeight: 52,
                maxHeight: 120,
                caretColor: T.orange,
                fontFamily: "inherit",
                lineHeight: 1.5,
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 12px 10px",
                userSelect: "none",
              }}
            >
              {/* Agent chip */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowAgentDropdown((p) => !p)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
                    borderRadius: 5,
                    border: `1px solid ${T.border}`,
                    background: T.bg,
                    fontSize: 11,
                    color: T.text1,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ color: T.orange }}>{agent.icon}</span>
                  <span>{agent.label}</span>
                  <ChevronDown style={{ width: 10, height: 10, color: T.text3 }} />
                </button>
                {showAgentDropdown && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 20 }} onClick={() => setShowAgentDropdown(false)} />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 6px)",
                        left: 0,
                        background: T.bg,
                        border: `1px solid ${T.borderMd}`,
                        borderRadius: 8,
                        padding: "4px 0",
                        zIndex: 30,
                        minWidth: 170,
                        boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
                      }}
                    >
                      {(Object.entries(AGENTS) as [AgentType, typeof AGENTS[AgentType]][]).map(([type, a]) => (
                        <button
                          key={type}
                          onClick={() => { setSelectedAgent(type); setShowAgentDropdown(false); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: "100%",
                            padding: "8px 14px",
                            fontSize: 13,
                            color: selectedAgent === type ? T.orange : T.text0,
                            background: selectedAgent === type ? T.orangeDim : "transparent",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            fontFamily: "inherit",
                          }}
                          onMouseEnter={(e) => { if (selectedAgent !== type) e.currentTarget.style.background = T.bgSubtle; }}
                          onMouseLeave={(e) => { if (selectedAgent !== type) e.currentTarget.style.background = "transparent"; }}
                        >
                          <span style={{ color: T.orange }}>{a.icon}</span>
                          <span>{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Action icons */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={onAttachFileClick}
                  title="Attach Files"
                  style={{ padding: 6, background: "none", border: "none", cursor: "pointer", color: T.text3, borderRadius: 5 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = T.text1)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = T.text3)}
                >
                  <Paperclip style={{ width: 15, height: 15 }} />
                </button>
                <button
                  title="Voice Input"
                  style={{ padding: 6, background: "none", border: "none", cursor: "pointer", color: T.text3, borderRadius: 5 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = T.text1)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = T.text3)}
                >
                  <Mic style={{ width: 15, height: 15 }} />
                </button>

                {isStreaming ? (
                  <button
                    onClick={onStopStreaming}
                    title="Stop"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: T.red,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 4,
                    }}
                  >
                    <span style={{ width: 12, height: 12, background: "#fff", borderRadius: 2, display: "block" }} />
                  </button>
                ) : (
                  <button
                    onClick={() => onSend()}
                    disabled={!inputText.trim()}
                    title="Send"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: inputText.trim() ? T.orange : T.border,
                      border: "none",
                      cursor: inputText.trim() ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 4,
                      transition: "background 120ms",
                    }}
                  >
                    <Send style={{ width: 13, height: 13, color: inputText.trim() ? "#fff" : T.text3 }} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: T.text3, margin: 0, userSelect: "none" }}>
            Enter to send · Shift+Enter for newline · Drag files to attach
          </p>
        </div>
      </div>
    </main>
  );
};
