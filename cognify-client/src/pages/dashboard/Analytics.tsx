import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from "recharts";
import { 
  Search,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { api } from "../../utils/api";

export const Analytics = () => {
  const location = useLocation();
  const isChatEmbedded = true;
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [agentsBreakdown, setAgentsBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAgentsCount, setActiveAgentsCount] = useState(5);

  useEffect(() => {
    try {
      const localAgents = localStorage.getItem("cognify_agents");
      if (localAgents) setActiveAgentsCount(JSON.parse(localAgents).length);
    } catch (err) {}
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overviewRes, trendsRes, agentsRes] = await Promise.all([
          api.get("/analytics/overview").catch(() => null),
          api.get("/analytics/trends?days=7").catch(() => null),
          api.get("/analytics/agents").catch(() => null),
        ]);

        if (overviewRes?.data) setStats(overviewRes.data);
        if (trendsRes?.data) setTrends(trendsRes.data);
        if (agentsRes?.data) setAgentsBreakdown(agentsRes.data);
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Vercel/Linear Chart Colors (Cyan, Teal, Slate, Gray)
  const agentColors: Record<string, string> = {
    code: "#22D3EE",      // Cyan
    research: "#14B8A6",  // Teal
    business: "#475569",  // Slate
    analytics: "#94A3B8", // Gray
    general: "#E2E8F0",   // Light Gray
  };

  const donutData = agentsBreakdown.map((item: any) => ({
    name: item.agent.charAt(0).toUpperCase() + item.agent.slice(1),
    value: item.count,
    color: agentColors[item.agent] || "#475569",
  }));

  const displayDonutData = donutData.length > 0 ? donutData : [
    { name: "Code", value: 55, color: "#22D3EE" },
    { name: "Research", value: 20, color: "#14B8A6" },
    { name: "Business", value: 12, color: "#475569" },
    { name: "General", value: 5, color: "#94A3B8" }
  ];

  const formatTrendDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    } catch { return dateStr; }
  };

  const displayBarData = trends.map((item: any) => ({
    name: formatTrendDate(item.date),
    code: item.agents?.code ?? 0,
    research: item.agents?.research ?? 0,
    business: item.agents?.business ?? 0,
    analytics: item.agents?.analytics ?? 0,
    general: item.agents?.general ?? 0,
  }));

  const finalBarData = displayBarData.length > 0 ? displayBarData : [
    { name: "Feb 03", code: 8, research: 6, business: 4, analytics: 3, general: 1 },
    { name: "Feb 04", code: 7, research: 6, business: 6, analytics: 5, general: 2 },
    { name: "Feb 05", code: 6, research: 6, business: 4, analytics: 3, general: 1 },
    { name: "Feb 06", code: 7, research: 5, business: 5, analytics: 6, general: 2 },
    { name: "Feb 07", code: 8, research: 6, business: 6, analytics: 5, general: 2 },
    { name: "Feb 08", code: 6, research: 5, business: 5, analytics: 5, general: 1 },
    { name: "Feb 09", code: 7, research: 6, business: 6, analytics: 6, general: 3 },
  ];

  const formatModelName = (modelStr: string) => {
    if (!modelStr) return "Unknown";
    if (modelStr.includes("llama-3.3")) return "Llama 3.3 70B";
    if (modelStr.includes("llama-3.1-8b")) return "Llama 3.1 8B";
    if (modelStr.includes("gpt-4o-mini")) return "GPT-4o mini";
    if (modelStr.includes("gpt-4o")) return "GPT-4o";
    if (modelStr.includes("claude-3-5")) return "Claude 3.5";
    return modelStr;
  };

  const timeAgo = (dateStr: string) => {
    try {
      const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
      if (seconds < 60) return "Just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} min ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hrs ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch { return "Recently"; }
  };

  const displayRequests = stats?.recent_requests?.length > 0 ? stats.recent_requests : [
    { id: "mock-1", agent_type: "code", model: "gpt-4o", latency_ms: 8200, created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(), status: "completed" },
    { id: "mock-2", agent_type: "research", model: "claude-3-5", latency_ms: 11400, created_at: new Date(Date.now() - 32 * 60 * 1000).toISOString(), status: "running" },
    { id: "mock-3", agent_type: "business", model: "llama-3.3-70b", latency_ms: 6700, created_at: new Date(Date.now() - 47 * 60 * 1000).toISOString(), status: "failed" },
    { id: "mock-4", agent_type: "general", model: "gpt-4o-mini", latency_ms: 1200, created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), status: "completed" },
  ];

  return (
    <div className={isChatEmbedded
      ? "flex flex-col w-full h-full overflow-hidden dash-page-bg text-[var(--dash-text)] font-sans select-none text-left"
      : "flex flex-col w-full min-h-[calc(100vh-3.5rem)] -m-4 lg:-m-6 dash-page-bg text-[var(--dash-text)] font-sans select-none text-left"}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.3); }
        .dark-glass-input:focus-within { box-shadow: 0 0 0 1px #22D3EE, 0 0 12px rgba(34,211,238,0.15); border-color: #22D3EE; }
        .search-icon-active { color: #22D3EE !important; }
      `}} />

      {/* Top Header - Glass Nav */}
      <div className="h-16 bg-[var(--dash-card-bg)]/60 backdrop-blur-md border-b border-[var(--dash-border)] flex items-center justify-between px-8 select-none shrink-0 w-full z-10">
        <span className="text-sm font-semibold text-[var(--dash-text)] tracking-tight">Dashboard Overview</span>
        
        {/* Dark Glass Search Bar */}
        <div className="dark-glass-input relative flex items-center w-[300px] bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-md px-3 py-1.5 text-gray-400 transition-all">
          <Search className="h-3.5 w-3.5 mr-2 text-[var(--dash-muted2)] transition-colors" />
          <input 
            type="text"
            placeholder="Search executions..."
            className="text-[12px] text-[var(--dash-text)] flex-1 font-medium bg-transparent outline-none placeholder:text-[var(--dash-muted2)]"
          />
          <kbd className="h-5 items-center justify-center rounded border border-[var(--dash-border)] bg-[var(--dash-hover)] px-1.5 text-[9px] font-mono text-[var(--dash-muted)] flex select-none">⌘K</kbd>
        </div>


      </div>

      {/* Main Container */}
      <div className={isChatEmbedded
        ? "p-6 flex flex-col gap-6 flex-grow overflow-y-auto custom-scrollbar"
        : "p-6 flex flex-col gap-6 flex-grow"}>
        
        {/* Data-First KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="dash-card p-5 flex flex-col justify-between">
            <div className="text-[11px] text-[var(--dash-muted)] font-medium mb-1 uppercase tracking-wider">Active Agents</div>
            <div className="text-3xl font-bold text-[var(--dash-text)] leading-tight mb-2">{activeAgentsCount}</div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--dash-border)]">
              <span className="text-[10px] text-[var(--dash-muted)]">Across 3 workspaces</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] animate-pulse"></span>
                <span className="text-[9px] font-bold text-[#22D3EE] tracking-widest uppercase">Live</span>
              </div>
            </div>
          </div>

          <div className="dash-card p-5 flex flex-col justify-between">
            <div className="text-[11px] text-[var(--dash-muted)] font-medium mb-1 uppercase tracking-wider">Success Rate</div>
            <div className="text-3xl font-bold text-[var(--dash-text)] leading-tight mb-2">98.4%</div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--dash-border)]">
              <div className="flex items-center gap-1 text-[#10B981] text-[10px] font-semibold">
                <ArrowUpRight className="h-3 w-3" />
                <span>+0.4% this week</span>
              </div>
            </div>
          </div>

          <div className="dash-card p-5 flex flex-col justify-between">
            <div className="text-[11px] text-[var(--dash-muted)] font-medium mb-1 uppercase tracking-wider">Avg Latency</div>
            <div className="text-3xl font-bold text-[var(--dash-text)] leading-tight mb-2">
              {(stats?.avg_latency_ms ? stats.avg_latency_ms / 1000 : 8.4).toFixed(1)}s
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--dash-border)]">
              <div className="flex items-center gap-1 text-[#10B981] text-[10px] font-semibold">
                <ArrowDownRight className="h-3 w-3" />
                <span>-1.2s improvement</span>
              </div>
            </div>
          </div>

          <div className="dash-card p-5 flex flex-col justify-between">
            <div className="text-[11px] text-[var(--dash-muted)] font-medium mb-1 uppercase tracking-wider">Total Executions</div>
            <div className="text-3xl font-bold text-[var(--dash-text)] leading-tight mb-2">
              {(stats?.total_requests || 12492).toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--dash-border)]">
              <span className="text-[10px] text-[var(--dash-muted)]">Past 30 days</span>
            </div>
          </div>

        </div>

        {/* Workflow Monitor Table */}
        <div className="dash-card flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--dash-border)] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--dash-text)] tracking-tight">Recent Workflows</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
              <thead>
                <tr className="border-b border-[var(--dash-border)] text-[var(--dash-muted)] text-[10px] font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3 border-r border-[var(--dash-border)] font-semibold w-1/4">Agent</th>
                  <th className="px-5 py-3 border-r border-[var(--dash-border)] font-semibold w-1/4">Model</th>
                  <th className="px-5 py-3 border-r border-[var(--dash-border)] font-semibold w-1/6">Status</th>
                  <th className="px-5 py-3 border-r border-[var(--dash-border)] font-semibold text-right">Runtime</th>
                  <th className="px-5 py-3 font-semibold text-right">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-border)]">
                {displayRequests.map((r: any) => (
                  <tr key={r.id} className="hover:bg-[var(--dash-hover)] transition-colors group cursor-default">
                    <td className="px-5 py-3.5 border-r border-[var(--dash-border)] font-medium text-[var(--dash-text)] capitalize">
                      {r.agent_type ? `${r.agent_type} Agent` : "General Agent"}
                    </td>
                    <td className="px-5 py-3.5 border-r border-[var(--dash-border)]">
                      <span className="px-2 py-0.5 rounded-[4px] border border-[#22D3EE]/30 bg-[#22D3EE]/5 text-[#22D3EE] text-[10px] font-mono tracking-tight">
                        {formatModelName(r.model)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 border-r border-[var(--dash-border)]">
                      {r.status === 'running' && (
                        <div className="flex items-center gap-1.5 text-[#22D3EE] text-[11px] font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] animate-pulse" /> Running
                        </div>
                      )}
                      {(r.status === 'completed' || !r.status) && (
                        <div className="flex items-center gap-1.5 text-[#10B981] text-[11px] font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" /> Completed
                        </div>
                      )}
                      {r.status === 'failed' && (
                        <div className="flex items-center gap-1.5 text-[#EF4444] text-[11px] font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" /> Failed
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 border-r border-[var(--dash-border)] font-mono text-[11px] text-[var(--dash-text)] text-right">
                      {r.status === 'running' ? (
                        <span className="text-[#22D3EE]">{(r.latency_ms / 1000).toFixed(1)}s</span>
                      ) : (
                        <span>{(r.latency_ms / 1000).toFixed(1)}s</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--dash-muted2)] text-[11px] text-right">
                      {timeAgo(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Workload Donut */}
          <div className="dash-card p-5 flex flex-col justify-between">
            <h2 className="text-sm font-semibold text-[var(--dash-text)] tracking-tight mb-4">Agent Workload</h2>
            <div className="flex items-center justify-between gap-2 flex-grow">
              <div className="relative h-32 w-32 flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {displayDonutData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-[var(--dash-text)]">{stats?.total_requests ?? 241}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 justify-center text-[11px] font-medium text-[var(--dash-muted)] w-full pl-2">
                {displayDonutData.slice(0,4).map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[var(--dash-text)]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Executions Bar */}
          <div className="lg:col-span-2 dash-card p-5 flex flex-col justify-between">
            <h2 className="text-sm font-semibold text-[var(--dash-text)] tracking-tight mb-4">Execution Volume</h2>
            <div className="h-32 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finalBarData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--dash-muted2)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--dash-muted2)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "var(--dash-card-bg)", borderColor: "var(--dash-border)", borderRadius: "6px", color: "var(--dash-text)", fontSize: "11px" }}
                    itemStyle={{ color: "var(--dash-text)" }}
                    cursor={{fill: "var(--dash-hover)"}}
                  />
                  <Bar dataKey="code" stackId="a" fill="#22D3EE" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="research" stackId="a" fill="#14B8A6" />
                  <Bar dataKey="business" stackId="a" fill="#475569" />
                  <Bar dataKey="general" stackId="a" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
