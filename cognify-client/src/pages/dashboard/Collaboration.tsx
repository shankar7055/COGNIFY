import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Clock,
  Send,
  Plus,
  Share2,
  Trash2,
  FolderOpen,
  UserCheck
} from "lucide-react";
import { api } from "../../utils/api";

export const Collaboration = () => {
  // Team states
  const [memberships, setMemberships] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  
  // Workspaces list for sharing
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspaceToShare, setSelectedWorkspaceToShare] = useState<string>("");

  // Comments feed state
  const [comments, setComments] = useState<any[]>([]);
  const [activeWorkspaceFilter, setActiveWorkspaceFilter] = useState("All Workspaces");
  const [newCommentText, setNewCommentText] = useState("");

  // Comment reactions state
  const [commentReactions, setCommentReactions] = useState<{ [commentId: string]: { [emoji: string]: number } }>({});

  // Comment replies state
  const [replyInputVisible, setReplyInputVisible] = useState<{ [commentId: string]: boolean }>({});
  const [replyText, setReplyText] = useState<{ [commentId: string]: string }>({});
  const [commentReplies, setCommentReplies] = useState<{ [commentId: string]: any[] }>({});

  const handleAddReaction = (commentId: string, emoji: string) => {
    setCommentReactions(prev => {
      const current = prev[commentId] || {};
      return {
        ...prev,
        [commentId]: {
          ...current,
          [emoji]: (current[emoji] || 0) + 1
        }
      };
    });
  };

  const handlePostReply = (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = replyText[commentId];
    if (!text || !text.trim()) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      user: { name: "Shankar H (you)" },
      content: text,
      created_at: new Date().toISOString()
    };

    setCommentReplies(prev => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), newReply]
    }));

    setReplyText(prev => ({ ...prev, [commentId] : "" }));
    setReplyInputVisible(prev => ({ ...prev, [commentId]: false }));
  };

  // Invite member form states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("VIEWER");

  // New team creation state
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  // Fetch teams and workspaces
  const fetchTeamsAndWorkspaces = async () => {
    try {
      const teamRes = await api.get("/teams/my-teams");
      setMemberships(teamRes.data || []);
      
      if (teamRes.data && teamRes.data.length > 0) {
        // Find if we already had a selected team, otherwise select the first
        const currentSelectedId = selectedTeam?.id;
        const matchingMembership = teamRes.data.find((m: any) => m.team?.id === currentSelectedId);
        setSelectedTeam(matchingMembership ? matchingMembership.team : teamRes.data[0].team);
      } else {
        setSelectedTeam(null);
      }

      const wsRes = await api.get("/workspaces");
      setWorkspaces(wsRes.data || []);
      if (wsRes.data && wsRes.data.length > 0) {
        setSelectedWorkspaceToShare(wsRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load collaboration data:", err);
    }
  };

  useEffect(() => {
    fetchTeamsAndWorkspaces();
  }, []);

  // Fetch comments when workspace filter changes
  useEffect(() => {
    const fetchComments = async () => {
      if (!workspaces.length) return;

      try {
        let loadedComments: any[] = [];

        if (activeWorkspaceFilter === "All Workspaces") {
          // Aggregate comments from all accessible workspaces
          for (const ws of workspaces) {
            const res = await api.get(`/comments/${ws.id}`);
            if (res.data) {
              const enriched = res.data.map((c: any) => ({ ...c, workspaceName: ws.name }));
              loadedComments = [...loadedComments, ...enriched];
            }
          }
        } else {
          const ws = workspaces.find((w) => w.name === activeWorkspaceFilter);
          if (ws) {
            const res = await api.get(`/comments/${ws.id}`);
            if (res.data) {
              loadedComments = res.data.map((c: any) => ({ ...c, workspaceName: ws.name }));
            }
          }
        }

        // Sort comments by timestamp ascending
        loadedComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setComments(loadedComments);
      } catch (err) {
        console.error("Failed to load workspace comments:", err);
      }
    };

    fetchComments();
  }, [activeWorkspaceFilter, workspaces]);

  // Create a new team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      const res = await api.post("/teams/create", { name: newTeamName });
      setNewTeamName("");
      setShowNewTeamModal(false);
      await fetchTeamsAndWorkspaces();
      
      // Select the newly created team
      if (res.data) {
        setSelectedTeam(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create team");
    }
  };

  // Invite team member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedTeam) return;

    try {
      await api.post(`/teams/${selectedTeam.id}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail("");
      setShowInviteModal(false);
      await fetchTeamsAndWorkspaces();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to invite member");
    }
  };

  // Share workspace with team
  const handleShareWorkspace = async () => {
    if (!selectedTeam || !selectedWorkspaceToShare) return;

    try {
      await api.post(`/teams/${selectedTeam.id}/workspaces/${selectedWorkspaceToShare}`);
      alert("Workspace shared with team successfully!");
      await fetchTeamsAndWorkspaces();
    } catch (err: any) {
      alert(err.response?.data?.message || "Workspace is already shared with this team");
    }
  };

  // Remove a member from team
  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam) return;
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await api.delete(`/teams/${selectedTeam.id}/members/${memberId}`);
      await fetchTeamsAndWorkspaces();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  // Post a workspace comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !workspaces.length) return;

    try {
      // Post to the first workspace or the filtered one
      let targetWorkspaceId = workspaces[0].id;
      if (activeWorkspaceFilter !== "All Workspaces") {
        const ws = workspaces.find((w) => w.name === activeWorkspaceFilter);
        if (ws) targetWorkspaceId = ws.id;
      }

      const res = await api.post(`/comments/${targetWorkspaceId}`, {
        content: newCommentText,
      });

      // Insert comment locally in sorted order
      const newComment = {
        ...res.data,
        workspaceName: workspaces.find((w) => w.id === targetWorkspaceId)?.name || "Workspace",
      };

      setComments((prev) => [...prev, newComment]);
      setNewCommentText("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to post comment");
    }
  };

  // Get current user's role in the selected team
  const getMyRoleInTeam = () => {
    if (!selectedTeam) return "VIEWER";
    const membership = memberships.find((m: any) => m.team?.id === selectedTeam.id);
    return membership?.role || "VIEWER";
  };

  const isCurrentAdmin = getMyRoleInTeam() === "ADMIN";

  const activeComments = comments;

  return (
    <div className="flex flex-col gap-6 select-none h-full text-left">
      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-base font-bold text-[var(--dash-text)] leading-none">Invite Team Member</h3>
            <p className="text-xs text-[var(--dash-muted)] mt-2">Grant access to shared directories, prompts, and analytics.</p>
            
            <form onSubmit={handleInviteMember} className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[var(--dash-muted)] font-bold uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="user@cognify.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] placeholder-[#c0c0c0] focus:border-[#22D3EE] outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[var(--dash-muted)] font-bold uppercase tracking-wider">Workspace Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] focus:border-[#22D3EE] outline-none cursor-pointer"
                >
                  <option value="VIEWER">Viewer (Read logs and charts)</option>
                  <option value="EDITOR">Editor (Trigger agents, modify prompts)</option>
                  <option value="ADMIN">Admin (Full privileges, invites, sharing)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-[var(--dash-hover)] hover:bg-[var(--dash-hover)] text-[var(--dash-text)] rounded-xl text-xs font-bold border border-[var(--dash-border)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[rgba(34,211,238,0.1)] hover:bg-[rgba(34,211,238,0.2)] text-[#22D3EE] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Team Modal */}
      {showNewTeamModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-base font-bold text-[var(--dash-text)] leading-none">Create a New Team</h3>
            <p className="text-xs text-[var(--dash-muted)] mt-2">Create a team workspace to collaborate with other developers.</p>
            
            <form onSubmit={handleCreateTeam} className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[var(--dash-muted)] font-bold uppercase tracking-wider">Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Core Team"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] placeholder-[#c0c0c0] focus:border-[#22D3EE] outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTeamModal(false)}
                  className="px-4 py-2 bg-[var(--dash-hover)] hover:bg-[var(--dash-hover)] text-[var(--dash-text)] rounded-xl text-xs font-bold border border-[var(--dash-border)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[rgba(34,211,238,0.1)] hover:bg-[rgba(34,211,238,0.2)] text-[#22D3EE] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
        <div>
          <h1 className="text-lg font-bold text-[var(--dash-text)]">Collaboration Hub</h1>
          <p className="text-xs text-[var(--dash-muted2)] mt-1">
            Manage organization teams, invite developers, share workspace resources, and comment in real time.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowNewTeamModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--dash-card-bg)] border border-[var(--dash-border)] hover:border-[var(--dash-border)] text-xs font-bold text-[var(--dash-text)] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Team
          </button>
          {selectedTeam && isCurrentAdmin && (
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[rgba(34,211,238,0.10)] hover:bg-[rgba(34,211,238,0.15)] text-xs font-bold text-[#22D3EE] border border-[#22D3EE]/30 transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" /> Invite Member
            </button>
          )}
        </div>
      </div>


      {/* Team Selection Bar */}
      {memberships.length > 0 && (
        <div className="flex items-center gap-3 bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl p-3">
          <span className="text-[10px] text-neutral-550 font-bold uppercase tracking-wider">Active Team:</span>
          <div className="flex gap-2">
            {memberships.map((m: any) => {
              const active = selectedTeam?.id === m.team?.id;
              return (
                <button
                  key={m.team?.id}
                  onClick={() => setSelectedTeam(m.team)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    active
                      ? "bg-[rgba(34,211,238,0.1)] border-[#22D3EE]/30 text-[#22D3EE]"
                      : "bg-[var(--dash-card-bg)] border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                  }`}
                >
                  {m.team?.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Directory left, Activity stream right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start flex-1 overflow-hidden">
        {/* Left Column: Team Directory & Workspace Sharing */}
        <div className="flex flex-col gap-6">
          {/* Team Directory */}
          <div className="rounded-xl p-5 flex flex-col gap-4 bg-[var(--dash-card-bg)] border border-neutral-250 shadow-sm text-left animate-fade-in">
            <h2 className="text-xs font-bold text-[var(--dash-text)] border-b border-[var(--dash-border)] pb-3 leading-none flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-[#22D3EE]" />
                Team Directory
                {selectedTeam && (
                  <span className="bg-[var(--cyan-dim)] text-[#22D3EE] border border-[var(--cyan-border)] px-1.5 py-0.25 rounded-full text-[10px] font-mono font-bold ml-1.5">
                    {selectedTeam.members?.length || 0}
                  </span>
                )}
              </span>
              {selectedTeam && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--dash-hover)] text-[var(--dash-muted)] font-bold uppercase tracking-wider">
                  Role: {getMyRoleInTeam()}
                </span>
              )}
            </h2>

            {!selectedTeam ? (
              <div className="text-center py-8 text-[var(--dash-muted)] text-xs font-semibold">
                No active teams. Create a team above to get started.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                {selectedTeam.members?.map((member: any) => (
                  <div 
                    key={member.id} 
                    className="flex flex-col gap-2 p-3.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card-bg)] hover:bg-[var(--dash-hover)]/20 transition-all text-left shadow-sm group relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#22D3EE]/10 flex items-center justify-center text-xs font-bold text-[#22D3EE] border border-[var(--cyan-border)]">
                          {(member.user?.name || "U")[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden text-left">
                          <span className="text-xs font-bold text-[var(--dash-text)]">{member.user?.name}</span>
                          <span className="text-[10px] text-[var(--dash-muted2)] truncate w-[140px] sm:w-full">{member.user?.email}</span>
                        </div>
                      </div>
                      {isCurrentAdmin && member.user?.id !== selectedTeam.members.find((m: any) => m.role === "ADMIN" && m.user_id === selectedTeam.members[0].user_id)?.user_id && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 rounded hover:bg-red-50 text-[var(--dash-muted)] hover:text-red-655 opacity-0 group-hover:opacity-100 transition-all shrink-0 cursor-pointer bg-transparent border-none"
                          title="Remove Member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {/* Indented Role Section */}
                    <div className="pl-11 flex items-center gap-1.5 -mt-1">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        member.role === "ADMIN" 
                          ? "bg-[var(--red-dim)] text-[#dc2626] border border-[rgba(220,38,38,0.2)]" 
                          : member.role === "EDITOR"
                            ? "bg-[var(--cyan-dim)] text-[#22D3EE] border border-[var(--cyan-border)]"
                            : "bg-[var(--bg-card)] text-[var(--dash-muted2)] border border-[var(--border)]"
                      }`}>
                        {member.role}
                      </span>
                      <span className="text-[9px] text-[var(--dash-muted2)] font-medium">Joined {new Date(selectedTeam.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workspace Sharing Panel */}
          {selectedTeam && (
            <div className="rounded-xl p-5 flex flex-col gap-4 bg-[var(--dash-card-bg)] border border-neutral-250 shadow-sm text-left">
              <h2 className="text-xs font-bold text-[var(--dash-text)] border-b border-[var(--dash-border)] pb-3 leading-none flex items-center gap-1.5">
                <Share2 className="h-4 w-4 text-[#22D3EE]" />
                Share Workspaces
              </h2>
              
              <div className="flex flex-col gap-3">
                <p className="text-[10.5px] text-[var(--dash-muted2)] leading-normal text-left">
                  Select a local workspace to share with all members of <strong>{selectedTeam.name}</strong>.
                </p>

                <div className="flex flex-col gap-2 mt-1">
                  <select
                    value={selectedWorkspaceToShare}
                    onChange={(e) => setSelectedWorkspaceToShare(e.target.value)}
                    className="w-full bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-lg px-3 py-2 text-xs text-[var(--dash-text)] focus:border-[#22D3EE] outline-none cursor-pointer h-[34px]"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>{ws.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleShareWorkspace}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-bold text-white bg-[rgba(34,211,238,0.1)] hover:bg-[rgba(34,211,238,0.15)] border border-[#22D3EE]/30 transition-all cursor-pointer mt-1 text-[#22D3EE] h-[34px]"
                  >
                    <Share2 className="h-4 w-4" /> Share with Team
                  </button>
                </div>

                {/* List of currently shared workspaces */}
                {selectedTeam.team_workspaces && selectedTeam.team_workspaces.length > 0 && (
                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[var(--dash-border)] text-left">
                    <span className="text-[9px] text-[var(--dash-muted2)] font-bold uppercase tracking-wider block mb-1">Shared Workspaces ({selectedTeam.team_workspaces.length}):</span>
                    {selectedTeam.team_workspaces.map((tw: any) => (
                      <div key={tw.id} className="flex items-center justify-between p-2 rounded bg-[var(--dash-hover)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)]">
                        <span className="flex items-center gap-1 truncate"><FolderOpen className="h-3.5 w-3.5 text-[var(--dash-muted)] shrink-0" />{tw.workspace?.name}</span>
                        {isCurrentAdmin && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Unshare workspace "${tw.workspace?.name}"?`)) return;
                              try {
                                await api.delete(`/teams/${selectedTeam.id}/workspaces/${tw.workspace?.id}`);
                                await fetchTeamsAndWorkspaces();
                              } catch (err: any) {
                                alert(err.response?.data?.message || "Failed to unshare");
                              }
                            }}
                            className="text-neutral-550 hover:text-red-500 p-0.5 cursor-pointer bg-transparent border-none"
                            title="Unshare Workspace"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Columns (Span 2): Live Activity Feed & Thread Comments */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {/* Thread Comments */}
          <div className="rounded-xl p-5 flex flex-col justify-between flex-1 min-h-[480px] bg-[var(--dash-card-bg)] border border-neutral-250 shadow-sm text-left">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
                <h3 className="text-xs font-bold text-[var(--dash-text)] leading-none flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-[#22D3EE]" />
                  Shared Workspace Comments
                </h3>
                {/* Workspace comment filter */}
                <select
                  value={activeWorkspaceFilter}
                  onChange={(e) => setActiveWorkspaceFilter(e.target.value)}
                  className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl px-2 py-1 text-[10.5px] font-bold text-neutral-550 focus:text-[var(--dash-text)] outline-none focus:ring-0 cursor-pointer h-[28px]"
                >
                  <option value="All Workspaces">All Shared Workspaces</option>
                  {workspaces.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>

              {/* Comments Scroll */}
              <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
                {activeComments.length === 0 ? (
                  <div className="text-center py-16 text-[var(--dash-muted)] text-xs font-semibold">
                    No comments found in this workspace filter. Add the first comment below!
                  </div>
                ) : (
                  activeComments.map((c) => {
                    const reactions = commentReactions[c.id] || {};
                    const replies = commentReplies[c.id] || [];
                    const isReplyFormOpen = replyInputVisible[c.id] || false;

                    return (
                      <div key={c.id} className="flex flex-col gap-3 text-xs bg-[var(--dash-card-bg)] border border-[var(--dash-border)] p-4 rounded-xl shadow-sm text-left">
                        {/* Parent Comment */}
                        <div className="flex gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-[#22D3EE]/10 border border-[var(--cyan-border)] flex items-center justify-center text-[10.5px] font-bold text-[#22D3EE] shrink-0">
                            {(c.user?.name || "U")[0].toUpperCase()}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[var(--dash-text)]">{c.user?.name}</span>
                              <span className="text-[9px] text-[var(--dash-muted2)]">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[var(--dash-muted)] mt-1 leading-normal select-text">
                              {c.content}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-3 mt-2.5">
                              {/* Workspace Tag */}
                              <span className="text-[9px] bg-[var(--dash-hover)] text-[var(--dash-muted2)] px-1.5 py-0.25 rounded border border-[var(--dash-border)] font-semibold font-mono">
                                #{c.workspaceName || "General"}
                              </span>

                              {/* Clickable Reactions */}
                              <div className="flex items-center gap-1.5">
                                {["👍", "❤️", "🔥", "🚀"].map((emoji) => {
                                  const count = reactions[emoji] || 0;
                                  return (
                                    <button
                                      key={emoji}
                                      onClick={() => handleAddReaction(c.id, emoji)}
                                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] cursor-pointer hover:bg-[var(--dash-hover)] transition-all ${
                                        count > 0 
                                          ? "bg-[var(--cyan-dim)] border-[var(--cyan-border)] text-[#22D3EE]" 
                                          : "bg-[var(--dash-card-bg)] border-[var(--dash-border)] text-[var(--dash-muted)]"
                                      }`}
                                    >
                                      <span>{emoji}</span>
                                      {count > 0 && <span className="font-bold font-mono">{count}</span>}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Toggle Reply Input */}
                              <button
                                onClick={() => setReplyInputVisible(prev => ({ ...prev, [c.id]: !isReplyFormOpen }))}
                                className="text-[10px] font-bold text-[#22D3EE] hover:underline bg-transparent border-none cursor-pointer"
                              >
                                + Reply
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Nested Replies Thread */}
                        {replies.length > 0 && (
                          <div className="border-l-2 border-[var(--dash-border)] ml-3.5 pl-4 flex flex-col gap-2.5 mt-1">
                            {replies.map((reply: any) => (
                              <div key={reply.id} className="flex gap-2 text-xs bg-[var(--dash-hover)] p-2.5 rounded-lg border border-[var(--dash-border)]/60">
                                <div className="h-6 w-6 rounded-full bg-neutral-200 border border-[var(--dash-border)] flex items-center justify-center text-[9px] font-bold text-neutral-750 shrink-0">
                                  {(reply.user?.name || "U")[0].toUpperCase()}
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-[var(--dash-text)]">{reply.user?.name}</span>
                                    <span className="text-[9px] text-[var(--dash-muted2)]">{new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-[var(--dash-muted)] mt-0.5 leading-normal select-text">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Reply Form */}
                        {isReplyFormOpen && (
                          <form onSubmit={(e) => handlePostReply(c.id, e)} className="flex gap-2 ml-7 mt-1">
                            <input
                              type="text"
                              required
                              placeholder="Write a reply..."
                              value={replyText[c.id] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setReplyText(prev => ({ ...prev, [c.id]: val }));
                              }}
                              className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-lg px-2.5 py-1 text-xs text-[var(--dash-text)] focus:border-[#22D3EE] outline-none flex-1 font-sans"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1 bg-[var(--cyan-dim)] text-[#22D3EE] border border-[var(--cyan-border)] rounded-lg text-[10.5px] font-bold hover:bg-[rgba(34,211,238,0.15)] cursor-pointer shrink-0 transition-all h-[26px] flex items-center"
                            >
                              Reply
                            </button>
                          </form>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Comment Form Input */}
            {workspaces.length > 0 && (
              <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-[var(--dash-border)]">
                {/* Mention Toolbar */}
                <div className="flex gap-2 px-1">
                  <button
                    type="button"
                    onClick={() => setNewCommentText((prev) => prev + " @Priya ")}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--dash-hover)] hover:bg-neutral-200 text-[10px] font-semibold text-[var(--dash-muted)] transition-all cursor-pointer border-none"
                  >
                    <span>@ mention member</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const wsTag = activeWorkspaceFilter === "All Workspaces" ? (workspaces[0]?.name || "workspace") : activeWorkspaceFilter;
                      setNewCommentText((prev) => prev + ` #${wsTag} `);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--dash-hover)] hover:bg-neutral-200 text-[10px] font-semibold text-[var(--dash-muted)] transition-all cursor-pointer border-none"
                  >
                    <span># tag workspace</span>
                  </button>
                </div>

                <form onSubmit={handlePostComment} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Post comment in #${activeWorkspaceFilter === "All Workspaces" ? workspaces[0].name : activeWorkspaceFilter}...`}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--dash-text)] placeholder-[#c0c0c0] focus:border-[#22D3EE]/30 focus:border-[var(--dash-border)] outline-none flex-1 font-sans"
                    required
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-[rgba(34,211,238,0.1)] hover:bg-[rgba(34,211,238,0.15)] text-[#22D3EE] transition-all shrink-0 flex items-center justify-center cursor-pointer border border-[#22D3EE]/30"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
