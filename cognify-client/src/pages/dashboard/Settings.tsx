import React, { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Key, 
  Database, 
  Shield, 
  CreditCard, 
  Plus, 
  Copy, 
  Check, 
  Trash2 
} from "lucide-react";

export const Settings = () => {
  const [apiKeyList, setApiKeyList] = useState([
    { id: "key-1", name: "PR Review Github Webhook", key: "cg_live_89f1a23b...77e1", created: "2 weeks ago" },
    { id: "key-2", name: "Marketing research API Hub", key: "cg_live_33a2d100...910b", created: "1 month ago" }
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: `cg_live_${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
      created: "Just now"
    };

    setApiKeyList((prev) => [...prev, newKey]);
    setNewKeyName("");
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeyList((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 select-none h-full max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none">
          Platform Configurations
        </h1>
        <p className="text-xs text-[var(--dash-muted)] mt-2">
          Configure active API credentials, usage limits, and enterprise-grade security keys.
        </p>
      </div>

      {/* Main Settings Sections */}
      <div className="flex flex-col gap-6">
        {/* 1. API Keys Settings */}
        <div className="dash-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white border-b border-neutral-900 pb-3 leading-none flex items-center gap-1.5">
            <Key className="h-4.5 w-4.5 text-[#f17463]" />
            API Key Registries
          </h3>
          <p className="text-xs text-[var(--dash-muted)] mt-1">Credentials used by workflow webhooks to execute backend pipeline queries.</p>

          {/* Key list */}
          <div className="flex flex-col gap-2.5 mt-4">
            {apiKeyList.map((keyItem) => (
              <div 
                key={keyItem.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-850 bg-neutral-900/10"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-none">{keyItem.name}</span>
                  <span className="text-[10px] text-[var(--dash-muted)] font-mono mt-2">{keyItem.key}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyKey(keyItem.key, keyItem.id)}
                    className="p-1.5 rounded-lg border border-neutral-850 hover:bg-neutral-900 text-[var(--dash-muted2)] hover:text-white transition-all text-xs flex items-center gap-1"
                  >
                    {copiedKeyId === keyItem.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteKey(keyItem.id)}
                    className="p-1.5 rounded-lg border border-neutral-850 hover:border-red-900/30 hover:bg-red-500/10 text-[var(--dash-muted)] hover:text-red-400 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New Key Form */}
          <form onSubmit={handleCreateKey} className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-900/60">
            <input
              type="text"
              placeholder="Key Description Name (e.g. CI/CD test key)..."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white placeholder-[#c0c0c0] focus:border-[#f17463] outline-none flex-1"
              required
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-[rgba(241,116,99,0.1)] hover:bg-[rgba(241,116,99,0.1)] text-white text-xs font-bold shadow-lg shadow-purple-650/20 transition-all shrink-0 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Generate Key
            </button>
          </form>
        </div>

        {/* 2. Security Config Card */}
        <div className="dash-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white border-b border-neutral-900 pb-3 leading-none flex items-center gap-1.5">
            <Shield className="h-4.5 w-4.5 text-[#f17463]" />
            Security & Shielding Configurations
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-xl border border-neutral-850 bg-neutral-900/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Require Two-Factor Auth</p>
                <p className="text-[10px] text-[var(--dash-muted)] mt-1">Enforce strict token authenticator checks.</p>
              </div>
              <button className="h-5 w-9 rounded-full bg-[rgba(241,116,99,0.1)] p-0.5 relative transition-all flex justify-end">
                <span className="h-4 w-4 rounded-full bg-[var(--dash-card-bg)] block"></span>
              </button>
            </div>
            <div className="p-4 rounded-xl border border-neutral-850 bg-neutral-900/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Log IP Addresses</p>
                <p className="text-[10px] text-[var(--dash-muted)] mt-1">Audit location details on client fetches.</p>
              </div>
              <button className="h-5 w-9 rounded-full bg-neutral-800 p-0.5 relative transition-all">
                <span className="h-4 w-4 rounded-full bg-[var(--dash-hover)]0 block"></span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Subscription Pricing Plan detail */}
        <div className="dash-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white border-b border-neutral-900 pb-3 leading-none flex items-center gap-1.5">
            <CreditCard className="h-4.5 w-4.5 text-[#f17463]" />
            Billing Plan: PRO Plan
          </h3>
          <p className="text-xs text-[var(--dash-muted)] mt-1">Pricing, invoices, and payment card details linked to Stripe portal.</p>
          
          <div className="flex items-center justify-between mt-4 p-4 rounded-xl border border-[rgba(241,116,99,0.3)] bg-[rgba(241,116,99,0.08)] text-xs font-semibold">
            <div className="flex flex-col">
              <span className="text-white text-sm">PRO Membership</span>
              <span className="text-[10px] text-[#f17463] mt-1">Cost: $79.00 / month (Renews Jun 20, 2026)</span>
            </div>
            <button 
              onClick={() => alert("Redirecting to Stripe Customer Portal...")}
              className="px-3.5 py-2 bg-neutral-900 border border-neutral-800 hover:border-[rgba(241,116,99,0.3)] rounded-xl hover:bg-neutral-950 text-neutral-300 font-bold transition-all text-xs"
            >
              Customer Billing Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
