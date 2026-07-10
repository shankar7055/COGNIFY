import React, { useState, useEffect } from "react";
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ShieldAlert, 
  Play, 
  CheckCircle, 
  XCircle,
  HelpCircle 
} from "lucide-react";
import { api } from "../../utils/api";

interface ApiKeyMetadata {
  id: string;
  name: string;
  created_at: string;
  last_used?: string | null;
}

export const APIKeys = () => {
  const [keys, setKeys] = useState<ApiKeyMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generating, setGenerating] = useState(false);

  // New generated key state
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Key testing states
  const [testKey, setTestKey] = useState("");
  const [testResult, setTestResult] = useState<{ status: "success" | "error", message: string } | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await api.get("/apikeys");
      setKeys(res.data || []);
    } catch (err) {
      console.error("Failed to load API keys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setGenerating(true);
      const res = await api.post("/apikeys/generate", { name: newKeyName });
      setGeneratedKey(res.data.api_key);
      setNewKeyName("");
      fetchKeys();
    } catch (err) {
      console.error("Failed to generate key:", err);
      alert("Failed to generate API Key.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyGeneratedKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTestKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testKey.trim()) return;

    try {
      setTestLoading(true);
      setTestResult(null);
      
      // Make call to /api/apikeys/test with header x-api-key
      const res = await api.get("/apikeys/test", {
        headers: {
          "x-api-key": testKey
        }
      });
      setTestResult({
        status: "success",
        message: res.data.message || "API key auth working successfully!"
      });
    } catch (err: any) {
      setTestResult({
        status: "error",
        message: err.response?.data?.message || "Invalid API key authorization check."
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleDeleteKeyLocal = async (id: string) => {
    try {
      await api.delete(`/apikeys/${id}`);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err: any) {
      console.error("Failed to revoke API key:", err);
      alert(err.response?.data?.message || "Failed to revoke API Key.");
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none h-full max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none flex items-center gap-2">
          <Key className="h-6 w-6 text-[#f17463]" />
          API Credentials
        </h1>
        <p className="text-xs text-[var(--dash-muted)] mt-2">
          Provision secure tokens for background workers, command line runners, and webhook integrations.
        </p>
      </div>

      {/* Generated Key Modal overlay */}
      {generatedKey && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-[rgba(241,116,99,0.3)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#f17463]" />
              API Key Generated Successfully
            </h3>
            <p className="text-xs text-[var(--dash-muted)] leading-relaxed mb-4">
              Please copy your API key and store it securely. For security reasons, <span className="text-[#f17463] font-bold">you will not be able to see this key again</span>.
            </p>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-900 border border-neutral-850 font-mono text-xs text-[#f17463] overflow-x-auto select-text">
              <span className="flex-1 truncate">{generatedKey}</span>
              <button
                onClick={handleCopyGeneratedKey}
                className="p-1 rounded bg-neutral-955 border border-neutral-800 text-[var(--dash-muted2)] hover:text-white shrink-0 hover:border-[rgba(241,116,99,0.3)]"
              >
                {copiedKey ? <Check className="h-4.5 w-4.5 text-emerald-450" /> : <Copy className="h-4.5 w-4.5" />}
              </button>
            </div>

            <button
              onClick={() => setGeneratedKey(null)}
              className="w-full py-2.5 rounded-xl bg-[rgba(241,116,99,0.1)] hover:bg-[rgba(241,116,99,0.1)] text-white text-xs font-bold shadow-lg mt-5 transition-all"
            >
              I have saved my API Key
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: List left, Create/Test right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Keys listing */}
        <div className="md:col-span-2 dash-card rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white border-b border-neutral-900 pb-3">
            Active Tokens Registry
          </h3>

          {loading ? (
            <div className="text-center py-8 text-[var(--dash-muted)] text-xs">Loading api keys...</div>
          ) : keys.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-neutral-850 rounded-xl text-neutral-550 text-xs font-semibold">
              No credentials found. Use the panel on the right to generate a new key.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {keys.map((k) => (
                <div 
                  key={k.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-850 bg-neutral-900/10"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white leading-none">{k.name}</span>
                    <span className="text-[9px] text-[var(--dash-muted)] mt-2">
                      Created {new Date(k.created_at).toLocaleDateString()} • Last used {k.last_used ? new Date(k.last_used).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteKeyLocal(k.id)}
                    className="p-2 rounded-lg border border-neutral-850 hover:border-red-900/30 hover:bg-red-500/10 text-[var(--dash-muted)] hover:text-red-400 transition-all shrink-0"
                    title="Revoke Key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel Right */}
        <div className="flex flex-col gap-6">
          {/* Create form */}
          <div className="dash-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white border-b border-neutral-900 pb-3 flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-[#f17463]" />
              Generate Token
            </h3>

            <form onSubmit={handleGenerateKey} className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--dash-muted2)] uppercase tracking-wider">Key Label Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CI Pipeline, Dev CLI"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-[#c0c0c0] focus:border-[#f17463] outline-none"
                  disabled={generating}
                />
              </div>

              <button
                type="submit"
                disabled={generating || !newKeyName.trim()}
                className="w-full py-2 bg-[rgba(241,116,99,0.1)] hover:bg-[rgba(241,116,99,0.1)] disabled:bg-neutral-900 disabled:text-[var(--dash-muted)] rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-purple-650/20"
              >
                {generating ? "Generating..." : "Generate Key"}
              </button>
            </form>
          </div>

          {/* Test form */}
          <div className="dash-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white border-b border-neutral-900 pb-3 flex items-center gap-1.5">
              <Play className="h-4.5 w-4.5 text-[#f17463]" />
              Test Key Authentication
            </h3>
            
            <form onSubmit={handleTestKey} className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--dash-muted2)] uppercase tracking-wider">Paste Token</label>
                <input
                  type="text"
                  required
                  placeholder="cg_live_..."
                  value={testKey}
                  onChange={(e) => setTestKey(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-[#c0c0c0] focus:border-[#f17463] outline-none font-mono"
                  disabled={testLoading}
                />
              </div>

              <button
                type="submit"
                disabled={testLoading || !testKey.trim()}
                className="w-full py-2 bg-neutral-900 border border-neutral-805 hover:border-[rgba(241,116,99,0.3)] text-neutral-350 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                {testLoading ? "Testing..." : "Test Key"}
              </button>
            </form>

            {testResult && (
              <div className={`mt-4 p-3 rounded-xl border flex items-start gap-2 text-[11px] font-semibold ${
                testResult.status === "success" 
                  ? "border-emerald-900/30 bg-emerald-500/10 text-emerald-450" 
                  : "border-red-900/30 bg-red-500/10 text-red-400"
              }`}>
                {testResult.status === "success" 
                  ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> 
                  : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
