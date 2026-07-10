import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Activity,
  Coins,
  Clock,
  DollarSign,
  Users,
  FolderOpen,
  Plus,
  Trash2,
  CheckCircle,
  Copy,
  Check,
  CreditCard,
  Download,
  Bot,
  Terminal,
  ChevronRight,
  FileText,
} from "lucide-react";
import { api } from "../../../utils/api";
import { Agents as AgentsView } from "../Agents";
import { Analytics as AnalyticsView } from "../Analytics";
import { Files } from "../Files";
import { Workflows } from "../Workflows";
import { Memory } from "../Memory";
import { Collaboration } from "../Collaboration";

export { AnalyticsView };

/* ─── Design tokens ──────────────────────────────────────── */
const WT = {
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
  orangeBorder: "rgba(34,211,238,0.30)",
  green: "#2d9e6b",
};

export const WorkspacesView: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "files" | "workflows" | "memory" | "collaboration" | "members" | "settings">("overview");

  // Workspace creation modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");

  useEffect(() => {
    if (!selectedWsId) { setFiles([]); return; }
    api.get(`/files/${selectedWsId}`)
      .then((res) => setFiles(res.data.map((f: any) => ({
        id: f.id,
        filename: f.original_name || f.filename,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      }))))
      .catch(() => setFiles([]));
  }, [selectedWsId]);

  useEffect(() => {
    api.get("/teams/my-teams")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setTeamMembers(res.data.map((tm: any) => ({
            id: tm.id,
            name: tm.team?.name || "Team Member",
            role: tm.role || "Viewer",
          })));
        } else {
          setTeamMembers([]);
        }
      })
      .catch(() => setTeamMembers([]));
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await api.get("/workspaces");
      setWorkspaces(res.data);
      if (res.data.length > 0) {
        const saved = localStorage.getItem("activeWorkspaceId") || res.data[0].id;
        setSelectedWsId(saved);
      }
    } catch (err) {
      console.error("Failed to fetch workspaces", err);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkspaces(); }, []);

  const selectedWs = workspaces.find((w) => w.id === selectedWsId);

  const selectedWsMembers = React.useMemo(() => {
    if (!selectedWs) return [];
    const collaboratorsMap = new Map<string, any>();
    
    // Owner
    if (selectedWs.user) {
      collaboratorsMap.set(selectedWs.user.id, {
        id: selectedWs.user.id,
        name: selectedWs.user.name || selectedWs.user.email.split("@")[0],
        email: selectedWs.user.email,
        role: "ADMIN",
        isOwner: true,
        initials: (selectedWs.user.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
      });
    }

    // Team members who have access
    selectedWs.team_workspaces?.forEach((tw: any) => {
      tw.team?.members?.forEach((m: any) => {
        if (m.user) {
          const u = m.user;
          if (!collaboratorsMap.has(u.id)) {
            collaboratorsMap.set(u.id, {
              id: m.id,
              name: u.name || u.email.split("@")[0],
              email: u.email,
              role: m.role || "VIEWER",
              isOwner: false,
              initials: (u.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
            });
          }
        }
      });
    });

    return Array.from(collaboratorsMap.values());
  }, [selectedWs]);

  const handleSwitchWorkspace = (id: string) => {
    setSelectedWsId(id);
    localStorage.setItem("activeWorkspaceId", id);
    window.dispatchEvent(new Event("activeWorkspaceIdChanged"));
    setActiveTab("overview");
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    try {
      const res = await api.post("/workspaces", {
        name: newWsName,
        description: newWsDesc,
      });
      const newWs = res.data;
      setWorkspaces((prev) => [newWs, ...prev]);
      setSelectedWsId(newWs.id);
      localStorage.setItem("activeWorkspaceId", newWs.id);

      setNewWsName("");
      setNewWsDesc("");
      setShowCreateModal(false);

      // Trigger workspace layout refresh
      window.dispatchEvent(new Event("workspacesChanged"));
      window.dispatchEvent(new Event("activeWorkspaceIdChanged"));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create workspace");
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        height: "100%",
        overflow: "hidden",
        background: WT.bg,
        fontFamily: "'Instrument Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');
        .ws-scroll::-webkit-scrollbar { width: 4px; }
        .ws-scroll::-webkit-scrollbar-track { background: transparent; }
        .ws-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
        
        @container (max-width: 900px) {
          .lg\\:grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .lg\\:col-span-2 {
            grid-column: span 2 / span 2 !important;
          }
          .lg\\:col-span-1 {
            grid-column: span 1 / span 1 !important;
          }
        }
        @container (max-width: 680px) {
          .lg\\:grid-cols-4, .lg\\:grid-cols-3, .md\\:grid-cols-3 {
            grid-template-columns: 1fr !important;
          }
          .lg\\:col-span-2, .lg\\:col-span-3, .md\\:col-span-2, .lg\\:col-span-1 {
            grid-column: span 1 / span 1 !important;
          }
        }
      `}</style>

      {/* ── LEFT: Workspace list ── */}
      <div
        className="ws-scroll"
        style={{
          width: "300px",
          height: "100%",
          padding: "28px 24px",
          borderRight: `1px solid ${WT.border}`,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: WT.text0, margin: 0, letterSpacing: "-0.01em" }}>
              Workspaces
            </h1>
            <p style={{ fontSize: 13, color: WT.text2, margin: "4px 0 0", lineHeight: 1.5 }}>
              Manage active platform segments.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 13px",
              borderRadius: 7,
              border: `1px solid ${WT.border}`,
              background: WT.bgSubtle,
              fontSize: 12,
              fontWeight: 500,
              color: WT.text0,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 120ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = WT.orange)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = WT.border)}
          >
            <Plus style={{ width: 13, height: 13 }} />
            Create
          </button>
        </div>

        {/* Workspace list */}
        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: 22,
                height: 22,
                border: `2px solid ${WT.border}`,
                borderTopColor: WT.orange,
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {workspaces.map((ws) => {
              const isSelected = selectedWsId === ws.id;
              return (
                <div
                  key={ws.id}
                  onClick={() => handleSwitchWorkspace(ws.id)}
                  style={{
                    padding: isSelected ? "14px 14px 14px 12px" : "14px",
                    borderRadius: 10,
                    border: `1px solid ${isSelected ? WT.orange : WT.border}`,
                    borderLeft: `${isSelected ? 2 : 1}px solid ${isSelected ? WT.orange : WT.border}`,
                    background: isSelected ? WT.orangeDim : WT.bgSubtle,
                    cursor: "pointer",
                    transition: "border-color 120ms, background 120ms",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = WT.bgHover; (e.currentTarget as HTMLElement).style.borderColor = WT.borderMd; } }}
                  onMouseLeave={(e) => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = WT.bgSubtle; (e.currentTarget as HTMLElement).style.borderColor = WT.border; } }}
                >
                  <p style={{ fontSize: 14, fontWeight: 500, color: isSelected ? WT.orange : WT.text0, margin: 0, transition: "color 120ms" }}>
                    {ws.name}
                  </p>
                  <p style={{ fontSize: 12, color: WT.text2, margin: "3px 0 0", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ws.description}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, fontSize: 11, color: WT.text3 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Users style={{ width: 11, height: 11 }} />
                      {ws.membersCount || 0} members
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <FolderOpen style={{ width: 11, height: 11 }} />
                      {ws.filesCount || 0} files
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── RIGHT: Workspace detail ── */}
      <div
        style={{
          flex: 1,
          height: "100%",
          padding: "28px 24px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          containerType: "inline-size",
        }}
      >
        {selectedWs ? (
          <>
            {/* Workspace hero */}
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 650,
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                  color: WT.orange,
                }}
              >
                Active Workspace
              </span>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: WT.text0,
                  margin: "6px 0 0",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                }}
              >
                {selectedWs.name}
              </h2>
              <p style={{ fontSize: 13, color: WT.text1, lineHeight: 1.6, margin: "8px 0 0" }}>
                {selectedWs.description || "No description provided."}
              </p>
            </div>

            {/* Notion-style Tab Navigation (Horizontal) */}
            <div
              style={{
                display: "flex",
                borderBottom: `1px solid ${WT.border}`,
                marginBottom: 20,
                overflowX: "auto",
                whiteSpace: "nowrap",
                gap: 8,
                position: "relative",
                zIndex: 10,
                backgroundColor: WT.bg,
              }}
              className="scrollbar-none"
            >
              {[
                { id: "overview", label: "Overview" },
                { id: "files", label: "Files" },
                { id: "workflows", label: "Workflows" },
                { id: "memory", label: "Memory" },
                { id: "collaboration", label: "Collaboration" },
                { id: "members", label: "Members" },
                { id: "settings", label: "Settings" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      padding: "10px 14px",
                      border: "none",
                      borderBottom: `2px solid ${isActive ? WT.orange : "transparent"}`,
                      background: "transparent",
                      fontSize: 12.5,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? WT.orange : WT.text1,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 120ms",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content area */}
            <div 
              className="ws-scroll" 
              style={{ 
                flex: 1, 
                display: "flex", 
                flexDirection: "column", 
                overflowY: "auto", 
                position: "relative" 
              }}
            >
              {activeTab === "overview" && (
                <>
                  {/* Stats row */}
                  <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                    {[
                      { label: "Members", value: selectedWs.membersCount || 0, icon: <Users style={{ width: 12, height: 12 }} /> },
                      { label: "Files", value: selectedWs.filesCount || 0, icon: <FolderOpen style={{ width: 12, height: 12 }} /> },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: `1px solid ${WT.border}`,
                          background: WT.bgSubtle,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ color: WT.text2 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 650, color: WT.text0, fontFamily: "Geist Mono, monospace", lineHeight: 1 }}>
                            {s.value}
                          </div>
                          <div style={{ fontSize: 10, color: WT.text2, marginTop: 2 }}>{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: WT.border, marginBottom: 24 }} />

                  {/* Context files section */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 650,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          color: WT.text2,
                        }}
                      >
                        Context Files
                      </span>
                      <button
                        onClick={() => setActiveTab("files")}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: WT.orange,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Manage Files
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {files.length > 0 ? (
                        files.slice(0, 5).map((f) => (
                          <div
                            key={f.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "9px 12px",
                              borderRadius: 7,
                              border: `1px solid ${WT.border}`,
                              background: WT.bgSubtle,
                              transition: "border-color 120ms, background 120ms",
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = WT.bgHover; (e.currentTarget as HTMLElement).style.borderColor = WT.borderMd; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = WT.bgSubtle; (e.currentTarget as HTMLElement).style.borderColor = WT.border; }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <FileText style={{ width: 13, height: 13, color: WT.orange }} />
                              <span style={{ fontSize: 13, color: WT.text0, fontWeight: 500 }}>{f.filename}</span>
                            </div>
                            <span style={{ fontSize: 11, color: WT.text3, fontFamily: "Geist Mono, monospace" }}>{f.size}</span>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: 13, color: WT.text2, fontStyle: "italic", margin: 0, padding: "8px 0" }}>
                          No files in this workspace.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: WT.border, marginBottom: 24 }} />

                  {/* Team access section */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 650,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          color: WT.text2,
                        }}
                      >
                        Team Access
                      </span>
                      <button
                        onClick={() => setActiveTab("collaboration")}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: WT.orange,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Manage Teams
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {selectedWsMembers.length > 0 ? (
                        selectedWsMembers.slice(0, 5).map((m) => (
                          <div
                            key={m.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "9px 12px",
                              borderRadius: 7,
                              border: `1px solid ${WT.border}`,
                              background: WT.bgSubtle,
                            }}
                          >
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: WT.bgCard,
                                border: `1px solid ${WT.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 700,
                                color: WT.text1,
                                flexShrink: 0,
                              }}
                            >
                              {m.initials}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: WT.text0 }}>{m.name} {m.isOwner && "(Owner)"}</div>
                              <div style={{ fontSize: 11, color: WT.text2, marginTop: 1 }}>{m.role}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: 13, color: WT.text2, fontStyle: "italic", margin: 0, padding: "8px 0" }}>
                          No team members.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "files" && <Files />}
              {activeTab === "workflows" && <Workflows />}
              {activeTab === "memory" && <Memory />}
              {activeTab === "collaboration" && <Collaboration />}
              
              {activeTab === "members" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${WT.border}`, paddingBottom: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: WT.text0, margin: 0 }}>Collaborator List</h3>
                    <button
                      onClick={() => setActiveTab("collaboration")}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 8,
                        border: `1px solid ${WT.border}`,
                        background: WT.orangeDim,
                        color: WT.orange,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit"
                      }}
                    >
                      Manage Teams & Sharing
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(() => {
                      const collaboratorsMap = new Map<string, any>();
                      
                      // Owner
                      if (selectedWs.user) {
                        collaboratorsMap.set(selectedWs.user.id, {
                          id: selectedWs.user.id,
                          name: selectedWs.user.name || "Workspace Owner",
                          email: selectedWs.user.email,
                          role: "OWNER"
                        });
                      }

                      // Team members who have access
                      selectedWs.team_workspaces?.forEach((tw: any) => {
                        tw.team?.members?.forEach((m: any) => {
                          if (m.user) {
                            collaboratorsMap.set(m.user.id, {
                              id: m.user.id,
                              name: m.user.name,
                              email: m.user.email,
                              role: m.role
                            });
                          }
                        });
                      });

                      const list = Array.from(collaboratorsMap.values());
                      if (list.length === 0) {
                        return <div style={{ textAlign: "center", color: WT.text2, fontSize: 12, fontStyle: "italic", padding: "12px 0" }}>No collaborator profiles found.</div>;
                      }

                      return list.map((member) => (
                        <div
                          key={member.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: `1px solid ${WT.border}`,
                            background: WT.bgSubtle
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: WT.orangeDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: WT.orange, border: `1px solid ${WT.orangeBorder}`, flexShrink: 0 }}>
                              {(member.name || "U")[0].toUpperCase()}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: WT.text0 }}>{member.name}</span>
                              <span style={{ fontSize: 10, color: WT.text2 }}>{member.email}</span>
                            </div>
                          </div>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            textTransform: "uppercase",
                            background: member.role === "OWNER" || member.role === "ADMIN" ? "rgba(239, 68, 68, 0.1)" : WT.orangeDim,
                            color: member.role === "OWNER" || member.role === "ADMIN" ? "rgb(239, 68, 68)" : WT.orange,
                            border: `1px solid ${member.role === "OWNER" || member.role === "ADMIN" ? "rgba(239, 68, 68, 0.2)" : WT.orangeBorder}`
                          }}>
                            {member.role}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: WT.text0, margin: 0 }}>Security and Directory Access</h3>
                    <p style={{ fontSize: 12, color: WT.text2, margin: "4px 0 0" }}>Adjust accessibility permissions for the {selectedWs.name} hub.</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ padding: 14, borderRadius: 8, border: `1px solid ${WT.border}`, background: WT.bgSubtle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: WT.text0, margin: 0 }}>Public Discoverability</p>
                        <p style={{ fontSize: 10, color: WT.text2, margin: "2px 0 0" }}>Make workspace searchable.</p>
                      </div>
                      <button style={{ width: 36, height: 20, borderRadius: 10, background: "#e5e7eb", border: "none", position: "relative" }}>
                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#ffffff", display: "block", position: "absolute", left: 2, top: 2 }}></span>
                      </button>
                    </div>
                    <div style={{ padding: 14, borderRadius: 8, border: `1px solid ${WT.border}`, background: WT.bgSubtle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: WT.text0, margin: 0 }}>Isolated Sandbox</p>
                        <p style={{ fontSize: 10, color: WT.text2, margin: "2px 0 0" }}>Isolate execution memory.</p>
                      </div>
                      <button style={{ width: 36, height: 20, borderRadius: 10, background: WT.orange, border: "none", position: "relative" }}>
                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#ffffff", display: "block", position: "absolute", right: 2, top: 2 }}></span>
                      </button>
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${WT.border}`, paddingTop: 20 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Danger Zone</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.05)", marginTop: 12 }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: WT.text0, margin: 0 }}>Delete Workspace</p>
                        <p style={{ fontSize: 10, color: WT.text2, margin: "2px 0 0" }}>Permanently purge database links and configs.</p>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this workspace?")) {
                            try {
                              await api.delete(`/workspaces/${selectedWs.id}`);
                              localStorage.removeItem("activeWorkspaceId");
                              window.dispatchEvent(new Event("workspacesChanged"));
                              window.dispatchEvent(new Event("activeWorkspaceIdChanged"));
                            } catch (err: any) {
                              alert(err.response?.data?.message || "Failed to delete workspace");
                            }
                          }
                        }}
                        style={{ padding: "8px 14px", borderRadius: 8, background: "#ef4444", border: "none", color: "#ffffff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Delete Space
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: WT.text3,
              fontStyle: "italic",
            }}
          >
            Select a workspace to view its details.
          </div>
        )}
      </div>

      {/* Create Workspace Modal Popup */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            background: "#ffffff",
            border: `1px solid ${WT.border}`,
            borderRadius: 16,
            width: "100%",
            maxWidth: 400,
            padding: 24,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            textAlign: "left"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: WT.text0, margin: "0 0 4px" }}>Create New Workspace</h3>
            <p style={{ fontSize: 12, color: WT.text2, margin: "0 0 20px" }}>Initialize a space to group AI agents, prompts, and knowledge files.</p>
            
            <form onSubmit={handleCreateWorkspace} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 750, color: WT.text1, textTransform: "uppercase", letterSpacing: "0.05em" }}>Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Legal Research Hub"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  required
                  style={{
                    background: WT.bgSubtle,
                    border: `1px solid ${WT.border}`,
                    borderRadius: 10,
                    padding: "8px 12px",
                    fontSize: 13,
                    color: WT.text0,
                    outline: "none",
                    width: "100%"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 750, color: WT.text1, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the purpose of this space..."
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  style={{
                    background: WT.bgSubtle,
                    border: `1px solid ${WT.border}`,
                    borderRadius: 10,
                    padding: "8px 12px",
                    fontSize: 13,
                    color: WT.text0,
                    outline: "none",
                    width: "100%",
                    resize: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: `1px solid ${WT.border}`,
                    background: "#ffffff",
                    fontSize: 12,
                    fontWeight: 600,
                    color: WT.text1,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: WT.orange,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  Create Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


/* ─────────────────────────────────────────────
   AGENTS VIEW
───────────────────────────────────────────── */
export { AgentsView };

/* ─────────────────────────────────────────────
   BILLING VIEW
───────────────────────────────────────────── */
export const BillingView: React.FC = () => {
  const invoices = [
    { date: "May 12, 2026", desc: "Cognify Pro Plan Renewal", amount: "$79.00", status: "Paid" },
    { date: "Apr 12, 2026", desc: "Cognify Pro Plan Renewal", amount: "$79.00", status: "Paid" },
    { date: "Mar 12, 2026", desc: "Cognify Pro Plan (Initial)", amount: "$79.00", status: "Paid" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" style={{ background: "#1a1a1a" }}>
      <div>
        <h1 className="text-xl font-medium text-white tracking-tight">Billing & Subscriptions</h1>
        <p className="text-xs text-[#555] mt-1">Configure plan tiers, payment details, and check invoices.</p>
      </div>

      {/* Plan selector cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { name: "Free Tier", desc: "Perfect for lightweight prompt testing and local sandboxes.", cost: "$0", active: true },
          { name: "Pro Plan", desc: "Full workflow executions, advanced RAG vectors, and Slack hooks.", cost: "$79/mo", active: false },
          { name: "Enterprise Custom", desc: "Dedicated instance nodes, custom models, and cluster isolation.", cost: "Custom", active: false },
        ].map((plan, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: plan.active ? "#1e1209" : "#1f1f1f",
              borderColor: plan.active ? "#22D3EE" : "#2a2a2a",
              borderWidth: "0.5px",
            }}
          >
            <div>
              <div className="flex justify-between items-center select-none">
                <span className="text-sm font-semibold text-white">{plan.name}</span>
                {plan.active && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded">
                    Active Plan
                  </span>
                )}
              </div>
              <p className="text-xs text-[#555] mt-2 leading-relaxed">{plan.desc}</p>
            </div>
            <div className="mt-5 flex items-end justify-between select-none">
              <span className="text-xl font-bold text-white leading-none">{plan.cost}</span>
              {!plan.active && (
                <button 
                  className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-[10px] font-semibold text-white hover:border-[#22D3EE] transition-colors cursor-pointer bg-transparent"
                  style={{ borderWidth: "0.5px" }}
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider select-none">Payment Invoices</h3>
        
        <div 
          className="rounded-xl border border-[#2a2a2a] bg-[#1f1f1f] overflow-hidden"
          style={{ borderWidth: "0.5px" }}
        >
          <div className="grid grid-cols-4 p-3.5 text-[10px] text-[#555] uppercase font-bold border-b border-[#2a2a2a]" style={{ borderWidth: "0 0 0.5px 0" }}>
            <span>Date</span>
            <span>Description</span>
            <span>Amount</span>
            <span className="text-right">Action</span>
          </div>
          <div className="flex flex-col">
            {invoices.map((inv, i) => (
              <div 
                key={i} 
                className="grid grid-cols-4 p-3.5 text-xs text-[#ccc] border-b border-[#1f1f1f] last:border-none"
                style={{ borderWidth: "0 0 0.5px 0" }}
              >
                <span>{inv.date}</span>
                <span className="text-white font-medium">{inv.desc}</span>
                <span className="text-[#86efac]">{inv.amount}</span>
                <div className="flex justify-end">
                  <button className="p-1 rounded text-[#555] hover:text-[#22D3EE] cursor-pointer bg-transparent border-none">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
