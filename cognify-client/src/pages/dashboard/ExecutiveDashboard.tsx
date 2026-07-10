import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell
} from "recharts";
import { 
  Sparkles, 
  FolderUp, 
  UserPlus, 
  Bot, 
  MessageSquare, 
  ArrowRight,
  TrendingUp, 
  Layers, 
  Coins, 
  DollarSign, 
  Users, 
  Activity
} from "lucide-react";
import { api } from "../../utils/api";

export const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Shankar K.");
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [agentBreakdown, setAgentBreakdown] = useState<any[]>([]);
  const [workspacesCount, setWorkspacesCount] = useState(0);
  const [workspacesList, setWorkspacesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pie chart colors — landing brand palette
  const COLORS = ["#f17463", "#e05a4a", "#f5a898", "#fbc9c0", "#fab5a8"];

  useEffect(() => {
    // Load username
    const storedUserStr = localStorage.getItem("user");
    if (storedUserStr) {
      try {
        const u = JSON.parse(storedUserStr);
        if (u.name) setUserName(u.name);
      } catch {}
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch workspaces count
        const wsRes = await api.get("/workspaces");
        setWorkspacesList(wsRes.data);
        setWorkspacesCount(wsRes.data.length);

        // 2. Fetch overview analytics
        const overviewRes = await api.get("/analytics/overview");
        setStats(overviewRes.data);

        // 3. Fetch daily trends
        const trendsRes = await api.get("/analytics/trends?days=7");
        if (trendsRes.data && trendsRes.data.length > 0) {
          // Map to chart format (e.g. { date, Requests })
          const formatted = trendsRes.data.map((item: any) => ({
            date: item.date,
            Requests: item.requests ?? item.Requests ?? 0
          }));
          setTrends(formatted);
        }

        // 4. Fetch agent breakdown
        const agentRes = await api.get("/analytics/agents");
        if (agentRes.data && agentRes.data.length > 0) {
          const totalBreakdown = agentRes.data.reduce((sum: number, a: any) => sum + (a.count || 0), 0);
          const formatted = agentRes.data.map((item: any) => ({
            name: item.agent_type.charAt(0).toUpperCase() + item.agent_type.slice(1) + " Agent",
            value: totalBreakdown > 0 ? Math.round(((item.count || 0) / totalBreakdown) * 100) : 0,
            count: item.count
          }));
          setAgentBreakdown(formatted);
        }
      } catch (err) {
        console.error("Dashboard analytics load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format numbers cleanly
  const formatNum = (num: number) => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString();
  };

  const fallbackStats = {
    totalRequests: 84200,
    activeWorkspaces: 12,
    tokensConsumed: 12450000,
    costSavedUSD: 450.25,
    monthlyUsage: "82%",
    teamMembersCount: 3
  };

  const fallbackTrends = [
    { date: "Mon", Requests: 12000 },
    { date: "Tue", Requests: 19000 },
    { date: "Wed", Requests: 15000 },
    { date: "Thu", Requests: 22000 },
    { date: "Fri", Requests: 18000 },
    { date: "Sat", Requests: 9000 },
    { date: "Sun", Requests: 11000 },
  ];

  const fallbackAgents = [
    { name: "Support Agent", value: 45, count: 4500 },
    { name: "Sales Agent", value: 30, count: 3000 },
    { name: "Code Agent", value: 15, count: 1500 },
    { name: "Custom Agent", value: 10, count: 1000 },
  ];

  const recentConversations = [
    { id: "1", title: "API Integration Help", lastMessage: "How do I connect the Python SDK?", agentName: "Support Agent", workspace: "Backend Eng", timestamp: "2m ago" },
    { id: "2", title: "Sales Lead Summary", lastMessage: "Summarize Acme Corp call", agentName: "Sales Agent", workspace: "Sales Team", timestamp: "1h ago" },
    { id: "3", title: "UI Bug Fix", lastMessage: "Fix the padding on the modal", agentName: "Code Agent", workspace: "Frontend", timestamp: "3h ago" },
  ];

  // Determine current active metrics
  const activeStats = {
    totalRequests: stats?.totalRequests ?? fallbackStats.totalRequests,
    activeWorkspaces: workspacesCount > 0 ? workspacesCount : fallbackStats.activeWorkspaces,
    tokensConsumed: stats?.totalTokens ?? fallbackStats.tokensConsumed,
    costSavedUSD: stats?.totalCostSaved ?? fallbackStats.costSavedUSD,
    monthlyUsage: stats?.monthlyUsage ?? fallbackStats.monthlyUsage,
    teamMembersCount: fallbackStats.teamMembersCount // Fallback for collaboration
  };

  const chartTrends = trends.length > 0 ? trends : fallbackTrends;
  const pieAgents = agentBreakdown.length > 0 ? agentBreakdown : fallbackAgents;
  const totalRuns = stats?.totalRequests ?? 84200;

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Hero Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#202020] tracking-tight leading-none">
            Welcome back, <span style={{color:'#f17463'}}>{userName.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-[#8b8b8b] mt-2">
            Here's the operational overview of your AI Operations platform today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-[var(--dash-card-bg)] border border-[#eaedf1] rounded-xl px-3.5 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[#202020] font-semibold">All Systems Operational</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Requests",   value: formatNum(activeStats.totalRequests),              sub: "+14.2% this month",       Icon: Activity,    accent: "#f17463" },
          { label: "Workspaces",       value: activeStats.activeWorkspaces,                      sub: "Across organization",      Icon: Layers,      accent: "#f17463" },
          { label: "Monthly Usage",    value: activeStats.monthlyUsage,                          sub: "82% of plan cap",          Icon: TrendingUp,  accent: "#f17463" },
          { label: "Tokens Consumed",  value: formatNum(activeStats.tokensConsumed),             sub: "Platform average",         Icon: Coins,       accent: "#059669" },
          { label: "Est. Savings",     value: `$${activeStats.costSavedUSD.toFixed(2)}`,        sub: "vs standard ops",         Icon: DollarSign,  accent: "#059669" },
          { label: "Team Members",     value: activeStats.teamMembersCount,                      sub: "3 active sessions",        Icon: Users,       accent: "#f17463" },
        ].map(({ label, value, sub, Icon, accent }) => (
          <div key={label} className="bg-[var(--dash-card-bg)] border border-[#eaedf1] rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-[#f17463] hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8b8b8b] font-semibold uppercase tracking-wide">{label}</span>
              <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
            </div>
            <p className="text-xl font-bold text-[#202020] tracking-tight leading-none">{value}</p>
            <p className="text-[10px]" style={{ color: accent }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area Chart */}
        <div className="bg-[var(--dash-card-bg)] border border-[#eaedf1] rounded-2xl p-5 lg:col-span-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#202020] leading-none">Daily AI Requests</h2>
          <p className="text-xs text-[#8b8b8b] mt-1">Trend over the past 7 operating cycles</p>
          <div className="h-56 mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTrends} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="brandGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f17463" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f17463" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaedf1" vertical={false} />
                <XAxis dataKey="date" stroke="#c0c0c0" fontSize={10} tickLine={false} />
                <YAxis stroke="#c0c0c0" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", borderColor: "#eaedf1", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                  labelStyle={{ color: "#f17463", fontWeight: "bold", fontSize: "11px" }}
                  itemStyle={{ color: "#202020", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="Requests" stroke="#f17463" strokeWidth={2} fillOpacity={1} fill="url(#brandGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-[var(--dash-card-bg)] border border-[#eaedf1] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#202020] leading-none">Agent Allocations</h2>
          <p className="text-xs text-[#8b8b8b] mt-1">Split of queries by agent type</p>
          <div className="h-44 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieAgents} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={4} dataKey="value">
                  {pieAgents.map((_: any, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#fff", borderColor: "#eaedf1", borderRadius: "10px" }} itemStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-[#202020]">{formatNum(totalRuns)}</span>
              <span className="text-[9px] text-[#8b8b8b] uppercase tracking-widest">Total Runs</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {pieAgents.map((item: any, index: number) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] text-[#8b8b8b] truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Workspaces + Chats */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Workspaces */}
          <div className="bg-[var(--dash-card-bg)] border border-[#eaedf1] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid #eaedf1" }}>
              <div>
                <h2 className="text-sm font-bold text-[#202020]">Active Workspaces</h2>
                <p className="text-xs text-[#8b8b8b] mt-0.5">Workspaces seeing active development today</p>
              </div>
              <button onClick={() => navigate("/dashboard/workspaces")} className="text-xs text-[#f17463] hover:underline font-semibold flex items-center gap-1">
                All Workspaces <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="flex flex-col gap-2.5 mt-4">
              {workspacesList.length > 0 ? workspacesList.slice(0, 3).map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => { localStorage.setItem("activeWorkspaceId", ws.id); window.dispatchEvent(new Event("activeWorkspaceIdChanged")); navigate("/dashboard/workspaces"); }}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#eaedf1] bg-[#f9f9f9] hover:border-[#f17463] hover:bg-[var(--dash-card-bg)] transition-all cursor-pointer group"
                >
                  <div>
                    <span className="text-xs font-bold text-[#202020] group-hover:text-[#f17463] transition-colors">{ws.name}</span>
                    <span className="block text-[10px] text-[#8b8b8b] mt-0.5 line-clamp-1">{ws.description || "No description provided."}</span>
                  </div>
                  <span className="text-[10px] text-[#c0c0c0] shrink-0">{new Date(ws.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              )) : (
                <div className="text-center py-6 text-xs text-[#c0c0c0] border border-dashed border-[#eaedf1] rounded-xl">No workspaces yet.</div>
              )}
            </div>
          </div>

          {/* Recent Chats */}
          <div className="bg-[var(--dash-card-bg)] border border-[#eaedf1] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid #eaedf1" }}>
              <div>
                <h2 className="text-sm font-bold text-[#202020]">Recent Agent Chats</h2>
                <p className="text-xs text-[#8b8b8b] mt-0.5">Timeline of recent queries</p>
              </div>
              <button onClick={() => navigate("/dashboard/chat")} className="text-xs text-[#f17463] hover:underline font-semibold flex items-center gap-1">
                Open Chat <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {recentConversations.slice(0, 3).map((chat: any) => (
                <div key={chat.id} onClick={() => navigate("/dashboard/chat")} className="flex items-start justify-between p-3 rounded-xl hover:bg-[#f9f9f9] cursor-pointer transition-all border border-transparent hover:border-[#eaedf1]">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[rgba(241,116,99,0.08)] border border-[rgba(241,116,99,0.2)] flex items-center justify-center shrink-0">
                      <MessageSquare className="h-4 w-4 text-[#f17463]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#202020]">{chat.title}</span>
                      <span className="block text-[10px] text-[#8b8b8b] mt-0.5 line-clamp-1 italic">"{chat.lastMessage}"</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] bg-[rgba(241,116,99,0.1)] text-[#f17463] border border-[rgba(241,116,99,0.2)] px-1.5 py-0.5 rounded-full font-semibold">{chat.agentName}</span>
                        <span className="text-[9px] bg-[#f5f5f5] text-[#8b8b8b] px-1.5 py-0.5 rounded-full border border-[#eaedf1]">{chat.workspace}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#c0c0c0] shrink-0 mt-0.5">{chat.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions + Activity */}
        <div className="flex flex-col gap-5">
          {/* Quick Actions */}
          <div className="bg-[var(--dash-card-bg)] border border-[#eaedf1] rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#202020] pb-3" style={{ borderBottom: "1px solid #eaedf1" }}>Quick Operations</h2>
            <div className="flex flex-col gap-2 mt-4">
              {[
                { label: "Start New Chat",    sub: "Prompt any AI agent",           icon: Sparkles,  path: "/dashboard/chat" },
                { label: "Upload File",        sub: "Index docs into memory",         icon: FolderUp,  path: "/dashboard/files" },
                { label: "Configure Agent",   sub: "Adjust models & system rules",   icon: Bot,       path: "/dashboard/agents" },
                { label: "Invite Member",     sub: "Generate workspace invite link", icon: UserPlus,  path: "/dashboard/collaboration" },
              ].map(({ label, sub, icon: Icon, path }) => (
                <button key={label} onClick={() => navigate(path)} className="flex items-center gap-3 p-3 rounded-xl border border-[#eaedf1] bg-[#f9f9f9] hover:border-[#f17463] hover:bg-[var(--dash-card-bg)] text-left transition-all group">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(241,116,99,0.1)" }}>
                    <Icon className="h-3.5 w-3.5 text-[#f17463]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#202020] group-hover:text-[#f17463] transition-colors">{label}</p>
                    <p className="text-[10px] text-[#8b8b8b]">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-[var(--dash-card-bg)] border border-[#eaedf1] rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#202020] pb-3" style={{ borderBottom: "1px solid #eaedf1" }}>Activity History</h2>
            <p className="text-[10px] text-[#8b8b8b] mt-1 mb-3">AI Operations calls by day</p>
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: 24 }).map((_, idx) => {
                const opacities = [0.06, 0.15, 0.35, 0.6, 1];
                const o = idx % 3 === 0 ? opacities[0] : opacities[(idx % 4)];
                return (
                  <div
                    key={idx}
                    className="aspect-square rounded-md border border-[#eaedf1] transition-all hover:scale-110 cursor-pointer"
                    style={{ background: `rgba(241,116,99,${o})` }}
                    title={`${idx * 14} requests`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#c0c0c0] mt-3">
              <span>Less</span>
              <div className="flex gap-1">
                {[0.06, 0.15, 0.35, 0.6, 1].map((o) => <span key={o} className="h-2 w-2 rounded" style={{ background: `rgba(241,116,99,${o})` }} />)}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
