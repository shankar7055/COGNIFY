import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Layers,
  Bot,
  BarChart3,
  Users,
  FolderOpen,
  GitFork,
  Settings as SettingsIcon,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Plus,
  Key,
  CreditCard,
  Brain,
  Puzzle,
  Terminal,
  Trash2,
  Zap,
  Check,
  Sparkles,
} from "lucide-react";
import { api } from "../../utils/api";
import { CognifyIcon } from "../../../notusComponents/logo";

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const chatPaths = ["/dashboard/chat", "/dashboard/workspaces", "/dashboard/agents", "/dashboard/analytics"];
  const isChatRoute = chatPaths.some((p) => location.pathname.startsWith(p));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>({ id: "default", name: "Personal Work" });
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [priceOpacity, setPriceOpacity] = useState(1);

  useEffect(() => {
    setPriceOpacity(0);
    const timer = setTimeout(() => {
      setPriceOpacity(1);
    }, 50);
    return () => clearTimeout(timer);
  }, [billingCycle]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchSubscription = async () => {
    try {
      const res = await api.get("/billing/subscription");
      setSubscription(res.data);
    } catch (err) {
      console.error("Failed to load subscription details:", err);
    }
  };

  const handleUpgrade = async (plan: "PRO" | "ENTERPRISE") => {
    try {
      setCheckoutLoading(plan);
      const res = await api.post("/billing/checkout", { plan });

      if (res.data.gateway === "razorpay") {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          alert("Failed to load Razorpay payment SDK.");
          return;
        }

        const options = {
          key: res.data.key_id,
          amount: res.data.amount,
          currency: "INR",
          name: "Cognify",
          description: `${plan} Plan Upgrade`,
          order_id: res.data.order_id,
          handler: async function (response: any) {
            try {
              setCheckoutLoading(plan);
              await api.post("/billing/verify", {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan,
              });
              alert("Payment successful! Your subscription plan has been upgraded.");
              fetchSubscription();
            } catch (err) {
              console.error("Razorpay payment verification failed:", err);
              alert("Payment verification failed. If your account was charged, please contact support.");
            } finally {
              setCheckoutLoading(null);
            }
          },
          prefill: {
            name: "User",
          },
          theme: {
            color: "#22D3EE",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Upgrade checkout creation failed:", err);
      alert("Failed to initialize billing checkout.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const planParam = searchParams.get("plan") as "PRO" | "ENTERPRISE" | null;
    if (planParam && ["PRO", "ENTERPRISE"].includes(planParam)) {
      setShowSubscriptionModal(true);
      if (subscription && subscription.plan !== planParam) {
        handleUpgrade(planParam);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [location.search, subscription]);

  useEffect(() => {
    const handleOpenModal = () => {
      setShowSubscriptionModal(true);
    };
    window.addEventListener("openSubscriptionModal", handleOpenModal);
    return () => {
      window.removeEventListener("openSubscriptionModal", handleOpenModal);
    };
  }, []);

  // Chat sessions sync
  const [sessions, setSessions] = useState<any[]>(() => {
    const saved = localStorage.getItem("chat_sessions");
    if (saved) return JSON.parse(saved);
    return [
      { id: "s1", title: "Refactor Database Indexes", agentType: "code", timestamp: "2 mins ago", lastMessage: "Implement Redis-backed rate limiter" },
      { id: "s2", title: "Market Competitor Research", agentType: "research", timestamp: "1 hour ago", lastMessage: "Revenue projections look strong" },
      { id: "s3", title: "Rate Limiter Implementation", agentType: "code", timestamp: "5 hrs ago", lastMessage: "Linear vs Notion comparison" },
      { id: "s4", title: "Q3 Revenue Forecast", agentType: "business", timestamp: "1 day ago", lastMessage: "JWT validation strategy" },
    ];
  });
  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem("activeSessionId") || "s1";
  });

  const navigationItems = [
    { name: "AI Chat", path: "/dashboard/chat", icon: MessageSquare },
    { name: "Workspaces", path: "/dashboard/workspaces", icon: Layers },
    { name: "Agents", path: "/dashboard/agents", icon: Bot },
    { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
  ];

  useEffect(() => {
    if (!localStorage.getItem("chat_sessions")) {
      localStorage.setItem("chat_sessions", JSON.stringify(sessions));
    }
    if (!localStorage.getItem("activeSessionId")) {
      localStorage.setItem("activeSessionId", activeSessionId);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/sign-in"); return; }

    const fetchSessionData = async () => {
      try {
        setLoading(true);
        const userRes = await api.get("/auth/me");
        setUser(userRes.data);
        localStorage.setItem("user", JSON.stringify(userRes.data));

        const wsRes = await api.get("/workspaces");
        let wsData = wsRes.data;
        if (wsData.length === 0) {
          const createRes = await api.post("/workspaces", {
            name: "Personal Work",
            description: "Your default workspace for AI operations and file indexation."
          });
          wsData = [createRes.data];
        }
        setWorkspaces(wsData);
        const savedWsId = localStorage.getItem("activeWorkspaceId");
        const activeWs = wsData.find((w: any) => w.id === savedWsId) || wsData[0];
        setSelectedWorkspace(activeWs);
        localStorage.setItem("activeWorkspaceId", activeWs.id);
      } catch (err: any) {
        console.error("Session fetch failed:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/sign-in");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();

    const handleWorkspaceListChange = async () => {
      try {
        const wsRes = await api.get("/workspaces");
        let wsData = wsRes.data;
        if (wsData.length === 0) {
          const createRes = await api.post("/workspaces", {
            name: "Personal Work",
            description: "Your default workspace for AI operations and file indexation."
          });
          wsData = [createRes.data];
        }
        setWorkspaces(wsData);
        const savedWsId = localStorage.getItem("activeWorkspaceId");
        const activeWs = wsData.find((w: any) => w.id === savedWsId) || wsData[0];
        if (activeWs) setSelectedWorkspace(activeWs);
      } catch (err) { console.error(err); }
    };

    const syncSessions = () => {
      const saved = localStorage.getItem("chat_sessions");
      if (saved) setSessions(JSON.parse(saved));
    };
    const syncActiveSession = () => {
      setActiveSessionId(localStorage.getItem("activeSessionId") || "s1");
    };

    window.addEventListener("workspacesChanged", handleWorkspaceListChange);
    window.addEventListener("chatSessionsChanged", syncSessions);
    window.addEventListener("activeSessionIdChanged", syncActiveSession);

    return () => {
      window.removeEventListener("workspacesChanged", handleWorkspaceListChange);
      window.removeEventListener("chatSessionsChanged", syncSessions);
      window.removeEventListener("activeSessionIdChanged", syncActiveSession);
    };
  }, [navigate]);

  const handleSelectWorkspace = (ws: any) => {
    setSelectedWorkspace(ws);
    localStorage.setItem("activeWorkspaceId", ws.id);
    window.dispatchEvent(new Event("activeWorkspaceIdChanged"));
    setShowWorkspaceDropdown(false);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      const res = await api.post("/workspaces", { name: newWorkspaceName, description: newWorkspaceDesc });
      const newWs = res.data;
      const updatedList = [...workspaces, newWs];
      setWorkspaces(updatedList);
      handleSelectWorkspace(newWs);
      setNewWorkspaceName(""); setNewWorkspaceDesc(""); setShowNewWorkspaceModal(false);
      window.dispatchEvent(new Event("workspacesChanged"));
    } catch (err) {
      console.error("Failed to create workspace:", err);
      alert("Failed to create workspace. Please try again.");
    }
  };

  const handleNewChat = () => {
    const id = `s-${Date.now()}`;
    const newSession = {
      id,
      title: "New Conversation",
      agentType: "code",
      timestamp: "Just now",
      lastMessage: ""
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("chat_sessions", JSON.stringify(updated));
    localStorage.setItem("activeSessionId", id);
    setActiveSessionId(id);
    window.dispatchEvent(new Event("chatSessionsChanged"));
    window.dispatchEvent(new Event("activeSessionIdChanged"));
    navigate("/dashboard/chat");
  };

  const handleSelectSession = (id: string) => {
    localStorage.setItem("activeSessionId", id);
    setActiveSessionId(id);
    window.dispatchEvent(new Event("activeSessionIdChanged"));
    navigate("/dashboard/chat");
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem("chat_sessions", JSON.stringify(updated));
    window.dispatchEvent(new Event("chatSessionsChanged"));
    if (activeSessionId === id && updated.length > 0) {
      localStorage.setItem("activeSessionId", updated[0].id);
      setActiveSessionId(updated[0].id);
      window.dispatchEvent(new Event("activeSessionIdChanged"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeWorkspaceId");
    navigate("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchModal(false);
    alert(`Searching for: ${searchQuery}`);
  };

  /* ─── Sidebar nav link ─── */
  const NavLink = ({ item }: { item: typeof navigationItems[0] }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => setMobileSidebarOpen(false)}
        className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group ${isActive
          ? "bg-[rgba(241,116,99,0.08)] text-[#f17463] border-l-2 border-[#f17463] pl-[10px]"
          : "text-[#8b8b8b] hover:bg-[#f5f5f5] hover:text-[#202020]"
          }`}
      >
        <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-[#f17463]" : "text-[#c0c0c0] group-hover:text-[#8b8b8b]"}`} />
        {item.name}
      </Link>
    );
  };

  /* ─── Sidebar inner content ─── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden text-[#8b8b8b] select-none">
      {/* 1. Logo Header */}
      <div className="flex items-center gap-2.5 px-1 py-1.5 shrink-0">
        <CognifyIcon size={32} className="shrink-0" />
        <div className="flex flex-col">
          <span className="text-[var(--dash-text)] font-bold text-sm tracking-wide leading-none select-none">COGNIFY</span>
          <span className="text-[9px] text-[#FF6B35] font-bold tracking-widest mt-1 uppercase select-none">AI Operations</span>
        </div>
      </div>

      {/* 2. Workspace Selector */}
      <div className="relative mt-3 shrink-0">
        <button
          type="button"
          onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-[var(--dash-card-bg)] border border-[var(--dash-border)] hover:border-[#FF6B35]/40 text-xs font-semibold text-[var(--dash-text)] transition-all"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="h-2 w-2 rounded-full bg-[#FF6B35] shrink-0" />
            <span className="truncate">{selectedWorkspace.name}</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[#8b8b8b] shrink-0" />
        </button>

        {showWorkspaceDropdown && (
          <>
            <div className="fixed inset-0 z-25" onClick={() => setShowWorkspaceDropdown(false)} />
            <div className="absolute left-0 mt-1.5 w-full rounded-xl bg-[var(--dash-card-bg)] border border-[var(--dash-border)] p-1.5 shadow-2xl z-30">
              <div className="px-2 py-1 text-[9px] font-bold text-[var(--dash-muted)] uppercase tracking-widest border-b border-[var(--dash-border)]">Workspaces</div>
              <div className="flex flex-col gap-0.5 mt-1.5 max-h-44 overflow-y-auto">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => { handleSelectWorkspace(ws); setShowWorkspaceDropdown(false); }}
                    className={`flex flex-col items-start w-full px-2.5 py-2 rounded-lg text-left transition-all text-xs ${selectedWorkspace.id === ws.id
                      ? "bg-[rgba(255,107,53,0.08)] border-l-2 border-[#FF6B35] pl-2 text-[#FF6B35] font-semibold"
                      : "text-[var(--dash-muted)] hover:bg-[#242424] hover:text-[var(--dash-text)]"
                      }`}
                  >
                    <span className="font-medium">{ws.name}</span>
                    <span className="text-[10px] text-[#c0c0c0] truncate w-full mt-0.5">{ws.description || "No description"}</span>
                  </button>
                ))}
              </div>
              <div style={{ borderTop: "1px solid var(--dash-border)" }} className="mt-1.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => { setShowNewWorkspaceModal(true); setShowWorkspaceDropdown(false); }}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-semibold text-[#FF6B35] hover:bg-[rgba(255,107,53,0.06)] transition-all border border-dashed border-[rgba(255,107,53,0.3)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Workspace
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. New Chat Button */}
      <button
        onClick={handleNewChat}
        className="w-full mt-3 py-2.5 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#FF7D4D] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 select-none shrink-0"
        title="New Chat (Plus sign icon created by riajulislam - Flaticon)"
      >
        <svg
          className="h-3.5 w-3.5 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-label="Plus icon"
        >
          <path d="M19 11h-6V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2z" />
        </svg>
        New Chat
      </button>

      {/* 4. Chat Sessions List */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 flex flex-col gap-1 scrollbar-none" style={{ minHeight: "150px" }}>
        <p className="text-[12px] font-bold text-[#F5F5F5] px-3 select-none mb-2 mt-1">Recents</p>
        {sessions.map((s) => {
          const isActive = s.id === activeSessionId && location.pathname === "/dashboard/chat";
          return (
            <div
              key={s.id}
              onClick={() => handleSelectSession(s.id)}
              className={`relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all text-xs group ${isActive
                ? "bg-[#2C2C2C] text-[#F5F5F5] font-medium"
                : "text-[#8b8b8b] hover:bg-[#242424] hover:text-[#F5F5F5]"
                }`}
            >
              <span className="truncate flex-1 pr-2">{s.title}</span>
              <button
                onClick={(e) => handleDeleteSession(s.id, e)}
                className="shrink-0 p-0.5 rounded text-[#8b8b8b] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 5. Menu Navigation */}
      <nav className="flex flex-col gap-1 mt-4 pt-4 border-t border-[var(--dash-border)] shrink-0">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/dashboard/");
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                ? "bg-[rgba(255,107,53,0.08)] text-[#FF6B35] font-bold border-l-2 border-[#FF6B35] pl-[12px]"
                : "text-[#8b8b8b] hover:bg-[#f5f5f5] hover:text-[#202020]"
                }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#FF6B35]" : "text-[#c0c0c0]"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* 6. User Profile Footer */}
      <div style={{ borderTop: "1px solid var(--dash-border)" }} className="mt-4 pt-3.5 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2.5 px-1.5">
          <div className="h-8 w-8 rounded-full bg-[rgba(255,107,53,0.08)] flex items-center justify-center border border-[var(--dash-border)] font-bold text-xs text-[#FF6B35] select-none shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[var(--dash-text)] text-xs font-bold truncate leading-none mb-1 select-all">{user?.name || "shankar"}</span>
            <span className="text-[var(--dash-muted)] text-[10px] truncate leading-none select-all">{user?.email || "work.shankar70@gmail.com"}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-[#8b8b8b] hover:text-red-500 px-3.5 py-2 rounded-xl hover:bg-red-950/20 transition-all text-left"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          Sign Out
        </button>
        <div className="px-3.5 text-[9px] text-[#7A7A7A] mt-1 select-all">
          <a href="https://www.flaticon.com/free-icons/plus-sign" title="plus sign icons" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6B35] transition-colors underline">
            Plus icon by riajulislam
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen dash-bg text-[var(--dash-text)] flex flex-col antialiased"
      style={{ fontFamily: '"Inter Display", Inter, sans-serif' }}
    >
      {/* ── Search Modal ── */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]">
          <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl mx-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center p-4 border-b border-[var(--dash-border)]">
              <Search className="text-[#f17463] mr-3 h-4 w-4" />
              <input
                type="text"
                placeholder="Search workspaces, agents, files, workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-[var(--dash-text)] text-sm placeholder-[var(--dash-muted)] focus:ring-0"
                autoFocus
              />
              <button type="button" onClick={() => setShowSearchModal(false)} className="text-[var(--dash-muted)] hover:text-[var(--dash-text)] p-1">
                <X className="h-4 w-4" />
              </button>
            </form>
            <div className="p-4 text-xs text-[#8b8b8b]">
              <span className="font-semibold text-[#202020]">Quick searches:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Code review", "Billing logs", "Market research", "Stripe key"].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSearchQuery(q)}
                    className="px-2.5 py-1 rounded-lg bg-[#f5f5f5] border border-[#eaedf1] hover:border-[#f17463] hover:text-[#f17463] text-[#8b8b8b] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New Workspace Modal ── */}
      {showNewWorkspaceModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setShowNewWorkspaceModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-[var(--dash-bg)] border border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-bold text-[var(--dash-text)] mb-1 leading-none">Create New Workspace</h3>
            <p className="text-xs text-[var(--dash-muted)] mb-4">Segment chat histories, files and workflow automations.</p>
            <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-muted)]">Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Marketing, Dev Engine..."
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="input-light w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-muted)]">Description (Optional)</label>
                <textarea
                  placeholder="Describe the purpose..."
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  rows={3}
                  className="input-light w-full resize-none"
                />
              </div>
              <button type="submit" className="w-full py-2.5 btn-brand text-sm">Create Workspace</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Layout ── */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Desktop Sidebar */}
        {!isChatRoute && (
          <aside className="hidden lg:flex flex-col w-60 shrink-0 p-4 justify-between dash-sidebar">
            <SidebarContent />
          </aside>
        )}

        {/* Mobile Sidebar overlay */}
        {!isChatRoute && mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileSidebarOpen(false)}>
            <div
              className="w-60 max-w-xs h-full p-4 flex flex-col justify-between shadow-xl dash-sidebar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ background: "#f17463" }}>
                    C
                  </div>
                  <span className="text-[#202020] font-bold text-sm">COGNIFY</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg bg-[#f5f5f5] border border-[#eaedf1] text-[#8b8b8b] hover:text-[#202020]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          {!isChatRoute && (
            <header className="dash-header h-14 flex items-center justify-between px-4 lg:px-6 shrink-0">
              {/* Left */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-[#f5f5f5] border border-[#eaedf1] text-[#8b8b8b] hover:text-[#202020]"
                >
                  <Menu className="h-4 w-4" />
                </button>

                {/* Workspace switcher */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#242424] border border-[#333333] hover:border-[#FF6B35]/40 text-sm font-medium text-[#F5F5F5] transition-all"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#FF6B35]" />
                    <span className="max-w-[130px] truncate">{selectedWorkspace.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-[#8b8b8b]" />
                  </button>

                  {showWorkspaceDropdown && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowWorkspaceDropdown(false)} />
                      <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-[#1E1E1E] border border-[#333333] p-1.5 shadow-2xl z-30">
                        <div className="px-2 py-1 text-[10px] font-bold text-[#8b8b8b] uppercase tracking-widest">Workspaces</div>
                        <div className="flex flex-col gap-0.5 mt-1 max-h-44 overflow-y-auto">
                          {workspaces.map((ws) => (
                            <button
                              key={ws.id}
                              type="button"
                              onClick={() => handleSelectWorkspace(ws)}
                              className={`flex flex-col items-start w-full px-2.5 py-2 rounded-lg text-left transition-all text-xs ${selectedWorkspace.id === ws.id
                                ? "bg-[rgba(255,107,53,0.08)] border-l-2 border-[#FF6B35] pl-2 text-[#FF6B35] font-semibold"
                                : "text-[#8b8b8b] hover:bg-[#242424] hover:text-[#F5F5F5]"
                                }`}
                            >
                              <span className="font-medium">{ws.name}</span>
                              <span className="text-[10px] text-[#c0c0c0] truncate w-full mt-0.5">{ws.description || "No description"}</span>
                            </button>
                          ))}
                        </div>
                        <div style={{ borderTop: "1px solid #333333" }} className="mt-1.5 pt-1.5">
                          <button
                            type="button"
                            onClick={() => { setShowNewWorkspaceModal(true); setShowWorkspaceDropdown(false); }}
                            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-medium text-[#FF6B35] hover:bg-[rgba(255,107,53,0.06)] transition-all border border-dashed border-[rgba(255,107,53,0.3)]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            New Workspace
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2">
                {/* Search */}
                <button
                  type="button"
                  onClick={() => setShowSearchModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1E1E1E] border border-[#333333] hover:border-[#FF6B35]/40 text-xs text-[#8b8b8b] font-medium hover:text-[#F5F5F5] transition-all"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Search...</span>
                  <kbd className="hidden md:inline-flex h-4 items-center gap-0.5 rounded border border-[#333333] bg-[#242424] px-1 text-[10px] font-mono text-[#7A7A7A]">⌘K</kbd>
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-xl bg-[#1E1E1E] border border-[#333333] hover:border-[#FF6B35]/40 text-[#8b8b8b] hover:text-[#F5F5F5] transition-all relative"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
                  </button>

                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
                      <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-[#1E1E1E] border border-[#333333] p-1.5 shadow-2xl z-30">
                        <div className="px-2.5 py-1.5 border-b border-[#333333] flex justify-between items-center">
                          <span className="text-[10px] font-bold text-[#F5F5F5] uppercase tracking-widest">Notifications</span>
                          <span className="bg-[#FF6B35]/15 text-[#FF6B35] font-semibold px-2 py-0.5 rounded text-[10px]">2 New</span>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1 max-h-56 overflow-y-auto">
                          {[
                            { title: "PR review workflow failed", body: "Workflow: PR Code Review Automator failed to retrieve files.", time: "5 mins ago" },
                            { title: "Stripe invoice paid", body: "PRO Plan renewal completed successfully ($79.00).", time: "2 hours ago" },
                          ].map((n) => (
                            <div key={n.title} className="px-2.5 py-2 rounded-lg hover:bg-[#242424] cursor-pointer">
                              <p className="text-xs font-semibold text-[#F5F5F5]">{n.title}</p>
                              <p className="text-[10px] text-[#B3B3B3] mt-0.5">{n.body}</p>
                              <p className="text-[9px] text-[#FF6B35] mt-1">{n.time}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-[#1E1E1E] border border-transparent hover:border-[#333333] transition-all"
                  >
                    <div className="h-7 w-7 rounded-full bg-[#242424] flex items-center justify-center border border-[#333333]">
                      <User className="h-4 w-4 text-[#8b8b8b]" />
                    </div>
                    <ChevronDown className="h-3 w-3 text-[#8b8b8b]" />
                  </button>

                  {showProfileDropdown && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowProfileDropdown(false)} />
                      <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#1E1E1E] border border-[#333333] p-1.5 shadow-2xl z-30">
                        <div className="px-2.5 py-2 border-b border-[#333333]">
                          <p className="text-xs font-bold text-[#F5F5F5] leading-none">{user?.name || "User"}</p>
                          <p className="text-[10px] text-[#B3B3B3] mt-1 truncate">{user?.email || ""}</p>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1">
                          <Link
                             to="/dashboard/settings"
                             onClick={() => setShowProfileDropdown(false)}
                             className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#8b8b8b] hover:text-[#F5F5F5] hover:bg-[#242424] transition-all"
                          >
                            <User className="h-3.5 w-3.5" /> My Profile
                          </Link>
                          <button
                            type="button"
                            onClick={() => { setShowSubscriptionModal(true); setShowProfileDropdown(false); }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#8b8b8b] hover:text-[#F5F5F5] hover:bg-[#242424] transition-all text-left w-full"
                          >
                            <CreditCard className="h-3.5 w-3.5" /> Upgrade Plan
                          </button>
                          <button
                            type="button"
                            onClick={() => { alert("Invite Link generated!"); setShowProfileDropdown(false); }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#8b8b8b] hover:text-[#F5F5F5] hover:bg-[#242424] transition-all text-left w-full"
                          >
                            <Plus className="h-3.5 w-3.5" /> Invite Members
                          </button>
                        </div>
                        <div style={{ borderTop: "1px solid #333333" }} className="mt-1.5 pt-1">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-all text-left w-full"
                          >
                            <LogOut className="h-3.5 w-3.5" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>
          )}

          {/* Page content */}
          <main className={isChatRoute ? "flex-1 overflow-hidden bg-transparent" : "flex-1 overflow-y-auto p-4 lg:p-6 bg-transparent"}>
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 rounded-full border-2 border-[rgba(255,107,53,0.2)] border-t-[#FF6B35] animate-spin" />
                  <span className="text-xs text-[#8b8b8b]">Loading your session...</span>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>

      {/* ── Subscription Modal popup overlay ── */}
      {showSubscriptionModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(6px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 24,
            width: "100%",
            maxWidth: 850,
            padding: 32,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            textAlign: "left",
            position: "relative",
            maxHeight: "90vh",
            overflowY: "auto",
            fontFamily: "'Instrument Sans', sans-serif"
          }} className="ws-scroll">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setShowSubscriptionModal(false);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "#f7f6f3",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8f8c88",
                cursor: "pointer",
                transition: "all 120ms"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#0f0e0d"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#8f8c88"}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#22D3EE" }}>Membership Options</span>
              <h3 style={{ fontSize: 20, fontWeight: 750, color: "#0f0e0d", margin: "4px 0 0" }}>Select Subscription Plan</h3>
              <p style={{ fontSize: 13, color: "#4a4845", margin: "6px 0 0" }}>Access high-speed token boundaries, custom agent profiles, and automated visual canvas integrations.</p>

              {/* Monthly/Yearly Toggle */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, margin: "20px auto 0", width: "fit-content" }}>
                <div style={{ display: "flex", backgroundColor: "#f2f1ee", borderRadius: 20, padding: 3 }}>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    style={{
                      padding: "6px 16px",
                      border: "none",
                      outline: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 17,
                      backgroundColor: billingCycle === "monthly" ? "#ffffff" : "transparent",
                      color: billingCycle === "monthly" ? "#0f0e0d" : "#8f8c88",
                      boxShadow: billingCycle === "monthly" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                      transition: "all 150ms ease"
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("yearly")}
                    style={{
                      padding: "6px 16px",
                      border: "none",
                      outline: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 17,
                      backgroundColor: billingCycle === "yearly" ? "#ffffff" : "transparent",
                      color: billingCycle === "yearly" ? "#0f0e0d" : "#8f8c88",
                      boxShadow: billingCycle === "yearly" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 150ms ease"
                    }}
                  >
                    Yearly
                    <span style={{
                      backgroundColor: "#22D3EE",
                      color: "#ffffff",
                      fontSize: 10,
                      fontWeight: 600,
                      borderRadius: 10,
                      padding: "2px 6px",
                      marginLeft: 4
                    }}>
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", 
                gap: 20,
                alignItems: "stretch"
              }} 
              className="plan-cards-row"
            >
              
              {/* Free Tier */}
              <div 
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 16,
                  padding: 20,
                  background: "#f7f6f3",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 320,
                  height: "100%"
                }}
                className="plan-card"
              >
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8f8c88" }}>STARTER</span>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#0f0e0d", margin: "4px 0" }}>Core Plan</h4>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0f0e0d", margin: "10px 0", opacity: priceOpacity, transition: "opacity 150ms" }}>
                    ₹0 <span style={{ fontSize: 12, fontWeight: 500, color: "#8f8c88" }}>/ month</span>
                  </div>

                  {/* Token count highlight */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 6, padding: "6px 10px", margin: "12px 0" }}>
                    <Zap style={{ width: 14, height: 14, color: "#8f8c88" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0f0e0d", fontFamily: "Geist Mono, monospace" }}>
                      50K tokens / mo
                    </span>
                    <span style={{ fontSize: 13, color: "#8f8c88" }}> included</span>
                  </div>

                  <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#4a4845", flex: 1 }} className="feature-list">
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> 1 Active Workspace</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> 3 AI Agents Online</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> 500 API Requests / mo</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> 50,000 tokens / month</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> Basic analytics dashboard</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> Community support</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6, color: "#b5b2ae" }}><X style={{ width: 13, height: 13, color: "#d1cec9" }} /> Workflow automation</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6, color: "#b5b2ae" }}><X style={{ width: 13, height: 13, color: "#d1cec9" }} /> Team collaboration</li>
                  </ul>
                </div>
                <button
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    background: "#f2f1ee",
                    border: "none",
                    borderRadius: 10,
                    color: "#8f8c88",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "default",
                    opacity: 0.6,
                    marginTop: "auto"
                  }}
                  className="cta-button"
                >
                  Current Plan
                </button>
              </div>

              {/* PRO Tier */}
              <div 
                style={{
                  border: "1px solid rgba(34,211,238,0.25)",
                  borderRadius: 16,
                  padding: 20,
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 320,
                  position: "relative",
                  overflow: "visible",
                  height: "100%"
                }}
                className="plan-card"
              >
                {/* Popular badge overlapping top border */}
                <span style={{
                  position: "absolute",
                  top: -13,
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#22D3EE",
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "4px 12px",
                  borderRadius: 20,
                  zIndex: 10,
                  whiteSpace: "nowrap"
                }}>
                  Popular
                </span>

                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#22D3EE" }}>PRO</span>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#0f0e0d", margin: "4px 0" }}>PRO Plan</h4>
                  
                  {/* Dynamic price with fade transition */}
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0f0e0d", margin: "10px 0", opacity: priceOpacity, transition: "opacity 150ms", display: "flex", alignItems: "baseline", gap: 6 }}>
                    {billingCycle === "yearly" ? (
                      <>
                        ₹5,200 
                        <span style={{ textDecoration: "line-through", fontSize: 14, fontWeight: 500, color: "#b5b2ae" }}>₹6,500</span>
                      </>
                    ) : (
                      "₹6,500"
                    )}
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#8f8c88" }}>/ month</span>
                  </div>

                  {/* Token count highlight */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 6, padding: "6px 10px", margin: "12px 0" }}>
                    <Zap style={{ width: 14, height: 14, color: "#22D3EE" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0f0e0d", fontFamily: "Geist Mono, monospace" }}>
                      2M tokens / mo
                    </span>
                    <span style={{ fontSize: 13, color: "#8f8c88" }}> included</span>
                  </div>

                  <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#4a4845", flex: 1 }} className="feature-list">
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#22D3EE" }} /> Unlimited Workspaces</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#22D3EE" }} /> Unlimited AI Agents</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#22D3EE" }} /> 100,000 Requests / mo</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#22D3EE" }} /> 2,000,000 tokens / month</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#22D3EE" }} /> Slack & Notion Sync</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#22D3EE" }} /> Full analytics + cost tracking</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#22D3EE" }} /> Workflow automation</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#22D3EE" }} /> Priority support</li>
                  </ul>
                </div>

                {subscription?.plan === "PRO" ? (
                  <button
                    disabled
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      background: "#f2f1ee",
                      border: "none",
                      borderRadius: 10,
                      color: "#8f8c88",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "default",
                      opacity: 0.6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      marginTop: "auto"
                    }}
                    className="cta-button"
                  >
                    <Zap style={{ width: 12, height: 12, color: "#8f8c88" }} />
                    Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade("PRO")}
                    disabled={checkoutLoading !== null}
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      background: "#22D3EE",
                      border: "none",
                      borderRadius: 10,
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "background 120ms",
                      marginTop: "auto"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#d4612a"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#22D3EE"; }}
                    className="cta-button"
                  >
                    {checkoutLoading === "PRO" ? (
                      <span style={{
                        width: 12,
                        height: 12,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite"
                      }} />
                    ) : <Zap style={{ width: 12, height: 12 }} />}
                    Upgrade to Pro →
                  </button>
                )}
              </div>

              {/* ENTERPRISE Tier */}
              <div 
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 16,
                  padding: 20,
                  background: "#f7f6f3",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 320,
                  height: "100%"
                }}
                className="plan-card"
              >
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8f8c88" }}>ENTERPRISE</span>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#0f0e0d", margin: "4px 0" }}>Enterprise Plan</h4>
                  
                  {/* Dynamic price with fade transition */}
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0f0e0d", margin: "10px 0", opacity: priceOpacity, transition: "opacity 150ms", display: "flex", alignItems: "baseline", gap: 6 }}>
                    {billingCycle === "yearly" ? (
                      <>
                        ₹20,000 
                        <span style={{ textDecoration: "line-through", fontSize: 14, fontWeight: 500, color: "#b5b2ae" }}>₹25,000</span>
                      </>
                    ) : (
                      "₹25,000"
                    )}
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#8f8c88" }}>/ month</span>
                  </div>

                  {/* Token count highlight */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 6, padding: "6px 10px", margin: "12px 0" }}>
                    <Zap style={{ width: 14, height: 14, color: "#0f0e0d" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0f0e0d", fontFamily: "Geist Mono, monospace" }}>
                      Custom limit
                    </span>
                    <span style={{ fontSize: 13, color: "#8f8c88" }}> included</span>
                  </div>

                  <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#4a4845", flex: 1 }} className="feature-list">
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> Everything in Pro</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> Dedicated API Routing</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> Isolated Vector RAG DB</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> Dedicated Support SLA</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> Custom token limits</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> SSO / SAML auth</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> Audit logs + compliance</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 6 }}><Check style={{ width: 13, height: 13, color: "#2d9e6b" }} /> On-premise option</li>
                  </ul>
                </div>

                {subscription?.plan === "ENTERPRISE" ? (
                  <button
                    disabled
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      background: "#f2f1ee",
                      border: "none",
                      borderRadius: 10,
                      color: "#8f8c88",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "default",
                      opacity: 0.6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      marginTop: "auto"
                    }}
                    className="cta-button"
                  >
                    <Sparkles style={{ width: 12, height: 12, color: "#8f8c88" }} />
                    Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade("ENTERPRISE")}
                    disabled={checkoutLoading !== null}
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      background: "#0f0e0d",
                      border: "none",
                      borderRadius: 10,
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "background 120ms",
                      marginTop: "auto"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2a2a"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#0f0e0d"; }}
                    className="cta-button"
                  >
                    {checkoutLoading === "ENTERPRISE" ? (
                      <span style={{
                        width: 12,
                        height: 12,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite"
                      }} />
                    ) : <Sparkles style={{ width: 12, height: 12 }} />}
                    Upgrade to Enterprise
                  </button>
                )}
              </div>

            </div>

            {/* Footer Trust Bar inside modal */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 28px",
              borderTop: "1px solid rgba(0,0,0,0.07)",
              backgroundColor: "#faf9f7",
              margin: "24px -32px -32px -32px",
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24
            }}>
              <div style={{ fontSize: 12, color: "#8f8c88" }}>
                🔒 Payments secured by Stripe · SSL encrypted
              </div>
              <div style={{ fontSize: 12, color: "#8f8c88" }}>
                ₹ INR · Prices include GST
              </div>
              <div style={{ fontSize: 12, color: "#22D3EE" }}>
                Questions? <span 
                  onClick={() => alert("Support chat initiated.")}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  Talk to us →
                </span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
