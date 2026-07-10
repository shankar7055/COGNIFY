import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ArrowUpRight, 
  Zap, 
  ShieldCheck, 
  Loader2,
  Puzzle,
  Key,
  Settings as SettingsIcon
} from "lucide-react";
import { api } from "../../utils/api";
import { APIKeys } from "./APIKeys";
import { Integrations } from "./Integrations";
import { Settings } from "./Settings";

interface Subscription {
  id?: string;
  user_id?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  status: string;
  current_period_end?: string | null;
}

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

export const Billing = () => {
  const [activeTab, setActiveTab] = useState<"plans" | "integrations" | "apikeys" | "settings">("plans");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await api.get("/billing/subscription");
      setSubscription(res.data);
    } catch (err) {
      console.error("Failed to load subscription details:", err);
      // Fallback local subscription
      setSubscription({
        plan: "FREE",
        status: "ACTIVE"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (!subscription) return;

    const searchParams = new URLSearchParams(window.location.search);
    const planParam = searchParams.get("plan") as "PRO" | "ENTERPRISE" | null;

    if (planParam && ["PRO", "ENTERPRISE"].includes(planParam)) {
      if (subscription.plan !== planParam) {
        handleUpgrade(planParam);
        // Clear query parameters to avoid repeating on re-renders
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [subscription]);

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
        // Redirect browser to Stripe Checkout session
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Upgrade checkout creation failed:", err);
      alert("Failed to initialize billing checkout.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    try {
      setPortalLoading(true);
      const res = await api.post("/billing/portal");
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Stripe customer portal failed:", err);
      alert("Billing portal requires an active subscription history.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none h-full max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-[#f17463]" />
          Subscription Plans & Billing
        </h1>
        <p className="text-xs text-[var(--dash-muted)] mt-2">
          Configure subscription structures, download billing history sheets, and sync payment cards via Stripe.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-neutral-900 bg-neutral-950/20 px-2 overflow-x-auto shrink-0 scrollbar-none rounded-t-xl">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold transition-all ${
            activeTab === "plans"
              ? "border-[#f17463] text-[#f17463] bg-[rgba(241,116,99,0.08)]"
              : "border-transparent text-[var(--dash-muted2)] hover:text-neutral-200"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Subscription Plans
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold transition-all ${
            activeTab === "integrations"
              ? "border-[#f17463] text-[#f17463] bg-[rgba(241,116,99,0.08)]"
              : "border-transparent text-[var(--dash-muted2)] hover:text-neutral-200"
          }`}
        >
          <Puzzle className="h-4 w-4" />
          Integrations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("apikeys")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold transition-all ${
            activeTab === "apikeys"
              ? "border-[#f17463] text-[#f17463] bg-[rgba(241,116,99,0.08)]"
              : "border-transparent text-[var(--dash-muted2)] hover:text-neutral-200"
          }`}
        >
          <Key className="h-4 w-4" />
          API Keys
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold transition-all ${
            activeTab === "settings"
              ? "border-[#f17463] text-[#f17463] bg-[rgba(241,116,99,0.08)]"
              : "border-transparent text-[var(--dash-muted2)] hover:text-neutral-200"
          }`}
        >
          <SettingsIcon className="h-4 w-4" />
          Security Settings
        </button>
      </div>

      {activeTab === "plans" ? (
        loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#f17463]" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Active plan summary */}
            <div className="dash-card rounded-2xl p-5 border border-[rgba(241,116,99,0.3)] bg-[rgba(241,116,99,0.08)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-[rgba(241,116,99,0.08)] border border-[#f17463] flex items-center justify-center text-[#f17463] shrink-0 mt-0.5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[var(--dash-muted2)] uppercase tracking-widest font-bold">Active Membership Plan</span>
                  <span className="text-lg font-black text-white mt-1">
                    {subscription?.plan || "FREE"} Plan
                  </span>
                  <p className="text-xs text-neutral-555 mt-1 leading-normal">
                    Status: <span className="font-bold text-emerald-450 uppercase">{subscription?.status || "ACTIVE"}</span>
                    {subscription?.current_period_end && (
                      ` • Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                    )}
                  </p>
                </div>
              </div>

              {subscription?.plan !== "FREE" && (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="px-4 py-2 border border-neutral-800 bg-neutral-900 hover:bg-neutral-950 text-neutral-350 hover:text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  {portalLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                  Customer Portal
                </button>
              )}
            </div>

            {/* Pricing tiers matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {/* Free */}
              <div className="dash-card rounded-2xl p-5 border border-neutral-850 flex flex-col justify-between h-[360px]">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] text-[var(--dash-muted)] font-bold uppercase tracking-wider">Developer Tier</span>
                    <h4 className="text-xl font-bold text-white mt-1">Core Plan</h4>
                    <p className="text-2xl font-black text-white mt-2">$0 <span className="text-xs text-[var(--dash-muted)] font-semibold">/ month</span></p>
                  </div>
                  <ul className="flex flex-col gap-2 text-xs text-[var(--dash-muted2)] font-semibold">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f17463] shrink-0" /> 1 Active Workspace</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f17463] shrink-0" /> 3 AI Agents Online</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f17463] shrink-0" /> 500 API requests / mo</li>
                  </ul>
                </div>
                <button 
                  disabled 
                  className="w-full py-2.5 bg-neutral-900 border border-neutral-850 text-[var(--dash-muted)] rounded-xl text-xs font-bold cursor-not-allowed transition-all"
                >
                  Current Tier
                </button>
              </div>

              {/* PRO */}
              <div className="dash-card rounded-2xl p-5 border border-[rgba(241,116,99,0.3)] bg-[rgba(241,116,99,0.08)] flex flex-col justify-between h-[360px] relative overflow-hidden">
                <div className="absolute top-3.5 right-3.5 bg-[rgba(241,116,99,0.1)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Popular
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] text-[#f17463] font-bold uppercase tracking-wider">Startup Studio</span>
                    <h4 className="text-xl font-bold text-white mt-1">PRO Plan</h4>
                    <p className="text-2xl font-black text-white mt-2">$79 <span className="text-xs text-[var(--dash-muted)] font-semibold">/ month</span></p>
                  </div>
                  <ul className="flex flex-col gap-2 text-xs text-neutral-355 font-semibold">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f17463] shrink-0" /> Unlimited Workspaces</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f17463] shrink-0" /> Unlimited AI Agents</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f17463] shrink-0" /> 100,000 API requests / mo</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f17463] shrink-0" /> Slack & Notion Sync</li>
                  </ul>
                </div>
                <button 
                  onClick={() => handleUpgrade("PRO")}
                  disabled={checkoutLoading !== null || subscription?.plan === "PRO"}
                  className="w-full py-2.5 bg-[rgba(241,116,99,0.1)] hover:bg-[rgba(241,116,99,0.1)] disabled:bg-neutral-900 disabled:text-neutral-550 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5"
                >
                  {checkoutLoading === "PRO" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {subscription?.plan === "PRO" ? "Current Tier" : "Upgrade to Pro"}
                </button>
              </div>

              {/* Enterprise */}
              <div className="dash-card rounded-2xl p-5 border border-neutral-850 flex flex-col justify-between h-[360px]">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] text-[var(--dash-muted)] font-bold uppercase tracking-wider">Clustering Labs</span>
                    <h4 className="text-xl font-bold text-white mt-1">Enterprise</h4>
                    <p className="text-2xl font-black text-white mt-2">$299 <span className="text-xs text-[var(--dash-muted)] font-semibold">/ month</span></p>
                  </div>
                  <ul className="flex flex-col gap-2 text-xs text-[var(--dash-muted2)] font-semibold">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f17463] shrink-0" /> Dedicated API Key routing</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f17463] shrink-0" /> Isolated Vector db memory</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f17463] shrink-0" /> Dedicated support SLA</li>
                  </ul>
                </div>
                <button 
                  onClick={() => handleUpgrade("ENTERPRISE")}
                  disabled={checkoutLoading !== null || subscription?.plan === "ENTERPRISE"}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-950 border border-neutral-800 disabled:bg-neutral-900 disabled:text-[var(--dash-muted)] disabled:cursor-not-allowed hover:border-[rgba(241,116,99,0.3)] text-neutral-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  {checkoutLoading === "ENTERPRISE" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[#f17463]" />}
                  {subscription?.plan === "ENTERPRISE" ? "Current Tier" : "Select Enterprise"}
                </button>
              </div>
            </div>
          </div>
        )
      ) : activeTab === "integrations" ? (
        <Integrations />
      ) : activeTab === "apikeys" ? (
        <APIKeys />
      ) : (
        <Settings />
      )}
    </div>
  );
};
