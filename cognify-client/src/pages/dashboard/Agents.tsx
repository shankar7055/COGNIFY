import React, { useState, useRef, useEffect } from "react";
import { api } from "../../utils/api";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Play,
  Upload,
  Trash2,
  FileText,
  X,
} from "lucide-react";

/* ─── Design tokens ──────────────────────────────────────── */
const T = {
  bg: "var(--dash-bg)",
  bgSubtle: "var(--dash-hover)",
  bgCard: "var(--dash-card-bg)",
  bgHover: "var(--dash-hover)",
  border: "var(--dash-border)",
  borderMd: "var(--dash-border)",
  text0: "var(--dash-text)",
  text1: "var(--dash-muted)",
  text2: "var(--dash-muted)",
  text3: "var(--dash-muted2)",
  cyan: "#22D3EE",
  orange: "#22D3EE", // mapping legacy orange to cyan
  orangeDim: "rgba(34,211,238,0.10)",
  orangeBorder: "rgba(34,211,238,0.30)",
  green: "#2d9e6b",
  greenDim: "rgba(45,158,107,0.10)",
  red: "#dc2626",
  redDim: "rgba(220,38,38,0.08)",
};

/* ─── Agent definitions ──────────────────────────────────── */
const AGENTS = [
  {
    id: "agent-1",
    name: "Code Agent",
    iconType: "code",
    successRate: 98.4,
    requests: 1248,
    description: "Backend engineering specialist for architecture, APIs, databases and production systems.",
    systemPrompt:
      "You are an elite software architect and code reviewer. Write concise, optimal, production-ready TS/Python/Go snippets. Always prioritize security, modularity, and error handling. Format code with inline comments. Refuse vague requests — ask for specifics.",
    model: "Claude Sonnet 4",
    temperature: 0.3,
    context: "200K",
    maxTokens: 4096,
    timeout: 30,
    rateLimit: 100,
    scope: "All workspaces",
    tools: {
      "Knowledge Base": true,
      "Web Search": false,
      "Code Execution": true,
      "Slack": false,
      "File Export": true,
    },
  },
  {
    id: "agent-2",
    name: "Research Agent",
    iconType: "research",
    successRate: 96.8,
    requests: 840,
    description: "Deep research specialist for market analysis, literature review, and synthesis.",
    systemPrompt:
      "You are a meticulous research analyst. Synthesize information from multiple sources into clear, structured reports with citations, key metrics, and actionable insights. Always verify facts before presenting conclusions.",
    model: "Claude Sonnet 4",
    temperature: 0.4,
    context: "200K",
    maxTokens: 4096,
    timeout: 45,
    rateLimit: 80,
    scope: "All workspaces",
    tools: {
      "Knowledge Base": true,
      "Web Search": true,
      "Code Execution": false,
      "Slack": false,
      "File Export": true,
    },
  },
  {
    id: "agent-3",
    name: "Business Agent",
    iconType: "business",
    successRate: 94.2,
    requests: 682,
    description: "Executive strategy specialist for financial models, reports, and forecasting.",
    systemPrompt:
      "You are a senior business strategist. Produce structured reports with executive summaries, financial breakdowns, and clear strategic recommendations. Use data-driven insights and present findings in concise, board-ready format.",
    model: "Claude Sonnet 4",
    temperature: 0.5,
    context: "200K",
    maxTokens: 2048,
    timeout: 30,
    rateLimit: 60,
    scope: "All workspaces",
    tools: {
      "Knowledge Base": true,
      "Web Search": true,
      "Code Execution": false,
      "Slack": true,
      "File Export": true,
    },
  },
  {
    id: "agent-4",
    name: "Analytics Agent",
    iconType: "analytics",
    successRate: 97.1,
    requests: 421,
    description: "Data analysis specialist for metrics, visualization specs, and statistical inference.",
    systemPrompt:
      "You are a data analyst. Always respond with structured data, tables, and chart specifications. Break down complex datasets into clear visualizations and statistical summaries. Identify trends and anomalies with precision.",
    model: "Claude Sonnet 4",
    temperature: 0.2,
    context: "200K",
    maxTokens: 4096,
    timeout: 60,
    rateLimit: 120,
    scope: "All workspaces",
    tools: {
      "Knowledge Base": true,
      "Web Search": false,
      "Code Execution": true,
      "Slack": false,
      "File Export": true,
    },
  },
  {
    id: "agent-5",
    name: "General Agent",
    iconType: "general",
    successRate: 91.5,
    requests: 310,
    description: "Generalist assistant for open-ended tasks, writing, and ideation.",
    systemPrompt:
      "You are a helpful general assistant. Adapt your tone and format to the user's needs. Handle a wide range of tasks from writing and editing to planning and brainstorming. Always be concise and actionable.",
    model: "Claude Sonnet 4",
    temperature: 0.7,
    context: "200K",
    maxTokens: 2048,
    timeout: 30,
    rateLimit: 150,
    scope: "All workspaces",
    tools: {
      "Knowledge Base": true,
      "Web Search": true,
      "Code Execution": false,
      "Slack": false,
      "File Export": false,
    },
  },
];

const MODELS = [
  { id: "Claude Sonnet 4", provider: "Anthropic", context: "200K" },
  { id: "Llama 3.3 70b", provider: "Meta", context: "128K" },
  { id: "Deepseek R1", provider: "DeepSeek", context: "64K" },
  { id: "GPT-4o", provider: "OpenAI", context: "128K" },
];

const TOOLS_META: { key: string; label: string; desc: string }[] = [
  { key: "Knowledge Base", label: "Knowledge Base", desc: "Access workspace RAG memory" },
  { key: "Web Search", label: "Web Search", desc: "Real-time lookup via Tavily" },
  { key: "Code Execution", label: "Code Execution", desc: "Run sandboxed code snippets" },
  { key: "Slack", label: "Slack", desc: "Post messages to channels" },
  { key: "File Export", label: "File Export", desc: "Write files to workspace storage" },
];

const PROMPT_CHIPS = [
  { label: "+ Security Rules", text: "\n\nALWAYS apply security best practices: sanitize inputs, validate data types, avoid storing secrets in code, and use parameterized queries." },
  { label: "+ Output Format", text: "\n\nFormat all responses using markdown with clear headings, bullet points, and code blocks where applicable. Keep responses concise and scannable." },
  { label: "+ Language Constraints", text: "\n\nOnly respond in English. Use precise technical terminology appropriate to the domain. Avoid filler phrases and unnecessary qualifiers." },
];

/* ─── Temperature descriptor ─────────────────────────────── */
const getTempDesc = (t: number) => {
  if (t <= 0.2) return "Strict & deterministic";
  if (t <= 0.4) return "Precise & deterministic";
  if (t <= 0.6) return "Balanced";
  if (t <= 0.8) return "Creative & varied";
  return "Experimental";
};

/* ─── Agent icon ─────────────────────────────────────────── */
const AgentIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 28 }) => {
  const s = { color: T.cyan || T.cyan || T.orange, width: size, height: size };
  switch (type) {
    case "code":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case "research":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "business":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case "analytics":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <path d="M12 3c-1.2 5.4-3 8.1-6 9 3 .9 4.8 3.6 6 9 1.2-5.4 3-8.1 6-9-3-.9-4.8-3.6-6-9z" />
          <path d="M5 15c-.8 2.7-1.8 4-3 4.5 1.2.5 2.2 1.8 3 4.5" />
        </svg>
      );
  }
};

/* ─── Toggle switch ──────────────────────────────────────── */
const Toggle: React.FC<{ on: boolean; onChange: () => void }> = ({ on, onChange }) => (
  <button
    onClick={onChange}
    style={{
      width: 36,
      height: 20,
      borderRadius: 10,
      border: "none",
      background: on ? T.cyan || T.orange : "#d1cec9",
      position: "relative",
      cursor: "pointer",
      transition: "background 150ms ease",
      flexShrink: 0,
      padding: 0,
    }}
  >
    <span
      style={{
        position: "absolute",
        top: 2,
        left: on ? 16 : 2,
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 150ms ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }}
    />
  </button>
);

/* ─── Main component ─────────────────────────────────────── */
export const Agents: React.FC = () => {
  const [agents, setAgents] = useState(() =>
    AGENTS.map((a) => ({ ...a, tools: { ...a.tools } }))
  );
  const [selectedId, setSelectedId] = useState(agents[0].id);
  const [search, setSearch] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");
  const [files, setFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const activeWorkspaceId = localStorage.getItem("activeWorkspaceId") || "";
  const agent = agents.find((a) => a.id === selectedId) || agents[0];

  /* load real backend agents */
  useEffect(() => {
    api.get("/agents/types").then((res) => {
      if (res.data?.agents) {
        const backendAgents = res.data.agents;
        setAgents((prevAgents) => {
          const merged = backendAgents.map((bg: any) => {
            const local = prevAgents.find(
              (la) => la.iconType === bg.type || la.name.toLowerCase() === bg.name.toLowerCase()
            );
            if (local) {
              return {
                ...local,
                name: bg.name,
                description: bg.description,
                iconType: bg.type,
              };
            } else {
              return {
                id: `agent-${bg.type}`,
                name: bg.name,
                iconType: bg.type,
                successRate: 95.0,
                requests: 100,
                description: bg.description,
                systemPrompt: `You are a ${bg.name}. ${bg.description}. Respond concisely and professionally.`,
                model: "Claude Sonnet 4",
                temperature: 0.5,
                context: "200K",
                maxTokens: 2048,
                timeout: 30,
                rateLimit: 60,
                scope: "All workspaces",
                tools: {
                  "Knowledge Base": true,
                  "Web Search": true,
                  "Code Execution": false,
                  "Slack": false,
                  "File Export": false,
                },
              };
            }
          });

          // Set selection to first agent if current selected agent is not in merged list
          setTimeout(() => {
            setSelectedId((currentId) => {
              if (merged.some((a: any) => a.id === currentId)) {
                return currentId;
              }
              return merged[0]?.id || "";
            });
          }, 0);

          return merged;
        });
      }
    }).catch((err) => {
      console.error("Failed to load backend agent types", err);
    });
  }, []);

  /* load workspace files */
  useEffect(() => {
    if (!activeWorkspaceId) { setFiles([]); return; }
    api.get(`/files/${activeWorkspaceId}`)
      .then((r) => setFiles(r.data || []))
      .catch(() => setFiles([]));
  }, [activeWorkspaceId]);

  /* close model dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const update = (key: string, value: any) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === selectedId ? { ...a, [key]: value } : a))
    );
    setSaveStatus("unsaved");
  };

  const toggleTool = (key: string) => {
    const updated = { ...agent.tools, [key]: !agent.tools[key as keyof typeof agent.tools] };
    update("tools", updated);
  };

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 1200);
  };

  const handleDiscard = () => {
    const original = AGENTS.find((a) => a.id === selectedId)!;
    setAgents((prev) =>
      prev.map((a) => (a.id === selectedId ? { ...original, tools: { ...original.tools } } : a))
    );
    setSaveStatus("saved");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(agent.systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const appendChip = (text: string) => {
    const next = (agent.systemPrompt + text).slice(0, 2000);
    update("systemPrompt", next);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeWorkspaceId) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspace_id", activeWorkspaceId);
    try {
      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFiles((p) => [res.data, ...p]);
    } catch {}
  };

  const handleDeleteFile = async (id: string) => {
    try {
      await api.delete(`/files/${id}`);
      setFiles((p) => p.filter((f) => f.id !== id));
    } catch {}
  };

  const handleResetDefaults = () => {
    const original = AGENTS.find((a) => a.id === selectedId)!;
    setAgents((prev) =>
      prev.map((a) => (a.id === selectedId ? { ...original, tools: { ...original.tools } } : a))
    );
    setSaveStatus("unsaved");
  };

  const handleDeleteAgent = () => {
    if (!window.confirm(`Delete ${agent.name}?`)) return;
    const remaining = agents.filter((a) => a.id !== selectedId);
    setAgents(remaining);
    if (remaining.length > 0) setSelectedId(remaining[0].id);
  };

  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const promptLen = agent.systemPrompt.length;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: T.bg,
        fontFamily: "'Instrument Sans', 'Inter', system-ui, sans-serif",
        color: T.text0,
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');
        .ag-mono { font-family: 'Geist Mono', 'Fira Mono', monospace; }
        .ag-scroll::-webkit-scrollbar { width: 4px; }
        .ag-scroll::-webkit-scrollbar-track { background: transparent; }
        .ag-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
        .ag-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.1) transparent; }
        .ag-range { -webkit-appearance: none; appearance: none; height: 3px; border-radius: 2px; outline: none; cursor: pointer; }
        .ag-range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #22D3EE; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .ag-range::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #22D3EE; cursor: pointer; border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .ag-input { outline: none; transition: border-color 150ms, background 150ms; }
        .ag-input:focus { border-color: rgba(0,0,0,0.14) !important; background: #fff !important; }
        .ag-textarea { outline: none; transition: border-color 150ms, background 150ms; resize: none; }
        .ag-textarea:focus { border-color: rgba(0,0,0,0.14) !important; background: #fff !important; }
        .ag-btn-text { background: none; border: none; cursor: pointer; font-family: inherit; }
        .ag-btn-text:hover { color: #0f0e0d; }
        .ag-agent-item:hover { background: #f7f6f3; }
        .ag-chip:hover { background: #eeede9 !important; border-color: rgba(0,0,0,0.14) !important; color: #0f0e0d !important; }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <aside
        style={{
          width: 280,
          flexShrink: 0,
          borderRight: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: T.bg,
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 20px 16px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>Platform Agents</div>
          <div style={{ fontSize: 13, color: T.text2, marginTop: 3, lineHeight: 1.5 }}>
            Configure behavior guidelines, model defaults, and tool settings.
          </div>
        </div>

        {/* Search */}
        <div style={{ margin: "0 16px 12px", position: "relative" }}>
          <Search
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 14,
              color: T.text2,
            }}
          />
          <input
            className="ag-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents…"
            style={{
              width: "100%",
              height: 34,
              paddingLeft: 32,
              paddingRight: 10,
              background: T.bgSubtle,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              fontSize: 13,
              color: T.text2,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Agent list */}
        <div className="ag-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
          {filteredAgents.map((a) => {
            const isActive = a.id === selectedId;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className="ag-agent-item"
                style={{
                  display: "block",
                  width: "100%",
                  padding: isActive ? "10px 12px 10px 10px" : "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: isActive ? T.bgSubtle : "transparent",
                  borderLeft: isActive ? `2px solid ${T.cyan || T.orange}` : "2px solid transparent",
                  border: isActive ? `none` : "none",
                  borderLeftColor: isActive ? (T.cyan || T.cyan || T.orange) : "transparent",
                  borderLeftWidth: 2,
                  borderLeftStyle: "solid",
                  textAlign: "left",
                  transition: "background 120ms",
                  marginBottom: 2,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <ChevronRight
                      style={{
                        width: 10,
                        height: 10,
                        color: T.cyan || T.cyan || T.orange,
                        opacity: isActive ? 1 : 0,
                        flexShrink: 0,
                        transition: "opacity 120ms",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: isActive ? T.text0 : T.text1,
                      }}
                    >
                      {a.name}
                    </span>
                  </div>
                  <span className="ag-mono" style={{ fontSize: 13, fontWeight: 500, color: T.text0 }}>
                    {a.successRate}%
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: T.green,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, color: T.text2 }}>Active</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Create agent */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <button
            className="ag-btn-text"
            style={{ fontSize: 13, color: T.text2, padding: 0 }}
          >
            + Create Agent
          </button>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          background: T.bg,
        }}
      >
        {/* Panel header */}
        <div style={{ padding: "28px 32px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              {/* Icon */}
              <div style={{ marginBottom: 8 }}>
                <AgentIcon type={agent.iconType} size={28} />
              </div>

              {/* Name */}
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: T.text0,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {agent.name}
              </h1>

              {/* Description */}
              <p
                style={{
                  fontSize: 14,
                  color: T.text1,
                  marginTop: 4,
                  lineHeight: 1.5,
                  marginBottom: 0,
                }}
              >
                {agent.description}
              </p>

              {/* Status bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 12,
                  fontSize: 13,
                  color: T.text1,
                }}
              >
                <span
                  style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, flexShrink: 0 }}
                />
                <span>Active</span>
                <span style={{ color: T.text3 }}>·</span>
                <span className="ag-mono">{agent.successRate}%</span>
                <span style={{ color: T.text1 }}>Success Rate</span>
                <span style={{ color: T.text3 }}>·</span>
                <span className="ag-mono">{agent.requests.toLocaleString()}</span>
                <span style={{ color: T.text1 }}>Requests</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 4 }}>
              <button
                className="ag-btn-text"
                onClick={handleCopyPrompt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: T.text2,
                }}
              >
                {copied ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                {copied ? "Copied" : "Copy Prompt"}
              </button>
              <button
                className="ag-btn-text"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: T.cyan || T.cyan || T.orange,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                <Play style={{ width: 12, height: 12, fill: T.cyan || T.orange }} />
                Test Agent
              </button>
            </div>
          </div>
        </div>

        {/* Config bar */}
        <div
          style={{
            padding: "20px 32px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 0,
            flexShrink: 0,
          }}
        >
          {/* Model */}
          <div style={{ position: "relative" }} ref={modelDropdownRef}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: T.text2 }}>Model:</span>
              <button
                className="ag-btn-text"
                onClick={() => setShowModelDropdown((p) => !p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: 0,
                  color: T.text0,
                }}
              >
                <span className="ag-mono" style={{ fontSize: 13, fontWeight: 500 }}>
                  {agent.model}
                </span>
                <ChevronDown style={{ width: 12, height: 12, color: T.text2 }} />
              </button>
            </div>
            {showModelDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  background: T.bg,
                  border: `1px solid ${T.borderMd}`,
                  borderRadius: 8,
                  padding: "4px 0",
                  zIndex: 100,
                  minWidth: 200,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}
              >
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    className="ag-btn-text"
                    onClick={() => { update("model", m.id); setShowModelDropdown(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "8px 14px",
                      fontSize: 13,
                      color: agent.model === m.id ? T.cyan || T.orange : T.text0,
                      background: agent.model === m.id ? T.cyan || T.orangeDim : "transparent",
                    }}
                    onMouseEnter={(e) => { if (agent.model !== m.id) e.currentTarget.style.background = T.bgSubtle; }}
                    onMouseLeave={(e) => { if (agent.model !== m.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span className="ag-mono">{m.id}</span>
                    <span style={{ fontSize: 11, color: T.text2 }}>{m.context}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: T.border, margin: "0 24px" }} />

          {/* Temperature */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: T.text2, whiteSpace: "nowrap" }}>Temperature:</span>
            <span className="ag-mono" style={{ fontSize: 14, fontWeight: 600, color: T.text0, minWidth: 24 }}>
              {agent.temperature.toFixed(1)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={agent.temperature}
              onChange={(e) => update("temperature", parseFloat(e.target.value))}
              className="ag-range"
              style={{
                width: 120,
                background: `linear-gradient(to right, ${T.cyan || T.orange} ${agent.temperature * 100}%, ${T.border} ${agent.temperature * 100}%)`,
              }}
            />
            <span style={{ fontSize: 12, color: T.text2, fontStyle: "italic", whiteSpace: "nowrap" }}>
              ({getTempDesc(agent.temperature)})
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: T.border, margin: "0 24px" }} />

          {/* Context */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: T.text2 }}>Context:</span>
            <span className="ag-mono" style={{ fontSize: 14, fontWeight: 600, color: T.text0 }}>
              {agent.context}
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="ag-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "24px 32px 0" }}
        >
          {/* ── SYSTEM PROMPT ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: T.text2,
                }}
              >
                System Prompt
              </span>
              <span className="ag-mono" style={{ fontSize: 11, color: T.text2 }}>
                {promptLen} / 2,000
              </span>
            </div>
            <textarea
              className="ag-textarea"
              value={agent.systemPrompt}
              onChange={(e) => update("systemPrompt", e.target.value.slice(0, 2000))}
              style={{
                width: "100%",
                minHeight: 180,
                background: T.bgSubtle,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "14px 16px",
                fontSize: 14,
                color: T.text0,
                lineHeight: 1.65,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {PROMPT_CHIPS.map((c) => (
                <button
                  key={c.label}
                  onClick={() => appendChip(c.text)}
                  className="ag-btn-text ag-chip"
                  style={{
                    padding: "5px 11px",
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 999,
                    fontSize: 12,
                    color: T.text2,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: T.border, margin: "24px 0" }} />

          {/* ── KNOWLEDGE BASE ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: T.text2 }}>
                Knowledge Base
              </span>
              <button
                className="ag-btn-text"
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: 12, color: T.cyan || T.cyan || T.orange, display: "flex", alignItems: "center", gap: 4 }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                <Upload style={{ width: 12, height: 12 }} />
                Upload Files
              </button>
              <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileUpload} />
            </div>
            {files.length === 0 ? (
              <p style={{ fontSize: 13, color: T.text2, fontStyle: "italic", padding: "12px 0", margin: 0 }}>
                No documents uploaded to this workspace.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {files.map((f: any) => (
                  <div
                    key={f.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      background: T.bgSubtle,
                      borderRadius: 6,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <FileText style={{ width: 14, height: 14, color: T.text2 }} />
                      <span style={{ fontSize: 13, color: T.text0 }}>
                        {f.original_name || f.filename}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: T.text2 }}>
                        {f.size ? `${(f.size / (1024 * 1024)).toFixed(2)} MB` : "—"}
                      </span>
                      <button
                        className="ag-btn-text"
                        onClick={() => handleDeleteFile(f.id)}
                        style={{ color: T.text3, padding: 2 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = T.red)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = T.text3)}
                      >
                        <X style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: T.border, margin: "24px 0" }} />

          {/* ── TOOLS ── */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: T.text2 }}>
              Tools
            </span>
            <div style={{ marginTop: 12 }}>
              {TOOLS_META.map((tool, i) => (
                <div
                  key={tool.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "11px 0",
                    borderBottom: i < TOOLS_META.length - 1 ? `1px solid ${T.border}` : "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text0 }}>{tool.label}</div>
                    <div style={{ fontSize: 12, color: T.text2, marginTop: 2 }}>{tool.desc}</div>
                  </div>
                  <Toggle
                    on={!!agent.tools[tool.key as keyof typeof agent.tools]}
                    onChange={() => toggleTool(tool.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: T.border, margin: "24px 0" }} />

          {/* ── CONSTRAINTS ── */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: T.text2 }}>
              Constraints
            </span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px 20px",
                marginTop: 14,
              }}
            >
              {[
                { label: "Max response tokens", key: "maxTokens", unit: "tokens" },
                { label: "Request timeout", key: "timeout", unit: "seconds" },
                { label: "Rate limit", key: "rateLimit", unit: "req / min" },
              ].map((f) => (
                <div key={f.key}>
                  <div style={{ fontSize: 11, color: T.text2, marginBottom: 6 }}>{f.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      className="ag-input ag-mono"
                      type="number"
                      value={(agent as any)[f.key]}
                      onChange={(e) => update(f.key, parseInt(e.target.value) || 0)}
                      style={{
                        width: 80,
                        height: 34,
                        background: T.bgSubtle,
                        border: `1px solid ${T.border}`,
                        borderRadius: 6,
                        fontSize: 13,
                        color: T.text0,
                        textAlign: "center",
                        fontFamily: "'Geist Mono', monospace",
                        boxSizing: "border-box",
                      }}
                    />
                    <span style={{ fontSize: 12, color: T.text2 }}>{f.unit}</span>
                  </div>
                </div>
              ))}
              <div>
                <div style={{ fontSize: 11, color: T.text2, marginBottom: 6 }}>Workspace scope</div>
                <select
                  className="ag-input ag-mono"
                  value={agent.scope}
                  onChange={(e) => update("scope", e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    background: T.bgSubtle,
                    border: `1px solid ${T.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    color: T.text0,
                    fontFamily: "'Geist Mono', monospace",
                    paddingLeft: 10,
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <option>All workspaces</option>
                  <option>Current workspace</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Divider — red tint */}
          <div style={{ height: 1, background: "rgba(220,38,38,0.15)", margin: "24px 0" }} />

          {/* ── DANGER ZONE ── */}
          <div style={{ marginBottom: 80 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: T.red,
              }}
            >
              Danger Zone
            </span>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                className="ag-btn-text"
                onClick={handleResetDefaults}
                style={{
                  fontSize: 12,
                  color: T.red,
                  background: T.redDim,
                  border: "1px solid rgba(220,38,38,0.2)",
                  borderRadius: 6,
                  padding: "6px 14px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.red)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(220,38,38,0.2)")}
              >
                Reset to defaults
              </button>
              <button
                className="ag-btn-text"
                onClick={handleDeleteAgent}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: T.red,
                  background: T.redDim,
                  border: "1px solid rgba(220,38,38,0.2)",
                  borderRadius: 6,
                  padding: "6px 14px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.red)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(220,38,38,0.2)")}
              >
                <Trash2 style={{ width: 12, height: 12 }} />
                Delete agent
              </button>
            </div>
          </div>
        </div>

        {/* ── STICKY SAVE BAR ── */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: T.bg,
            borderTop: `1px solid ${T.border}`,
            padding: "12px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          {/* Status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: saveStatus === "saved" ? T.green : T.cyan || T.orange,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: saveStatus === "saved" ? T.text2 : T.text1,
              }}
            >
              {saveStatus === "saved" ? "All changes saved" : "Unsaved changes"}
            </span>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="ag-btn-text"
              onClick={handleDiscard}
              style={{ fontSize: 13, color: T.text2, padding: "0 4px" }}
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              style={{
                height: 36,
                padding: "0 20px",
                background: saveStatus === "saving" ? T.green : T.cyan || T.orange,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 150ms",
              }}
              onMouseEnter={(e) => { if (saveStatus !== "saving") e.currentTarget.style.background = "#d4612a"; }}
              onMouseLeave={(e) => { if (saveStatus !== "saving") e.currentTarget.style.background = T.cyan || T.orange; }}
            >
              {saveStatus === "saving" ? "Saved ✓" : "Save Configuration"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Agents;
