import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Plus, 
  History, 
  RotateCcw, 
  FileText, 
  ArrowLeftRight,
  GitCommit,
  CheckCircle,
  FileCode
} from "lucide-react";
import { api } from "../../utils/api";

interface PromptVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  created_at: string;
  diff?: string;
}

export const Prompts = () => {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(localStorage.getItem("activeWorkspaceId") || "");
  const [prompts, setPrompts] = useState<PromptVersion[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptVersion | null>(null);
  
  // Editor states
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Compare states
  const [compareMode, setCompareMode] = useState(false);
  const [versionA, setVersionA] = useState<number | "">("");
  const [versionB, setVersionB] = useState<number | "">("");
  const [diffText, setDiffText] = useState("");
  const [diffLoading, setDiffLoading] = useState(false);

  useEffect(() => {
    const handleWorkspaceChanged = () => {
      setActiveWorkspaceId(localStorage.getItem("activeWorkspaceId") || "");
    };
    window.addEventListener("activeWorkspaceIdChanged", handleWorkspaceChanged);
    return () => {
      window.removeEventListener("activeWorkspaceIdChanged", handleWorkspaceChanged);
    };
  }, []);

  const fetchPrompts = async () => {
    if (!activeWorkspaceId) return;
    try {
      setLoading(true);
      const res = await api.get(`/prompts/${activeWorkspaceId}`);
      setPrompts(res.data);
      if (res.data.length > 0) {
        setSelectedPrompt(res.data[0]);
        setEditTitle(res.data[0].title);
        setEditContent(res.data[0].content);
      } else {
        setSelectedPrompt(null);
        setEditTitle("");
        setEditContent("");
      }
    } catch (err) {
      console.error("Failed to load prompt versions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
    setCompareMode(false);
    setDiffText("");
  }, [activeWorkspaceId]);

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim() || !activeWorkspaceId) return;

    try {
      setSaving(true);
      const res = await api.post(`/prompts/${activeWorkspaceId}`, {
        title: editTitle,
        content: editContent
      });
      alert(`Successfully saved Prompt version ${res.data.version}!`);
      fetchPrompts();
    } catch (err) {
      console.error("Failed to save prompt version:", err);
      alert("Failed to save prompt version.");
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (version: number) => {
    if (!activeWorkspaceId) return;
    const confirmRollback = window.confirm(`Are you sure you want to rollback to version ${version}?`);
    if (!confirmRollback) return;

    try {
      setSaving(true);
      const res = await api.post(`/prompts/${activeWorkspaceId}/rollback/${version}`);
      alert(`Rolled back! Created new version ${res.data.version}.`);
      fetchPrompts();
    } catch (err) {
      console.error("Rollback failed:", err);
      alert("Failed to rollback prompt version.");
    } finally {
      setSaving(false);
    }
  };

  const handleCompare = async () => {
    if (versionA === "" || versionB === "" || !activeWorkspaceId) return;
    try {
      setDiffLoading(true);
      const res = await api.get(`/prompts/${activeWorkspaceId}/diff/${versionA}/${versionB}`);
      setDiffText(res.data.diff || "No differences found between versions.");
    } catch (err) {
      console.error("Failed to fetch diff:", err);
      setDiffText("Failed to compute diff between selected versions.");
    } finally {
      setDiffLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none flex items-center gap-2">
            <Terminal className="h-6 w-6 text-[#f17463]" />
            Prompt Studio
          </h1>
          <p className="text-xs text-[var(--dash-muted)] mt-2">
            Define system personas, test prompts, run visual diff compare checks, and roll back version controls.
          </p>
        </div>
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            compareMode 
              ? "bg-[rgba(241,116,99,0.08)] border-[#f17463] text-[#f17463]" 
              : "bg-neutral-900 border-neutral-800 text-[var(--dash-muted2)] hover:text-white"
          }`}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {compareMode ? "Editor Mode" : "Compare Versions"}
        </button>
      </div>

      {!activeWorkspaceId ? (
        <div className="dash-card rounded-2xl p-10 text-center text-[var(--dash-muted)] text-xs font-semibold">
          Please select a workspace to manage prompts.
        </div>
      ) : compareMode ? (
        /* Diff / Compare View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Version Picker Left */}
          <div className="dash-card rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white border-b border-neutral-900 pb-3 flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-[#f17463]" />
              Diff Selector
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--dash-muted2)] uppercase tracking-wider">Base Version (From)</label>
                <select
                  value={versionA}
                  onChange={(e) => setVersionA(e.target.value ? Number(e.target.value) : "")}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="">Select version...</option>
                  {prompts.map((p) => (
                    <option key={p.id} value={p.version}>v{p.version} - {p.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--dash-muted2)] uppercase tracking-wider">Target Version (To)</label>
                <select
                  value={versionB}
                  onChange={(e) => setVersionB(e.target.value ? Number(e.target.value) : "")}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="">Select version...</option>
                  {prompts.map((p) => (
                    <option key={p.id} value={p.version}>v{p.version} - {p.title}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCompare}
                disabled={versionA === "" || versionB === "" || diffLoading}
                className="w-full py-2 bg-[rgba(241,116,99,0.1)] hover:bg-[rgba(241,116,99,0.1)] disabled:bg-neutral-900 disabled:text-[var(--dash-muted)] disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-lg"
              >
                {diffLoading ? "Analyzing..." : "Compare Diff"}
              </button>
            </div>
          </div>

          {/* Diff Result Right */}
          <div className="lg:col-span-2 dash-card rounded-2xl p-5 min-h-[300px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white border-b border-neutral-900 pb-3">
                Visual Diff Output (Unified Patch)
              </h3>
              {diffText ? (
                <pre className="mt-4 bg-neutral-950 p-4 border border-neutral-850 rounded-xl font-mono text-xs text-neutral-300 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap">
                  {diffText.split("\n").map((line, idx) => {
                    const isAdded = line.startsWith("+") && !line.startsWith("+++");
                    const isRemoved = line.startsWith("-") && !line.startsWith("---");
                    return (
                      <div 
                        key={idx} 
                        className={isAdded ? "text-emerald-400 bg-emerald-950/20 px-1 rounded" : isRemoved ? "text-red-400 bg-red-950/20 px-1 rounded" : ""}
                      >
                        {line}
                      </div>
                    );
                  })}
                </pre>
              ) : (
                <div className="text-center py-20 text-xs text-[var(--dash-muted)]">
                  Select two prompt versions to see the side-by-side git-like patch.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Standard Edit & History View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* History Sidebar */}
          <div className="dash-card rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white border-b border-neutral-900 pb-3 flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-[#f17463]" />
              Version Logs
            </h3>

            {loading ? (
              <div className="text-center py-8 text-[var(--dash-muted)] text-xs">Loading versions...</div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-8 text-[var(--dash-muted)] text-xs">No saved versions. Create one on the right.</div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                {prompts.map((p) => {
                  const isActive = selectedPrompt?.id === p.id;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSelectedPrompt(p);
                        setEditTitle(p.title);
                        setEditContent(p.content);
                      }}
                      className={`p-3.5 rounded-xl border border-neutral-850 cursor-pointer flex flex-col gap-1 transition-all ${
                        isActive 
                          ? "bg-[rgba(241,116,99,0.08)] border-[rgba(241,116,99,0.3)]" 
                          : "bg-neutral-900/10 hover:border-neutral-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white leading-none">v{p.version} - {p.title}</span>
                        <GitCommit className={`h-4 w-4 ${isActive ? "text-[#f17463]" : "text-[var(--dash-muted)]"}`} />
                      </div>
                      <span className="text-[9px] text-[var(--dash-muted)] mt-1">
                        Saved {new Date(p.created_at).toLocaleString()}
                      </span>
                      {p.version > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRollback(p.version);
                          }}
                          className="mt-2 text-[10px] text-[#f17463] hover:text-[#f17463] font-bold flex items-center gap-1 w-max self-start bg-[rgba(241,116,99,0.08)] px-2 py-0.5 rounded border border-[rgba(241,116,99,0.3)]"
                        >
                          <RotateCcw className="h-3 w-3" /> Rollback to here
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Editor Right */}
          <div className="lg:col-span-2 dash-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white border-b border-neutral-900 pb-3 flex items-center gap-1.5">
              <FileCode className="h-4.5 w-4.5 text-[#f17463]" />
              {selectedPrompt ? `Edit Prompt Version v${selectedPrompt.version}` : "Draft New Prompt Template"}
            </h3>

            <form onSubmit={handleSavePrompt} className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--dash-muted2)] uppercase tracking-wider">Template Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code Review Persona, Marketing Explainer..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#c0c0c0] focus:border-[#f17463] outline-none"
                  disabled={saving}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--dash-muted2)] uppercase tracking-wider">System Prompt Instructions</label>
                <textarea
                  required
                  rows={8}
                  placeholder="You are an expert coder. Focus on rate limiting configurations..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#c0c0c0] focus:border-[#f17463] outline-none resize-none font-mono leading-relaxed select-text"
                  disabled={saving}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="self-end px-5 py-2.5 bg-[rgba(241,116,99,0.1)] hover:bg-[rgba(241,116,99,0.1)] disabled:bg-neutral-900 disabled:text-[var(--dash-muted)] rounded-xl text-xs font-bold text-white shadow-lg transition-all"
              >
                {saving ? "Saving new version..." : "Save New Version"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
