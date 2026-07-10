import React from "react";
import {
  Brain,
  ChevronDown,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  File,
  Plus,
  Sliders,
} from "lucide-react";

/* ─── Design tokens ──────────────────────────────── */
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
  orange: "#22D3EE",
  orangeDim: "rgba(34,211,238,0.10)",
  green: "#2d9e6b",
  greenDim: "rgba(45,158,107,0.10)",
};

interface ContextPanelProps {
  expandedSection: "files" | "memory" | "config";
  setExpandedSection: (section: "files" | "memory" | "config") => void;
  files: Array<{ id: string; filename: string }>;
  onAddFileClick: () => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  ragThreshold: number;
  setRagThreshold: (threshold: number) => void;
  selectedAgentModel: string;
}

const FILE_EXT: Record<string, { color: string; icon: React.ReactNode }> = {
  pdf: { color: "#dc2626", icon: <FileText style={{ width: 13, height: 13 }} /> },
  csv: { color: "#2d9e6b", icon: <FileSpreadsheet style={{ width: 13, height: 13 }} /> },
  xlsx: { color: "#2563eb", icon: <FileSpreadsheet style={{ width: 13, height: 13 }} /> },
  default: { color: "#8f8c88", icon: <File style={{ width: 13, height: 13 }} /> },
};

function getFileStyle(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "md";
  return FILE_EXT[ext] || FILE_EXT["default"];
}

const MEMORY_NODES = [
  { id: "mn1", title: "PR Code Review Context", body: "Linked to backend repo index. Auth middleware reviewed 2h ago.", active: true },
  { id: "mn2", title: "Billing Configuration", body: "Free, Pro ($79), Enterprise plans indexed. Stripe keys stored.", active: true },
  { id: "mn3", title: "API Architecture Docs", body: "OpenAPI spec v3.1. Last synced 6h ago.", active: false },
];

/* ─── Section header button ──────────────────────── */
const SectionBtn: React.FC<{
  label: string;
  open: boolean;
  onClick: () => void;
}> = ({ label, open, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      background: "none",
      border: "none",
      outline: "none",
      cursor: "pointer",
      textAlign: "left",
      flexShrink: 0,
      fontFamily: "'Instrument Sans', 'Inter', system-ui, sans-serif",
    }}
  >
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: open ? T.text0 : T.text2,
      }}
    >
      {label}
    </span>
    {open
      ? <ChevronDown style={{ width: 13, height: 13, color: T.text3 }} />
      : <ChevronRight style={{ width: 13, height: 13, color: T.text3 }} />
    }
  </button>
);

export const ContextPanel: React.FC<ContextPanelProps> = ({
  expandedSection,
  setExpandedSection,
  files,
  onAddFileClick,
  temperature,
  setTemperature,
  ragThreshold,
  setRagThreshold,
  selectedAgentModel,
}) => {
  const toggleSection = (section: "files" | "memory" | "config") => {
    if (expandedSection === section) {
      if (section === "files") setExpandedSection("memory");
      else if (section === "memory") setExpandedSection("config");
      else setExpandedSection("files");
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <aside
      style={{
        width: 240,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderLeft: `1px solid ${T.border}`,
        background: T.bg,
        overflow: "hidden",
        fontFamily: "'Instrument Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        .cp-scroll::-webkit-scrollbar { width: 3px; }
        .cp-scroll::-webkit-scrollbar-track { background: transparent; }
        .cp-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
        .cp-range { -webkit-appearance: none; appearance: none; height: 3px; border-radius: 2px; outline: none; cursor: pointer; flex:1; }
        .cp-range::-webkit-slider-thumb { -webkit-appearance: none; width: 13px; height: 13px; border-radius: 50%; background: #22D3EE; cursor: pointer; }
        .cp-range::-moz-range-thumb { width: 13px; height: 13px; border-radius: 50%; background: #22D3EE; cursor: pointer; border: none; }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          gap: 7,
          flexShrink: 0,
        }}
      >
        <Brain style={{ width: 13, height: 13, color: T.orange }} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.09em",
            color: T.text2,
          }}
        >
          Workspace Context
        </span>
      </div>

      {/* Accordion */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── INDEXED FILES ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderBottom: `1px solid ${T.border}`,
            overflow: "hidden",
            flexShrink: expandedSection === "files" ? 0 : undefined,
            flex: expandedSection === "files" ? 1 : undefined,
            minHeight: expandedSection === "files" ? 160 : undefined,
            transition: "flex 300ms ease",
          }}
        >
          <SectionBtn label="Indexed Files" open={expandedSection === "files"} onClick={() => toggleSection("files")} />
          {expandedSection === "files" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 12px 12px", overflow: "hidden" }}>
              <div className="cp-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
                {files.length === 0 ? (
                  <div style={{ fontSize: 12, color: T.text3, textAlign: "center", padding: "16px 0", fontStyle: "italic" }}>
                    No indexed files.
                  </div>
                ) : (
                  files.map((f) => {
                    const style = getFileStyle(f.filename);
                    return (
                      <div
                        key={f.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                          borderRadius: 6,
                          cursor: "pointer",
                          transition: "background 120ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = T.bgSubtle)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ color: style.color, flexShrink: 0 }}>{style.icon}</span>
                        <span
                          style={{
                            fontSize: 12,
                            color: T.text1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                          }}
                        >
                          {f.filename}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              <button
                onClick={onAddFileClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  marginTop: 8,
                  padding: "7px 0",
                  borderRadius: 6,
                  border: `1px dashed ${T.borderMd}`,
                  fontSize: 11,
                  color: T.text2,
                  background: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  flexShrink: 0,
                  transition: "border-color 120ms, color 120ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.orange; e.currentTarget.style.color = T.orange; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.borderMd; e.currentTarget.style.color = T.text2; }}
              >
                <Plus style={{ width: 11, height: 11 }} />
                Add File
              </button>
            </div>
          )}
        </div>

        {/* ── MEMORY REGISTER ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderBottom: `1px solid ${T.border}`,
            overflow: "hidden",
            flexShrink: expandedSection === "memory" ? 0 : undefined,
            flex: expandedSection === "memory" ? 1 : undefined,
            minHeight: expandedSection === "memory" ? 160 : undefined,
            transition: "flex 300ms ease",
          }}
        >
          <SectionBtn label="Memory Register" open={expandedSection === "memory"} onClick={() => toggleSection("memory")} />
          {expandedSection === "memory" && (
            <div className="cp-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {MEMORY_NODES.map((node) => (
                <div
                  key={node.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1px solid ${T.border}`,
                    borderLeft: `2px solid ${T.orange}`,
                    background: T.bgSubtle,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: node.active ? T.green : T.text3,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 11, fontWeight: 500, color: T.text0 }}>{node.title}</span>
                  </div>
                  <p style={{ fontSize: 10, color: T.text2, lineHeight: 1.5, margin: 0 }}>{node.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── AGENT CONFIG ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: expandedSection === "config" ? 0 : undefined,
            flex: expandedSection === "config" ? 1 : undefined,
            minHeight: expandedSection === "config" ? 160 : undefined,
            transition: "flex 300ms ease",
          }}
        >
          <SectionBtn label="Agent Config" open={expandedSection === "config"} onClick={() => toggleSection("config")} />
          {expandedSection === "config" && (
            <div className="cp-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Target model */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: T.text2 }}>Target Model</span>
                <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: T.text0, fontWeight: 500 }}>
                  {selectedAgentModel}
                </span>
              </div>

              {/* Temperature */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: T.text2 }}>Temperature</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: T.orange, fontWeight: 600 }}>
                    {temperature.toFixed(1)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: T.text3 }}>0.0</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="cp-range"
                    style={{
                      background: `linear-gradient(to right, ${T.orange} ${temperature * 100}%, ${T.border} ${temperature * 100}%)`,
                    }}
                  />
                  <span style={{ fontSize: 10, color: T.text3 }}>1.0</span>
                </div>
              </div>

              {/* RAG threshold */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: T.text2 }}>RAG Threshold</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: T.text0, fontWeight: 500 }}>
                    {ragThreshold.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: T.text3 }}>0.5</span>
                  <input
                    type="range"
                    min={0.5}
                    max={1.0}
                    step={0.01}
                    value={ragThreshold}
                    onChange={(e) => setRagThreshold(parseFloat(e.target.value))}
                    className="cp-range"
                    style={{
                      background: `linear-gradient(to right, ${T.orange} ${((ragThreshold - 0.5) / 0.5) * 100}%, ${T.border} ${((ragThreshold - 0.5) / 0.5) * 100}%)`,
                    }}
                  />
                  <span style={{ fontSize: 10, color: T.text3 }}>1.0</span>
                </div>
              </div>

              {/* Info note */}
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: T.bgSubtle,
                  border: `1px solid ${T.border}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <Sliders style={{ width: 13, height: 13, color: T.orange, flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11, color: T.text2, lineHeight: 1.5 }}>
                  Adjust parameters for prompt creative range and vector similarity retrieval weights.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
