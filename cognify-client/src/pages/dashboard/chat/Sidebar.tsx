import React, { useState } from "react";
import {
  Columns,
  Search,
  SquarePen,
  MessageSquare,
  Briefcase,
  Code2,
  Plus,
  Box,
  Bot,
  Trash2,
  ChevronDown,
  Download,
  Activity,
} from "lucide-react";
import { ModeToggle } from "../../../../notusComponents/mode-toggle";

interface Session {
  id: string;
  title: string;
  agentType: string;
  timestamp: string;
  lastMessage: string;
}

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onNewChat: () => void;
  activeTab: "chat" | "work" | "code";
  onChangeTab: (tab: "chat" | "work" | "code") => void;
  user: { name: string; email: string } | null;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onToggleSearch: () => void;
  activeView: "chat" | "workspaces" | "agents" | "analytics";
  onSelectView: (view: "chat" | "workspaces" | "agents" | "analytics") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  activeTab,
  onChangeTab,
  user,
  isCollapsed,
  setIsCollapsed,
  onToggleSearch,
  activeView,
  onSelectView,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleRecentsClick = (sid: string) => {
    onSelectSession(sid);
    onSelectView("chat");
  };

  const handleNewChatClick = () => {
    onNewChat();
    onSelectView("chat");
  };

  if (isCollapsed) {
    return (
      <div
        className="w-12 h-full flex flex-col items-center py-4 border-r border-border shrink-0 bg-[var(--dash-sidebar-bg)]"
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-[7px] text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] transition-colors cursor-pointer"
          title="Expand sidebar"
        >
          <Columns className="h-[18px] w-[18px]" />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="w-[256px] h-full flex flex-col border-r border-border shrink-0 overflow-hidden select-none bg-[var(--dash-sidebar-bg)]"
    >
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-[7px] text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <Columns className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={onToggleSearch}
            className="p-1.5 rounded-[7px] text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] transition-colors cursor-pointer flex items-center gap-1"
            title="Search (⌘K)"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <ModeToggle />
          <button
            onClick={handleNewChatClick}
            className="p-1.5 rounded-[7px] text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)] transition-colors cursor-pointer"
            title="New chat"
          >
            <SquarePen className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mt-2 px-2.5 shrink-0">
        <div className="bg-[var(--dash-card-bg)] rounded-xl p-[3px] flex items-center w-full border border-[var(--dash-border)]">
          <button
            onClick={() => { onChangeTab("chat"); onSelectView("chat"); }}
            className={`flex-1 flex items-center justify-center gap-1 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "chat" && activeView === "chat" ? "bg-[var(--dash-bg)] text-[var(--dash-text)] shadow-sm border border-[var(--dash-border)]" : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </button>
          <button
            onClick={() => { onChangeTab("work"); onSelectView("workspaces"); }}
            className={`flex-1 flex items-center justify-center gap-1 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "work" || activeView === "workspaces" ? "bg-[var(--dash-bg)] text-[var(--dash-text)] shadow-sm border border-[var(--dash-border)]" : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Work
          </button>
        </div>
      </div>

      {/* Nav Items */}
      <div className="mt-4 pb-2 border-b border-[var(--dash-border)] flex flex-col gap-0.5 shrink-0">
        <button
          onClick={handleNewChatClick}
          className="flex items-center gap-2.5 px-2.5 py-2 mx-2 rounded-lg text-left text-[13px] text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)] transition-all cursor-pointer bg-transparent border-none"
        >
          <Plus className="h-[17px] w-[17px] text-[var(--dash-muted)]" />
          <span>New chat</span>
        </button>
        <button
          onClick={() => onSelectView("workspaces")}
          className={`flex items-center gap-2.5 px-2.5 py-2 mx-2 rounded-lg text-left text-[13px] transition-all cursor-pointer bg-transparent border-none ${
            activeView === "workspaces" ? "bg-[var(--dash-hover)] text-[var(--dash-text)] font-medium border-l-[3px] border-[#22D3EE] pl-[7px]" : "text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
          }`}
        >
          <Box className="h-[17px] w-[17px] text-[var(--dash-muted)]" />
          <span>Workspaces</span>
        </button>
        <button
          onClick={() => onSelectView("agents")}
          className={`flex items-center gap-2.5 px-2.5 py-2 mx-2 rounded-lg text-left text-[13px] transition-all cursor-pointer bg-transparent border-none ${
            activeView === "agents" ? "bg-[var(--dash-hover)] text-[var(--dash-text)] font-medium border-l-[3px] border-[#22D3EE] pl-[7px]" : "text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
          }`}
        >
          <Bot className="h-[17px] w-[17px] text-[var(--dash-muted)]" />
          <span>Agents</span>
        </button>
        <button
          onClick={() => onSelectView("analytics")}
          className={`flex items-center gap-2.5 px-2.5 py-2 mx-2 rounded-lg text-left text-[13px] transition-all cursor-pointer bg-transparent border-none ${
            activeView === "analytics" ? "bg-[var(--dash-hover)] text-[var(--dash-text)] font-medium border-l-[3px] border-[#22D3EE] pl-[7px]" : "text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
          }`}
        >
          <Activity className="h-[17px] w-[17px] text-[var(--dash-muted)]" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Recents Section */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-[100px]">
        <span className="text-[12px] font-medium text-[var(--dash-muted)] px-[18px] pt-[14px] pb-[6px] uppercase tracking-wider shrink-0">
          Recents
        </span>
        <div
          className="flex-1 overflow-y-auto flex flex-col gap-[3px] pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`
            ::-webkit-scrollbar { display: none; }
          `}</style>
          {sessions.map((s) => {
            const isActive = s.id === activeSessionId && activeView === "chat";
            return (
              <div
                key={s.id}
                onClick={() => handleRecentsClick(s.id)}
                className={`group flex items-center justify-between px-2.5 py-1.75 mx-2 rounded-lg cursor-pointer transition-all text-[13px] relative ${
                  isActive ? "bg-[var(--dash-hover)] text-[var(--dash-text)] font-medium" : "text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
                }`}
              >
                <span className="truncate flex-1 pr-4">{s.title || "New Chat"}</span>
                <button
                  onClick={(e) => onDeleteSession(s.id, e)}
                  className="shrink-0 p-0.5 rounded text-[var(--dash-muted2)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-transparent border-none cursor-pointer"
                  title="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom User Row */}
      <div className="border-t border-[var(--dash-border)] p-3 shrink-0 relative">
        {showProfileMenu && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowProfileMenu(false)} />
            <div
              className="absolute bottom-full left-3 mb-2 w-48 rounded-lg border border-[var(--dash-border)] p-1.5 shadow-xl z-30 bg-[var(--dash-card-bg)]"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="px-2.5 py-2 border-b border-[var(--dash-border)]" style={{ borderWidth: "0 0 0.5px 0" }}>
                <p className="text-xs font-bold text-[var(--dash-text)] leading-none truncate">{user?.name || "Shankar"}</p>
                <p className="text-[10px] text-[var(--dash-muted)] mt-1 truncate">{user?.email || "work.shankar70@gmail.com"}</p>
              </div>
              <div className="flex flex-col gap-0.5 mt-1">
                <button
                  onClick={() => { onSelectView("analytics"); setShowProfileMenu(false); }}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-hover)] transition-all bg-transparent border-none cursor-pointer"
                >
                  Dashboard Home
                </button>
                <button
                  onClick={() => { onSelectView("agents"); setShowProfileMenu(false); }}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-hover)] transition-all bg-transparent border-none cursor-pointer"
                >
                  Settings
                </button>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-[var(--dash-border)]" style={{ borderTopWidth: "0.5px" }}>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("activeWorkspaceId");
                    window.location.href = "/";
                  }}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-red-500 hover:bg-red-950/20 transition-all bg-transparent border-none cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[var(--dash-hover)] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden ring-0 group-hover:ring-2 ring-[#22D3EE] ring-offset-2 ring-offset-[var(--dash-sidebar-bg)] rounded-full px-0.5 transition-all">
            <div className="h-7 w-7 rounded-full bg-[#22D3EE] flex items-center justify-center font-bold text-xs text-white shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "SH"}
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-[var(--dash-text)] text-[13px] font-medium truncate leading-tight">
                {user?.name || "Shankar"}
              </span>
              <span className="text-[var(--dash-muted)] text-[11px] truncate leading-none mt-0.5">
                Free Plan
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded text-[var(--dash-muted2)] hover:text-[var(--dash-text)] bg-transparent border-none cursor-pointer">
              <Download className="h-3.5 w-3.5" />
            </button>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--dash-muted)] group-hover:text-[var(--dash-text)] transition-colors" />
          </div>
        </div>
      </div>
    </aside>
  );
};
