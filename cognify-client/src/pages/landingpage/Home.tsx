import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import {
  ArrowRight,
  Calendar,
  Check,
  Command,
  GitBranch,
  Layers,
  LineChart,
  MessageSquare,
  Network,
  Play,
  Search,
  Shield,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";



export default function Home() {
  return (
    <ReactLenis root>
      <div className="min-h-screen bg-background text-foreground antialiased">
        <Nav />
        <Hero />
        <LogoStrip />
        <ProblemSection />
        <FeatureMultiAgent />
        <FeatureMemory />
        <FeatureMonitoring />
        <HowItWorks />
        <WorkspacePreview />
        <TrustMetrics />
        <FeatureGrid />
        <BuiltForProduction />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </ReactLenis>
  );
}

/* ----------------------------- NAV ----------------------------- */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight">Cognify</span>
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {["Platform", "Solutions", "Developers", "Customers", "Pricing"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {l}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/chat"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
          >
            Start Building
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function LogoMark() {
  return (
    <div className="relative grid size-6 place-items-center rounded-md bg-foreground text-background">
      <Sparkles className="size-3.5" />
    </div>
  );
}

/* ----------------------------- HERO ----------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-noise mix-blend-overlay z-0 opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-vignette z-0" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60 z-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[700px] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px] z-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-24 lg:pt-32">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/70 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
              </span>
              v2.0 — Multi-Agent Runtime is now generally available
            </div>
            <h1 className="mt-6 text-balance text-6xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Build, deploy and operate <span className="text-brand">AI agents</span>
              <br />
              <span className="text-muted-foreground">at scale.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Building production AI shouldn’t require stitching together orchestration, memory, queues, retries, and observability.
              <br /><br />
              Cognify brings everything together into one visual runtime—so teams can build, deploy and operate autonomous AI systems with confidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard/chat"
                className="group inline-flex h-12 items-center gap-2 rounded-md bg-foreground px-6 text-[14px] font-medium text-background transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Start Building
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface-1 px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-2"
              >
                <Calendar className="size-3.5" />
                Talk to Engineering
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-[12px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="size-3.5" /> Multi-Agent Runtime
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-3.5" /> Built-in Memory
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-3.5" /> Visual Workflows
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <Check className="size-3.5" /> Production Observability
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <WorkflowVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- WORKFLOW VISUAL ----------------------------- */
function WorkflowVisual() {
  const logs = [
    { t: "14:20:01", k: "EXEC", v: "> classifier.agent invoked" },
    { t: "14:20:02", k: "INFO", v: "> memory retrieved (4 documents)" },
    { t: "14:20:03", k: "VALID", v: "> refund policy validated" },
    { t: "14:20:04", k: "DONE", v: "> workflow completed in 2.18s" },
  ];
  const [tick, setTick] = useState(0);
  const [throughput, setThroughput] = useState(2481);
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setThroughput((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 1800);
    return () => clearInterval(id);
  }, []);
  const visible = logs.slice(0, (tick % logs.length) + 1);

  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-brand/10 via-transparent to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-1/60 shadow-2xl shadow-black/40 backdrop-blur">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-border/70 bg-surface-2/50 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-surface-3" />
            <span className="size-2.5 rounded-full bg-surface-3" />
            <span className="size-2.5 rounded-full bg-surface-3" />
          </div>
          <div className="font-mono text-[10px] tracking-wide text-muted-foreground">
            workspace/support-router.production
          </div>
          <div className="inline-flex items-center gap-1 rounded border border-success/20 bg-success/10 px-1.5 py-0.5 font-mono text-[10px] text-success shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="size-1 rounded-full bg-success animate-pulse" />
            LIVE
          </div>
        </div>

        {/* Canvas */}
        <div className="relative h-[380px] grid-bg">
          {/* SVG edges */}
          <svg
            viewBox="0 0 600 380"
            className="absolute inset-0 size-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="edge" x1="0" x2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.13 195)" stopOpacity="0.1" />
                <stop offset="50%" stopColor="oklch(0.78 0.13 195)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="oklch(0.78 0.13 195)" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              id="path1"
              d="M 130 90 C 200 90, 220 180, 300 180"
              stroke="url(#edge)"
              strokeWidth="1.4"
              fill="none"
              className="dash-flow"
            />
            <circle r="3" fill="oklch(0.78 0.13 195)">
              <animateMotion dur="3s" repeatCount="indefinite" path="M 130 90 C 200 90, 220 180, 300 180" />
            </circle>
            <path
              id="path2"
              d="M 300 180 C 380 180, 400 100, 470 100"
              stroke="url(#edge)"
              strokeWidth="1.4"
              fill="none"
              className="dash-flow"
            />
            <circle r="3" fill="oklch(0.78 0.13 195)">
              <animateMotion dur="3.5s" repeatCount="indefinite" path="M 300 180 C 380 180, 400 100, 470 100" />
            </circle>
            <path
              id="path3"
              d="M 300 180 C 380 180, 400 280, 470 280"
              stroke="url(#edge)"
              strokeWidth="1.4"
              fill="none"
              className="dash-flow"
            />
            <circle r="3" fill="oklch(0.78 0.13 195)">
              <animateMotion dur="4s" repeatCount="indefinite" path="M 300 180 C 380 180, 400 280, 470 280" />
            </circle>
          </svg>

          <Node x="20px" y="56px" tone="brand" kind="Trigger" name="Incoming Support Ticket" />
          <Node x="200px" y="96px" tone="amber" kind="Agent" name="Classifier Agent" busy />
          <Node x="380px" y="36px" tone="muted" kind="Memory" name="Knowledge Retrieval" />
          <Node x="200px" y="196px" tone="brand" kind="Action" name="Policy Validator" />
          <Node x="380px" y="146px" tone="amber" kind="Agent" name="Refund Decision" />
          <Node x="380px" y="236px" tone="success" kind="Action" name="Slack Notification" />
          <Node x="380px" y="306px" tone="success" kind="Action" name="Customer Response" />

          {/* Live log overlay */}
          <div className="absolute inset-x-3 bottom-3 rounded-lg border border-border/70 bg-background/80 p-2 backdrop-blur">
            <div className="mb-1 flex items-center gap-2 px-1">
              <Terminal className="size-3 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground">
                execution.log
              </span>
            </div>
            <div className="max-h-[88px] space-y-0.5 overflow-hidden font-mono text-[10.5px]">
              {visible.map((l) => (
                <div
                  key={l.t}
                  className="flex gap-2"
                  style={{ animation: "log-in 240ms ease-out both" }}
                >
                  <span className="text-muted-foreground/70">[{l.t}]</span>
                  <span className="text-brand">{l.k}</span>
                  <span className="truncate text-muted-foreground">{l.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating stats card */}
      <div className="absolute -bottom-6 -left-6 hidden w-56 rounded-xl border border-border bg-surface-1/90 p-3 shadow-xl backdrop-blur sm:block float-y">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Throughput
          </div>
          <LineChart className="size-3 text-muted-foreground" />
        </div>
        <div className="mt-1 text-xl font-semibold tracking-tight">{throughput.toLocaleString()} executions/min</div>
        <div className="mt-3 flex gap-3 text-[11px] text-muted-foreground">
          <div>Avg latency: <span className="font-medium text-foreground">184 ms</span></div>
          <div>Success: <span className="font-medium text-foreground">99.97%</span></div>
        </div>
        <Sparkline />
      </div>
    </div>
  );
}

function Node({
  x,
  y,
  tone,
  kind,
  name,
  busy,
}: {
  x: string;
  y: string;
  tone: "brand" | "amber" | "muted" | "success";
  kind: string;
  name: string;
  busy?: boolean;
}) {
  const dot =
    tone === "brand"
      ? "bg-brand"
      : tone === "amber"
        ? "bg-warning"
        : tone === "success"
          ? "bg-success"
          : "bg-muted-foreground";
  return (
    <div
      className="absolute w-44 rounded-lg border border-border bg-surface-2/90 p-2.5 shadow-lg backdrop-blur transition-all hover:-translate-y-0.5"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${dot} ${busy ? "pulse-soft" : ""}`} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {kind}
          </span>
        </div>
        {busy && (
          <span className="rounded bg-warning/10 px-1 font-mono text-[9px] text-warning">
            running
          </span>
        )}
      </div>
      <div className="mt-1.5 text-[12.5px] font-medium">{name}</div>
    </div>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 200 36" className="mt-2 h-8 w-full">
      <polyline
        points="0,28 20,22 40,24 60,16 80,18 100,10 120,14 140,6 160,12 180,4 200,8"
        fill="none"
        stroke="oklch(0.78 0.13 195)"
        strokeWidth="1.5"
      />
      <polyline
        points="0,28 20,22 40,24 60,16 80,18 100,10 120,14 140,6 160,12 180,4 200,8 200,36 0,36"
        fill="oklch(0.78 0.13 195 / 12%)"
        stroke="none"
      />
    </svg>
  );
}

/* ----------------------------- LOGOS ----------------------------- */
function LogoStrip() {
  const logos = [
    "OpenAI",
    "Anthropic",
    "Gemini",
    "Slack",
    "Notion",
    "GitHub",
    "Stripe",
    "Postgres",
    "Redis",
    "Kubernetes",
  ];
  return (
    <section className="border-b border-border/60 bg-surface-1/30">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Works with the tools your team already uses.
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-5 lg:grid-cols-10">
          {logos.map((l) => (
            <div
              key={l}
              className="grid h-10 place-items-center text-[12px] font-semibold tracking-wide text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- PROBLEM SECTION ----------------------------- */
function ProblemSection() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="max-w-xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
              WHY COGNIFY
            </div>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Most AI projects stop at the demo.
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Shipping production AI means managing orchestration, retries, memory, context windows, tool permissions, monitoring, and failures across dozens of moving parts.
              <br /><br />
              Most teams assemble this infrastructure themselves.
              <br /><br />
              Cognify gives you a single runtime built for autonomous systems from day one.
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-surface-1/40 p-1">
             <div className="absolute inset-0 grid-bg opacity-30" />
             <div className="relative flex h-full w-full flex-col items-center justify-center rounded-xl bg-surface-1/80 border border-border/50 backdrop-blur">
               
               <div className="absolute top-6 flex flex-wrap justify-center gap-2 max-w-[300px]">
                  {["LLM", "Queues", "Workers", "Redis", "Vector DB", "Memory", "Retries", "Webhooks", "Monitoring"].map((item, i) => (
                    <div key={item} className="px-2 py-1 rounded bg-surface-2 border border-border/50 font-mono text-[10px] text-muted-foreground/80 opacity-0" style={{ animation: `log-in 0.8s ${i * 0.1}s forwards` }}>
                      {item}
                    </div>
                  ))}
               </div>

               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] flex flex-col items-center gap-2 opacity-0" style={{ animation: 'log-in 1s 1.2s forwards' }}>
                 <div className="my-1 flex flex-col items-center gap-1">
                   <div className="size-1 rounded-full bg-brand/30" />
                   <div className="size-1 rounded-full bg-brand/50" />
                   <div className="size-1 rounded-full bg-brand" />
                 </div>
                 <div className="px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/30 font-mono text-[12px] font-semibold text-brand glow-brand">
                   Cognify Runtime
                 </div>
                 <ArrowRight className="size-4 rotate-90 text-brand/60 mt-1" />
                 <div className="font-mono text-[13px] font-bold text-foreground mt-1 tracking-wide">
                   Production AI System
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FEATURES ----------------------------- */
function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

function FeatureMultiAgent() {
  const [agents, setAgents] = useState([
    { name: "Router", model: "gpt-4o", state: "idle", load: 24, tone: "muted", latency: "12ms", task: "Waiting", mem: "12MB", q: 0, tok: 0 },
    { name: "Researcher", model: "claude-3.5-sonnet", state: "working", load: 82, tone: "brand", latency: "1.2s", task: "Web Search", mem: "142MB", q: 2, tok: 1450 },
    { name: "Planner", model: "o4-mini", state: "working", load: 45, tone: "brand", latency: "800ms", task: "Step Gen", mem: "48MB", q: 1, tok: 340 },
    { name: "Reviewer", model: "gpt-4o", state: "queued", load: 12, tone: "muted", latency: "-", task: "Pending", mem: "0MB", q: 4, tok: 0 },
    { name: "Coder", model: "claude-3.5-sonnet", state: "working", load: 64, tone: "brand", latency: "2.1s", task: "Diff Gen", mem: "284MB", q: 0, tok: 4120 },
    { name: "Memory", model: "vector-db", state: "idle", load: 8, tone: "muted", latency: "4ms", task: "Indexed", mem: "840MB", q: 0, tok: 0 },
  ]);

  useEffect(() => {
    const id = setInterval(() => {
      setAgents(prev => prev.map(a => {
        if (a.state === "working") {
          const latVal = parseFloat(a.latency) || 1.0;
          return {
            ...a,
            load: Math.min(100, Math.max(0, a.load + (Math.random() * 10 - 5))),
            latency: `${(latVal + (Math.random() * 0.2 - 0.1)).toFixed(1)}s`,
            tok: a.tok + Math.floor(Math.random() * 50)
          };
        }
        return a;
      }));
    }, 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="01 — MULTI-AGENT RUNTIME"
            title="Coordinate specialized agents without managing the complexity."
            desc="Every workflow is composed of focused agents. Cognify manages execution, retries, context sharing, scheduling and concurrency automatically so your team can focus on business logic instead of infrastructure."
          />
          <ul className="mt-8 space-y-3 text-[14px]">
            {[
              "Independent memory scopes",
              "Tool permissions per agent",
              "Automatic retries",
              "Streaming execution",
              "Parallel agent execution",
              "Cost and latency tracking"
            ].map((i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 size-4 text-brand" />
                <span className="text-foreground/90">{i}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-border bg-surface-1/50 p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <Layers className="size-3.5" /> agents.registry
              </div>
              <div className="text-[11px] text-muted-foreground">12 active</div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {agents.map((a) => (
                <div
                  key={a.name}
                  className="group rounded-xl border border-border bg-surface-2/70 p-4 transition-all hover:-translate-y-1 hover:bg-surface-2 hover:border-brand/30 hover:shadow-[0_0_15px_rgba(241,116,99,0.05)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-lg bg-surface-3 font-mono text-[11px] font-semibold text-muted-foreground group-hover:text-brand transition-colors">
                        {a.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13.5px] font-medium">{a.name}</div>
                        <div className="font-mono text-[10.5px] text-muted-foreground">
                          {a.model}
                        </div>
                      </div>
                    </div>
                    <StatusPill state={a.state} />
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-y-2 text-[10.5px] font-mono text-muted-foreground">
                    <div className="flex justify-between pr-2"><span>Task</span><span className="text-foreground">{a.task}</span></div>
                    <div className="flex justify-between pl-2 border-l border-border/50"><span>Runtime</span><span className="text-foreground">{a.latency}</span></div>
                    <div className="flex justify-between pr-2"><span>Mem</span><span className="text-foreground">{a.mem}</span></div>
                    <div className="flex justify-between pl-2 border-l border-border/50"><span>Queue</span><span className="text-foreground">{a.q}</span></div>
                  </div>

                  <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>tokens: {a.tok.toLocaleString()}</span>
                    <span>{Math.round(a.load)}%</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className={`h-full transition-all duration-1000 ease-out ${a.tone === "brand" ? "bg-brand" : "bg-muted-foreground/60"}`}
                      style={{ width: `${a.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusPill({ state }: { state: string }) {
  const map: Record<string, string> = {
    idle: "border-border bg-surface-3 text-muted-foreground",
    working: "border-brand/30 bg-brand/10 text-brand",
    queued: "border-warning/30 bg-warning/10 text-warning",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${map[state]}`}
    >
      <span className="size-1 rounded-full bg-current pulse-soft" />
      {state}
    </span>
  );
}

function FeatureMemory() {
  const results = [
    { doc: "Architecture Docs", score: 0.94 },
    { doc: "Refund Policy", score: 0.89 },
    { doc: "Meeting Notes", score: 0.84 },
    { doc: "Knowledge Base", score: 0.82 },
  ];

  const fullText = '"refund automation architecture"';
  const [typed, setTyped] = useState('');
  
  useEffect(() => {
    let i = 0;
    setTyped("");
    const id = setInterval(() => {
      setTyped(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, []);

  const searchDone = typed === fullText;
  return (
    <section className="border-b border-border/60 bg-surface-1/30">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-12">
        <div className="lg:order-2 lg:col-span-5">
          <SectionHeader
            eyebrow="02 — MEMORY"
            title="Context that doesn’t disappear."
            desc="Store documents, conversations, structured data and previous executions in one retrieval layer. Every agent receives the right context automatically without exceeding model context windows."
          />
        </div>
        <div className="lg:order-1 lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-1/60 shadow-xl">
            <div className="flex items-center gap-2 border-b border-border/70 bg-surface-2/60 px-3 py-3">
              <Search className="size-4 text-muted-foreground" />
              <div className="flex-1 font-mono text-[13px] text-foreground">
                <span className="text-brand">memory.search</span>({typed})
                {!searchDone && <span className="animate-pulse">_</span>}
              </div>
            </div>
            <div className="divide-y divide-border/60 min-h-[220px]">
              {searchDone && results.map((r, idx) => (
                <div key={r.doc} className="p-4 transition-colors hover:bg-surface-2/40 flex justify-between items-center opacity-0" style={{ animation: `log-in 0.5s ${idx * 0.15}s forwards` }}>
                  <div className="text-[13.5px] leading-relaxed text-foreground/90 font-medium">
                    {r.doc.split(' ').map((w, i) => (
                      <span key={i}>
                        {['Refund', 'Architecture'].includes(w) ? (
                          <span className="text-brand font-semibold glow-brand px-1 py-0.5 rounded bg-brand/10">{w}</span>
                        ) : w}
                        {' '}
                      </span>
                    ))}
                  </div>
                  <span className="text-brand font-mono text-[11px]">{Math.round(r.score * 100)}%</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-border/70 bg-surface-2/30 px-4 py-3 text-[11px] font-mono text-muted-foreground">
              {searchDone ? (
                <>
                  <span className="opacity-0" style={{ animation: 'log-in 0.5s 0.6s forwards' }}>42ms</span>
                  <span className="opacity-0" style={{ animation: 'log-in 0.5s 0.7s forwards' }}>1.8M indexed chunks</span>
                  <span className="opacity-0" style={{ animation: 'log-in 0.5s 0.8s forwards' }}>98.7% retrieval accuracy</span>
                </>
              ) : (
                <span className="opacity-0">.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureMonitoring() {
  const traces = [
    { op: "trigger.webhook", duration: "12ms", tok: "-", retries: 0, status: "success" },
    { op: "llm.classifier", duration: "840ms", tok: "342", retries: 0, status: "success" },
    { op: "memory.retrieve", duration: "42ms", tok: "-", retries: 1, status: "warning" },
    { op: "tool.stripe_refund", duration: "1.2s", tok: "-", retries: 0, status: "success" },
    { op: "llm.validation", duration: "520ms", tok: "128", retries: 0, status: "success" },
    { op: "workflow.complete", duration: "2.6s", tok: "-", retries: 0, status: "success" },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="03 — OBSERVABILITY"
            title="Debug AI systems like software."
            desc="Replay every execution, inspect every decision, understand every tool call and trace every token. Know exactly why an agent behaved the way it did."
          />
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { k: "Average Latency", v: "184 ms" },
              { k: "Executions", v: "1.2M/day" },
              { k: "Success Rate", v: "99.97%" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-lg border border-border bg-surface-1/60 p-3"
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.k}
                </div>
                <div className="mt-1 text-lg font-semibold">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-border bg-[oklch(0.13_0.004_260)] shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border/70 bg-surface-2/40 px-4 py-3 font-mono text-[10.5px] text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground/80">
                <LineChart className="size-3.5 text-brand" /> trace · run_8a2f1c
              </div>
              <div className="flex gap-4">
                <span>Total Duration: 2.6s</span>
                <span>Total Tokens: 470</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-4 py-4 border-b border-border/70 bg-surface-1/40 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max">
                {["Trigger", "LLM", "Memory", "Tool", "Validation", "Success"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`px-2.5 py-1 rounded-md text-[10.5px] font-mono border ${i === 5 ? 'border-success/30 bg-success/10 text-success' : 'border-border bg-surface-2 text-foreground'}`}>
                      {step}
                    </div>
                    {i < 5 && <ArrowRight className="size-3 text-muted-foreground/60" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Trace Table */}
            <div className="w-full font-mono text-[11px] leading-relaxed">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-border/70 text-muted-foreground bg-surface-2/20 uppercase tracking-wider text-[9.5px]">
                <div className="col-span-5">Operation</div>
                <div className="col-span-2 text-right">Duration</div>
                <div className="col-span-2 text-right">Tokens</div>
                <div className="col-span-2 text-right">Retries</div>
                <div className="col-span-1 text-center">Status</div>
              </div>
              <div className="divide-y divide-border/40 pb-2">
                {traces.map((t, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-2 hover:bg-surface-2/30 transition-colors items-center opacity-0" style={{ animation: `log-in 0.3s ${idx * 0.1}s forwards` }}>
                    <div className="col-span-5 flex items-center gap-2 text-foreground/90">
                      <div className={`size-1.5 rounded-full ${t.status === 'success' ? 'bg-success/80' : 'bg-warning/80'}`} />
                      {t.op}
                    </div>
                    <div className="col-span-2 text-right text-muted-foreground">{t.duration}</div>
                    <div className="col-span-2 text-right text-muted-foreground">{t.tok}</div>
                    <div className="col-span-2 text-right text-muted-foreground">{t.retries > 0 ? <span className="text-warning">{t.retries}</span> : '-'}</div>
                    <div className="col-span-1 flex justify-center">
                      <div className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border ${t.status === 'success' ? 'border-success/20 text-success bg-success/10' : 'border-warning/20 text-warning bg-warning/10'}`}>
                        {t.status === 'success' ? '200' : 'WARN'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- HOW IT WORKS ----------------------------- */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: Layers,
      title: "Connect your data",
      desc: "Connect APIs, databases, files and knowledge.",
    },
    {
      n: "02",
      icon: Workflow,
      title: "Design workflows visually",
      desc: "Build complex agent systems using an interactive canvas.",
    },
    {
      n: "03",
      icon: GitBranch,
      title: "Deploy anywhere",
      desc: "Cloud, self-hosted or your own infrastructure.",
    },
    {
      n: "04",
      icon: LineChart,
      title: "Observe every execution",
      desc: "Replay workflows, inspect traces and continuously improve.",
    },
  ];
  return (
    <section className="border-b border-border/60 bg-surface-1/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
            HOW IT WORKS
          </div>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            From idea to production.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="group bg-background p-6">
              <div className="flex items-center justify-between">
                <s.icon className="size-4 text-brand" />
                <span className="font-mono text-[10.5px] text-muted-foreground">
                  STEP {s.n}
                </span>
              </div>
              <div className="mt-8 text-[15px] font-medium">{s.title}</div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- WORKSPACE PREVIEW ----------------------------- */
function WorkspacePreview() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
            THE WORKSPACE
          </div>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Everything your AI system needs.
            <br />
            <span className="text-muted-foreground">One workspace.</span>
          </h2>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-border bg-surface-1/60 shadow-2xl shadow-black/40">
          {/* App chrome */}
          <div className="flex items-center justify-between border-b border-border/70 bg-surface-2/50 px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-surface-3" />
                <span className="size-2.5 rounded-full bg-surface-3" />
                <span className="size-2.5 rounded-full bg-surface-3" />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded border border-border bg-surface-3 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                <Command className="size-3" /> acme-ai / production
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded border border-border bg-surface-3 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground">
                Publish
              </button>
              <button className="inline-flex items-center gap-1 rounded bg-brand px-2 py-0.5 font-mono text-[10px] font-semibold text-brand-foreground transition-transform hover:scale-105 animate-pulse hover:animate-none shadow-[0_0_10px_rgba(241,116,99,0.3)]">
                <Play className="size-3 fill-current" /> Run
              </button>
            </div>
          </div>

          <div className="grid h-[560px] grid-cols-12">
            {/* Sidebar */}
            <aside className="col-span-2 border-r border-border/60 bg-surface-1/50 p-2">
              <div className="px-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Workspace
              </div>
              {[
                ["Workflows", true],
                ["Agents", false],
                ["Memory", false],
                ["Integrations", false],
                ["Runs", false],
                ["Billing", false],
              ].map(([l, active]) => (
                <div
                  key={l as string}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] ${
                    active
                      ? "bg-surface-3 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-current opacity-60" />
                  {l as string}
                </div>
              ))}
              <div className="mt-4 px-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Pinned flows
              </div>
              {["support-router", "lead-enricher", "doc-indexer"].map((f) => (
                <div
                  key={f}
                  className="truncate px-2 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
                >
                  · {f}
                </div>
              ))}
            </aside>

            {/* Canvas */}
            <div className="relative col-span-7 grid-bg overflow-hidden">
              <svg viewBox="0 0 700 560" className="absolute inset-0 size-full">
                <path
                  id="wpath1"
                  d="M 90 110 C 200 110, 220 230, 340 230"
                  stroke="oklch(0.78 0.13 195 / 0.7)"
                  strokeWidth="1.4"
                  fill="none"
                  className="dash-flow"
                />
                <circle r="3" fill="oklch(0.78 0.13 195)">
                  <animateMotion dur="2.5s" repeatCount="indefinite" path="M 90 110 C 200 110, 220 230, 340 230" />
                </circle>
                <path
                  id="wpath2"
                  d="M 340 230 C 460 230, 480 130, 580 130"
                  stroke="oklch(0.78 0.13 195 / 0.7)"
                  strokeWidth="1.4"
                  fill="none"
                  className="dash-flow"
                />
                <circle r="3" fill="oklch(0.78 0.13 195)">
                  <animateMotion dur="3s" repeatCount="indefinite" path="M 340 230 C 460 230, 480 130, 580 130" />
                </circle>
                <path
                  id="wpath3"
                  d="M 340 230 C 460 230, 480 360, 580 360"
                  stroke="oklch(0.78 0.13 195 / 0.7)"
                  strokeWidth="1.4"
                  fill="none"
                  className="dash-flow"
                />
                <circle r="3" fill="oklch(0.78 0.13 195)">
                  <animateMotion dur="3.2s" repeatCount="indefinite" path="M 340 230 C 460 230, 480 360, 580 360" />
                </circle>
              </svg>

              {/* Floating Indicators */}
              <div className="absolute top-4 left-4 bg-surface-2/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-muted-foreground border border-border float-y shadow-md">3 Agents Active</div>
              <div className="absolute bottom-16 left-6 bg-surface-2/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-muted-foreground border border-border float-y shadow-md" style={{animationDelay: '1s'}}>Execution Queue: 4</div>
              <div className="absolute top-8 right-6 bg-surface-2/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-muted-foreground border border-border float-y shadow-md" style={{animationDelay: '0.5s'}}>Cost Today: $12.40</div>
              <div className="absolute bottom-8 right-8 bg-brand/10 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-brand border border-brand/30 float-y shadow-md glow-brand" style={{animationDelay: '1.5s'}}>Memory Syncing...</div>
              <Node x="20px" y="80px" tone="brand" kind="Trigger" name="HTTP Trigger" />
              <Node x="200px" y="196px" tone="amber" kind="Agent" name="Classifier" busy />
              <Node x="380px" y="96px" tone="muted" kind="Memory" name="Retriever" />
              <Node x="380px" y="296px" tone="brand" kind="Action" name="Decision" />
              <Node x="560px" y="196px" tone="success" kind="Action" name="Slack" />
              <Node x="560px" y="296px" tone="success" kind="Action" name="Email" />

              {/* Floating toolbar */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-border bg-surface-2/90 p-1 shadow-lg backdrop-blur">
                {[Workflow, Layers, MessageSquare, GitBranch, Network].map((Ic, i) => (
                  <button
                    key={i}
                    className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                  >
                    <Ic className="size-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right inspector */}
            <aside className="col-span-3 border-l border-border/60 bg-surface-1/50">
              <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
                <div className="text-[12px] font-medium">Classifier</div>
                <div className="font-mono text-[10px] text-muted-foreground">agent</div>
              </div>
              <div className="space-y-4 p-3">
                <Field label="Model" value="GPT-4o" />
                <Field label="Temperature" value="0.2" />
                <Field label="Memory" value="support-kb · 142k chunks" />
                <Field label="Tools" value="Slack, Stripe, Notion, GitHub" />
                <div className="rounded-md border border-border bg-surface-2/70 p-2">
                  <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>Status</span>
                    <span className="text-success">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground mt-2">
                    <span>Last Deployment</span>
                    <span className="text-muted-foreground">2 minutes ago</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="rounded-md border border-border bg-surface-2/70 px-2 py-1.5 font-mono text-[11.5px]">
        {value}
      </div>
    </div>
  );
}

/* ----------------------------- TRUST METRICS ----------------------------- */
function TrustMetrics() {
  const metrics = [
    { label: "Workflow Executions", value: "48M+" },
    { label: "Average Runtime", value: "182ms" },
    { label: "Success Rate", value: "99.97%" },
    { label: "Tokens Processed", value: "3.1B" },
    { label: "Average Cost Reduction", value: "41%" },
    { label: "Developers Building", value: "500+" },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-32 text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl text-balance">
          Trusted for production AI systems
        </h2>
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-y-16 gap-x-8">
          {metrics.map((m, i) => (
            <div key={i} className="flex flex-col items-center opacity-0" style={{ animation: `log-in 0.8s ${i * 0.15}s forwards` }}>
              <div className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">{m.value}</div>
              <div className="mt-4 text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FEATURE GRID ----------------------------- */
function FeatureGrid() {
  const features = [
    {
      title: "Visual Workflow Builder",
      desc: "Build complex AI systems without writing orchestration code.",
      icon: Workflow,
    },
    {
      title: "Durable Memory",
      desc: "Persistent retrieval across every execution.",
      icon: Layers,
    },
    {
      title: "Agent Registry",
      desc: "Manage specialized agents from one place.",
      icon: Command,
    },
    {
      title: "Observability",
      desc: "Replay every run with full execution traces.",
      icon: LineChart,
    },
    {
      title: "Deployment",
      desc: "Cloud, Self-hosted and Kubernetes.",
      icon: Network,
    },
    {
      title: "Developer SDK",
      desc: "API-first architecture with TypeScript and Python SDKs.",
      icon: Terminal,
    },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group rounded-xl border border-border bg-surface-1/40 p-6 transition-all hover:-translate-y-1 hover:border-brand/30 hover:bg-surface-2/60 hover:shadow-[0_4px_24px_rgba(255,255,255,0.03)] cursor-pointer">
              <div className="grid size-10 place-items-center rounded-lg border border-border bg-surface-3 text-muted-foreground mb-4 transition-colors group-hover:border-brand/40 group-hover:bg-brand/10">
                <f.icon className="size-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand group-hover:drop-shadow-[0_0_8px_rgba(241,116,99,0.5)]" />
              </div>
              <h3 className="text-[15px] font-semibold transition-colors group-hover:text-brand">{f.title}</h3>
              <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- BUILT FOR PRODUCTION ----------------------------- */
function BuiltForProduction() {
  const cards = [
    { title: "AI Startups", desc: "Launch customer-facing AI products faster." },
    { title: "Internal Platforms", desc: "Automate operations across engineering and business teams." },
    { title: "Enterprise AI", desc: "Secure, observable AI infrastructure with governance and compliance." },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand text-center">Built for production teams</div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map(c => (
            <div key={c.title} className="group relative overflow-hidden rounded-2xl border border-border bg-surface-1/40 p-8 transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_0_20px_rgba(241,116,99,0.05)]">
              <div className="absolute inset-0 bg-noise opacity-20" />
              <div className="absolute inset-0 grid-bg opacity-20" />
              <h3 className="relative text-xl font-semibold tracking-tight group-hover:text-brand transition-colors">{c.title}</h3>
              <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- PRICING ----------------------------- */
function Pricing() {
  const [yearly, setYearly] = useState(false);
  const tiers = [
    {
      name: "Team",
      price: yearly ? 39 : 49,
      desc: "Best for startups building internal AI tools.",
      features: ["10 active workflows", "50k AI credits / mo", "5 GB vector storage", "Community support"],
      cta: "Start free trial",
      highlight: false,
    },
    {
      name: "Business",
      price: yearly ? 159 : 199,
      desc: "Best for production AI applications serving customers.",
      features: [
        "Unlimited workflows",
        "500k AI credits / mo",
        "50 GB vector storage",
        "SSO, RBAC, audit log",
        "Priority support",
      ],
      cta: "Start free trial",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: null,
      desc: "Self-hosted, VPC deployment, compliance and dedicated support.",
      features: ["Self-host or VPC", "Custom SLA & SOC 2", "Dedicated TAM", "Volume credits"],
      cta: "Contact sales",
      highlight: false,
    },
  ];
  return (
    <section className="border-b border-border/60 bg-surface-1/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
            PRICING
          </div>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Simple pricing that scales with your AI systems.
          </h2>
          <div className="mt-8 inline-flex items-center gap-1 rounded-md border border-border bg-surface-1 p-1">
            <button
              onClick={() => setYearly(false)}
              className={`rounded px-3 py-1 text-[12px] font-medium transition-colors ${
                !yearly ? "bg-surface-3 text-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded px-3 py-1 text-[12px] font-medium transition-colors ${
                yearly ? "bg-surface-3 text-foreground" : "text-muted-foreground"
              }`}
            >
              Yearly <span className="ml-1 text-brand">−20%</span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-2xl border transition-all hover:-translate-y-1 ${
                t.highlight
                  ? "border-brand/40 bg-surface-1/90 glow-brand p-8 z-10 scale-[1.02]"
                  : "border-border bg-surface-1/60 p-6"
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-6 rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand shadow-[0_0_10px_rgba(241,116,99,0.2)]">
                  Most popular
                </div>
              )}
              <div className="text-[13px] font-medium text-muted-foreground">{t.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                {t.price !== null ? (
                  <>
                    <span className="text-4xl font-semibold tracking-tight">${t.price}</span>
                    <span className="text-[12px] text-muted-foreground">/ user / mo</span>
                  </>
                ) : (
                  <span className="text-4xl font-semibold tracking-tight">Custom</span>
                )}
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground">{t.desc}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-brand" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 inline-flex h-10 items-center justify-center rounded-md text-[13px] font-medium transition-all hover:-translate-y-0.5 ${
                  t.highlight
                    ? "bg-foreground text-background hover:opacity-90 hover:shadow-[0_4px_14px_rgba(255,255,255,0.2)]"
                    : "border border-border bg-surface-2 text-foreground hover:bg-surface-3"
                }`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- CTA ----------------------------- */
function CTA() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-40">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-1/60 p-16 text-center">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
          <div className="pointer-events-none absolute -top-32 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px] animate-pulse" />
          
          <div className="absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 700 200" className="absolute inset-0 size-full opacity-30">
               <path d="M -100 100 C 100 100, 300 200, 800 50" stroke="oklch(0.78 0.13 195)" strokeWidth="1.5" fill="none" className="dash-flow" />
            </svg>
          </div>

          <div className="relative z-10">
            <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Build AI systems that run themselves.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Start free with 1,000 workflow executions. No credit card required.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                to="/dashboard/chat"
                className="group inline-flex h-12 items-center gap-2 rounded-md bg-foreground px-6 text-[14px] font-medium text-background transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Start Building <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface-2 px-4 text-[13px] font-medium hover:bg-surface-3"
              >
                Talk to Engineering
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FOOTER ----------------------------- */
function Footer() {
  const cols = [
    { h: "Platform", l: ["Workflows", "Agents", "Memory", "Integrations", "Runs"] },
    { h: "Developers", l: ["Documentation", "API", "SDKs", "CLI", "Status"] },
    { h: "Company", l: ["About", "Customers", "Careers", "Blog"] },
    { h: "Legal", l: ["Privacy", "Security", "Terms", "DPA"] },
  ];
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 group cursor-pointer w-fit">
              <div className="group-hover:glow-brand transition-all rounded-md"><LogoMark /></div>
              <span className="font-semibold tracking-tight group-hover:text-brand transition-colors">Cognify</span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] text-muted-foreground">
              Infrastructure for production AI systems.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {c.h}
              </div>
              <ul className="mt-4 space-y-2">
                {c.l.map((i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground relative group"
                    >
                      {i}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand transition-all group-hover:w-full"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-[12px] text-muted-foreground md:flex-row md:items-center">
          <div>© 2026 Cognify Inc.</div>
          <div className="flex items-center gap-4 font-mono">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> All Systems Operational
            </span>
            <span>SOC 2 · ISO 27001 · GDPR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
