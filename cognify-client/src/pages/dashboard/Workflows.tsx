import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Panel,
  Handle,
  Position,
  NodeProps,
  Edge
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { 
  Zap, 
  Bot, 
  MessageSquare, 
  Play, 
  Save, 
  Trash2, 
  Grid,
  Clock,
  Layout,
  Plus,
  CheckCircle,
  XCircle,
  Database,
  ArrowRight
} from "lucide-react";
import { api } from "../../utils/api";

// ─── CUSTOM NODE COMPONENTS ──────────────────────────────────────────────────

// Custom Trigger Node
const TriggerNode = ({ data, selected }: any) => {
  return (
    <div className={`p-4 rounded-xl border bg-[var(--dash-card-bg)] shadow-sm w-48 text-left transition-all ${
      selected ? "border-[#e8712a] ring-2 ring-[#e8712a]/10" : "border-[var(--dash-border)]"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg bg-[#e8712a]/10 flex items-center justify-center text-[#e8712a]">
          <Zap className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase tracking-wider">Trigger</span>
          <span className="text-xs font-bold text-[var(--dash-text)]">{data.label || "Start Event"}</span>
        </div>
      </div>
      <div className="text-[10px] text-[var(--dash-muted)] bg-[var(--dash-hover)] p-1.5 rounded border border-[var(--dash-border)] italic truncate">
        Type: {String(data.triggerType || "MANUAL")}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-[#e8712a]" />
    </div>
  );
};

// Custom AI Node
const AINode = ({ data, selected }: any) => {
  return (
    <div className={`p-4 rounded-xl border bg-[var(--dash-card-bg)] shadow-sm w-48 text-left transition-all ${
      selected ? "border-[#e8712a] ring-2 ring-[#e8712a]/10" : "border-[var(--dash-border)]"
    }`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-[#e8712a]" />
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">AI Agent</span>
          <span className="text-xs font-bold text-[var(--dash-text)]">{data.label || "AI Executor"}</span>
        </div>
      </div>
      <div className="text-[10px] text-[var(--dash-muted)] bg-indigo-50/50 p-1.5 rounded border border-indigo-100 truncate">
        Agent: {String(data.agentType || "general")}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-[#e8712a]" />
    </div>
  );
};

// Custom Action Node
const ActionNode = ({ data, selected }: any) => {
  return (
    <div className={`p-4 rounded-xl border bg-[var(--dash-card-bg)] shadow-sm w-48 text-left transition-all ${
      selected ? "border-[#e8712a] ring-2 ring-[#e8712a]/10" : "border-[var(--dash-border)]"
    }`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-[#e8712a]" />
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Action</span>
          <span className="text-xs font-bold text-[var(--dash-text)]">{data.label || "Integration Task"}</span>
        </div>
      </div>
      <div className="text-[10px] text-[var(--dash-muted)] bg-blue-50/50 p-1.5 rounded border border-blue-100 truncate">
        Action: {String(data.actionType || "slack")}
      </div>
    </div>
  );
};

// Dagre graph auto-layout helper
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - 100,
        y: nodeWithPosition.y - 60,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// ─── MAIN BUILDER COMPONENT ──────────────────────────────────────────────────

export const Workflows = () => {
  // Scoping workspaces
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

  // Workflows states
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Execution History runs
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);

  // Loading indicator
  const [isSaving, setIsSaving] = useState(false);

  // Mock workflows fallback
  const mockWorkflows = [
    { id: "mock-wf-1", name: "Daily Analytics Report", trigger: "SCHEDULE", steps: 4, isActive: true, lastRun: "6h ago" },
    { id: "mock-wf-2", name: "Code Review Notifier", trigger: "EVENT", steps: 3, isActive: true, lastRun: "1d ago" },
    { id: "mock-wf-3", name: "Weekly Team Digest", trigger: "SCHEDULE", steps: 5, isActive: false, lastRun: "3d ago" }
  ];

  const mockDefinitions: Record<string, any> = {
    "mock-wf-1": {
      nodes: [
        { id: "n-1", type: "triggerNode", position: { x: 50, y: 150 }, data: { label: "Schedule trigger", triggerType: "CRON" } },
        { id: "n-2", type: "aiNode", position: { x: 250, y: 150 }, data: { label: "Research Agent", agentType: "research" } },
        { id: "n-3", type: "actionNode", position: { x: 450, y: 150 }, data: { label: "Email send", actionType: "slack" } }
      ],
      edges: [
        { id: "e-1", source: "n-1", target: "n-2", type: "smoothstep", style: { stroke: "#e8712a" } },
        { id: "e-2", source: "n-2", target: "n-3", type: "smoothstep", style: { stroke: "#e8712a" } }
      ]
    },
    "mock-wf-2": {
      nodes: [
        { id: "n-1", type: "triggerNode", position: { x: 50, y: 150 }, data: { label: "GitHub webhook", triggerType: "WEBHOOK" } },
        { id: "n-2", type: "aiNode", position: { x: 250, y: 150 }, data: { label: "Code Agent", agentType: "code" } },
        { id: "n-3", type: "actionNode", position: { x: 450, y: 150 }, data: { label: "Slack message", actionType: "slack" } }
      ],
      edges: [
        { id: "e-1", source: "n-1", target: "n-2", type: "smoothstep", style: { stroke: "#e8712a" } },
        { id: "e-2", source: "n-2", target: "n-3", type: "smoothstep", style: { stroke: "#e8712a" } }
      ]
    },
    "mock-wf-3": {
      nodes: [
        { id: "n-1", type: "triggerNode", position: { x: 50, y: 150 }, data: { label: "Manual trigger", triggerType: "MANUAL" } },
        { id: "n-2", type: "aiNode", position: { x: 250, y: 150 }, data: { label: "File processor", agentType: "general" } },
        { id: "n-3", type: "actionNode", position: { x: 450, y: 150 }, data: { label: "Embed into Pinecone", actionType: "sheets" } }
      ],
      edges: [
        { id: "e-1", source: "n-1", target: "n-2", type: "smoothstep", style: { stroke: "#e8712a" } },
        { id: "e-2", source: "n-2", target: "n-3", type: "smoothstep", style: { stroke: "#e8712a" } }
      ]
    }
  };

  // Register custom node types
  const nodeTypes = useMemo(() => ({
    triggerNode: TriggerNode,
    aiNode: AINode,
    actionNode: ActionNode,
  }), []);

  // Fetch workspaces on load
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const res = await api.get("/workspaces");
        setWorkspaces(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedWorkspaceId(res.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load workspaces:", err);
      }
    };
    loadWorkspaces();
  }, []);

  // Fetch workflows when selected workspace changes
  const fetchWorkflows = async () => {
    if (!selectedWorkspaceId) return;
    try {
      const res = await api.get(`/workflows/${selectedWorkspaceId}`);
      setWorkflows(res.data || []);
      if (res.data && res.data.length > 0) {
        // Select the first workflow
        loadWorkflowIntoCanvas(res.data[0]);
      } else {
        setSelectedWorkflow(null);
        setNodes([]);
        setEdges([]);
      }
    } catch (err) {
      console.error("Failed to load workflows:", err);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [selectedWorkspaceId]);

  // Load a workflow's nodes/edges into React Flow state
  const loadWorkflowIntoCanvas = (wf: any) => {
    setSelectedWorkflow(wf);
    setSelectedNode(null);
    setSelectedRun(null);
    setShowTemplates(false);
    
    const definition = (wf.definition || {}) as { nodes?: any[]; edges?: any[] } || {};
    setNodes(definition.nodes || []);
    setEdges(definition.edges || []);

    // Load runs history
    if (wf.id) {
      fetchRuns(wf.id);
    } else {
      // Mock runs
      setRuns([
        { id: "run-9842", status: "SUCCESS", trigger: wf.trigger || "SCHEDULE", latency_ms: 1240, created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
        { id: "run-9710", status: "SUCCESS", trigger: wf.trigger || "SCHEDULE", latency_ms: 1850, created_at: new Date(Date.now() - 12 * 3600000).toISOString() },
        { id: "run-9602", status: "FAILED", trigger: wf.trigger || "SCHEDULE", latency_ms: 320, created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
        { id: "run-9540", status: "SUCCESS", trigger: wf.trigger || "SCHEDULE", latency_ms: 1420, created_at: new Date(Date.now() - 36 * 3600000).toISOString() },
        { id: "run-9411", status: "SUCCESS", trigger: wf.trigger || "SCHEDULE", latency_ms: 1540, created_at: new Date(Date.now() - 48 * 3600000).toISOString() }
      ]);
    }
  };

  // Fetch runs history for a workflow
  const fetchRuns = async (wfId: string) => {
    try {
      const res = await api.get(`/workflows/${wfId}/runs`);
      setRuns(res.data || []);
    } catch (err) {
      console.error("Failed to fetch runs:", err);
    }
  };

  // Connect edges handler
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, type: "smoothstep", style: { stroke: "#e8712a" } }, eds)),
    [setEdges]
  );

  // Save workflow back to server
  const handleSaveWorkflow = async () => {
    if (!selectedWorkflow) return;
    setIsSaving(true);
    try {
      const updated = await api.put(`/workflows/${selectedWorkflow.id}`, {
        definition: { nodes, edges },
      });
      // Update in array
      setWorkflows((prev) => prev.map((w) => (w.id === selectedWorkflow.id ? updated.data : w)));
      setSelectedWorkflow(updated.data);
      alert("Workflow saved successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async () => {
    if (!selectedWorkflow) return;
    try {
      const updated = await api.put(`/workflows/${selectedWorkflow.id}`, {
        isActive: !selectedWorkflow.isActive,
      });
      setWorkflows((prev) => prev.map((w) => (w.id === selectedWorkflow.id ? updated.data : w)));
      setSelectedWorkflow(updated.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to toggle active state");
    }
  };

  // Create a new workflow
  const handleCreateWorkflow = async () => {
    if (!selectedWorkspaceId) return;
    const name = prompt("Enter workflow name:");
    if (!name) return;

    try {
      const initialNodes = [
        {
          id: "node-1",
          type: "triggerNode",
          position: { x: 100, y: 50 },
          data: { label: "PR Webhook trigger", triggerType: "MANUAL" },
        },
      ];

      const res = await api.post(`/workflows/${selectedWorkspaceId}`, {
        name,
        description: "Custom visual workflow automation pipeline",
        definition: { nodes: initialNodes, edges: [] },
      });

      await fetchWorkflows();
      loadWorkflowIntoCanvas(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create workflow");
    }
  };

  // Delete a workflow
  const handleDeleteWorkflow = async () => {
    if (!selectedWorkflow) return;
    if (!confirm("Are you sure you want to delete this workflow?")) return;

    try {
      await api.delete(`/workflows/${selectedWorkflow.id}`);
      await fetchWorkflows();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete workflow");
    }
  };

  // Add a new node to canvas
  const handleAddNode = (type: "trigger" | "ai" | "action") => {
    if (!selectedWorkflow) return;

    const id = `node-${Date.now()}`;
    let newNode: any = {
      id,
      position: { x: 100, y: 150 + nodes.length * 50 },
    };

    if (type === "trigger") {
      newNode.type = "triggerNode";
      newNode.data = { label: "Trigger Node", triggerType: "MANUAL" };
    } else if (type === "ai") {
      newNode.type = "aiNode";
      newNode.data = { label: "AI Solver Step", agentType: "general", prompt: "Review this context: {{input}}" };
    } else {
      newNode.type = "actionNode";
      newNode.data = { label: "Slack Notification", actionType: "slack", channel: "general", message: "Result: {{input}}" };
    }

    setNodes((prev) => [...prev, newNode]);
  };

  // Delete the selected node
  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNode.id));
    setEdges((prev) => prev.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  // Trigger workflow run
  const handleTriggerRun = async () => {
    if (!selectedWorkflow) return;
    try {
      const res = await api.post(`/workflows/${selectedWorkflow.id}/trigger`, {
        inputVariables: { message: "Manual trigger run started from visual editor panel" },
      });
      alert(`Workflow queued! Run ID: ${res.data.runId}`);
      // Poll/refresh run records after 3 seconds
      setTimeout(() => fetchRuns(selectedWorkflow.id), 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to trigger run");
    }
  };

  // Auto layout nodes using Dagre
  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  }, [nodes, edges]);

  // Click handler on nodes to load config editor
  const onNodeClick = (_event: any, node: any) => {
    setSelectedNode(node);
  };

  // Handle configuration updates on the selected node
  const updateSelectedNodeData = (updatedFields: any) => {
    if (!selectedNode) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              ...updatedFields,
            },
          };
        }
        return n;
      })
    );
    setSelectedNode((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        data: {
          ...prev.data,
          ...updatedFields,
        },
      };
    });
  };

  const displayedWorkflows = workflows;

  return (
    <div className="flex flex-col gap-6 select-none h-full min-h-[600px]">
      {/* Header Panel */}
      <div className="flex items-center justify-between text-left">
        <div>
          <span className="text-[10px] text-[#e8712a] font-bold uppercase tracking-[0.08em] block mb-1">ACTIVE WORKSPACE</span>
          <h1 className="text-[28px] font-bold text-[var(--dash-text)] tracking-tight leading-none">
            Workflow Automation Builder
          </h1>
          <p className="text-sm text-[var(--dash-muted2)] mt-2">
            Design multi-step visual workflows combining triggers, LLM AI Agents, and communication tools.
          </p>
        </div>
        
        {/* Workspace Scoper */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase tracking-wider">Workspace:</span>
          <select
            value={selectedWorkspaceId}
            onChange={(e) => setSelectedWorkspaceId(e.target.value)}
            className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--dash-text)] outline-none cursor-pointer"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch flex-1 overflow-hidden min-h-[500px]">
        
        {/* Column 1: Sidebar list */}
        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-4 flex flex-col gap-4 justify-between lg:col-span-1 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-[var(--dash-border)] pb-2 text-left">
              <span className="text-[11px] text-[var(--dash-muted2)] font-bold uppercase tracking-wider">Workflows</span>
              <span className="text-[11px] text-[var(--dash-muted2)] font-medium cursor-pointer hover:text-[var(--dash-text)]">Recently updated ↕</span>
            </div>
            
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 text-left">
              {displayedWorkflows.map((wf) => {
                const isActive = selectedWorkflow?.id === wf.id;
                const triggerType = wf.trigger || (wf.definition?.nodes?.[0]?.data?.triggerType || "MANUAL");
                const stepsCount = wf.steps || wf.definition?.nodes?.length || 1;
                const lastRunText = wf.lastRun || "2h ago";
                
                return (
                  <div
                    key={wf.id}
                    onClick={() => loadWorkflowIntoCanvas(wf)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isActive
                        ? "bg-[rgba(232,113,42,0.05)] border-[#e8712a]/30 text-[#e8712a]"
                        : "bg-[var(--dash-hover)]/40 border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold truncate max-w-[130px]">{wf.name}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${wf.isActive ? "bg-[#2d9e6b]" : "bg-neutral-350"}`} title={wf.isActive ? "Active" : "Inactive"} />
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[9px] uppercase ${
                        triggerType === "SCHEDULE" || triggerType === "CRON"
                          ? "bg-[var(--amber-dim)] text-[#d97706]"
                          : triggerType === "EVENT" || triggerType === "WEBHOOK"
                            ? "bg-[var(--orange-dim)] text-[#e8712a]"
                            : "bg-[var(--bg-card)] text-[var(--text2)]"
                      }`}>
                        {triggerType === "SCHEDULE" || triggerType === "CRON" ? "Schedule" : triggerType === "EVENT" || triggerType === "WEBHOOK" ? "Event" : "Manual"}
                      </span>
                      <span className="text-[var(--dash-muted2)]">{stepsCount} steps • {lastRunText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleCreateWorkflow}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold text-[#e8712a] bg-[rgba(232,113,42,0.05)] hover:bg-[rgba(232,113,42,0.10)] border border-dashed border-[#e8712a]/30 transition-all cursor-pointer border-none"
          >
            <Plus className="h-4 w-4" /> + New Workflow
          </button>
        </div>

        {/* Column 2 & 3: Visual Canvas Editor */}
        <div className="lg:col-span-2 flex flex-col border border-[var(--dash-border)] rounded-2xl bg-[var(--dash-card-bg)] overflow-hidden relative shadow-sm min-h-[480px]">
          {showTemplates ? (
            <div className="flex-1 flex flex-col p-5 overflow-y-auto bg-[var(--dash-card-bg)] text-left">
              <div className="flex justify-between items-center border-b border-[var(--dash-border)] pb-3 mb-4">
                <h3 className="text-sm font-bold text-[var(--dash-text)]">Workflow Templates</h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-xs font-semibold text-[var(--dash-muted2)] hover:text-[var(--dash-text)] cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    id: "tmpl-1",
                    name: "Daily Digest",
                    pills: ["Schedule", "Research Agent", "Email"],
                    desc: "Runs every morning, summarizes overnight activity, emails the team.",
                    nodes: [
                      { id: "t-1", type: "triggerNode", position: { x: 50, y: 150 }, data: { label: "Schedule 9AM", triggerType: "CRON" } },
                      { id: "t-2", type: "aiNode", position: { x: 250, y: 150 }, data: { label: "Research Digest Agent", agentType: "research" } },
                      { id: "t-3", type: "actionNode", position: { x: 450, y: 150 }, data: { label: "Email team alert", actionType: "slack" } }
                    ],
                    edges: [
                      { id: "te-1", source: "t-1", target: "t-2" },
                      { id: "te-2", source: "t-2", target: "t-3" }
                    ]
                  },
                  {
                    id: "tmpl-2",
                    name: "Code Review Alert",
                    pills: ["Webhook", "Code Agent", "Slack"],
                    desc: "Triggers on PR open, reviews the diff, posts summary to Slack.",
                    nodes: [
                      { id: "t-1", type: "triggerNode", position: { x: 50, y: 150 }, data: { label: "GitHub Webhook", triggerType: "WEBHOOK" } },
                      { id: "t-2", type: "aiNode", position: { x: 250, y: 150 }, data: { label: "Code Audit Agent", agentType: "code" } },
                      { id: "t-3", type: "actionNode", position: { x: 450, y: 150 }, data: { label: "Slack post alert", actionType: "slack" } }
                    ],
                    edges: [
                      { id: "te-1", source: "t-1", target: "t-2" },
                      { id: "te-2", source: "t-2", target: "t-3" }
                    ]
                  },
                  {
                    id: "tmpl-3",
                    name: "Knowledge Sync",
                    pills: ["Manual", "Processor", "Pinecone"],
                    desc: "Re-indexes all workspace files on demand.",
                    nodes: [
                      { id: "t-1", type: "triggerNode", position: { x: 50, y: 150 }, data: { label: "Manual trigger", triggerType: "MANUAL" } },
                      { id: "t-2", type: "aiNode", position: { x: 250, y: 150 }, data: { label: "File sync service", agentType: "general" } },
                      { id: "t-3", type: "actionNode", position: { x: 450, y: 150 }, data: { label: "Index in VectorDb", actionType: "sheets" } }
                    ],
                    edges: [
                      { id: "te-1", source: "t-1", target: "t-2" },
                      { id: "te-2", source: "t-2", target: "t-3" }
                    ]
                  }
                ].map((tmpl, idx) => (
                  <div key={idx} className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl p-4 flex flex-col gap-3 shadow-sm border-[rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-[var(--orange-dim)] flex items-center justify-center text-[#e8712a]">
                        <Zap className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-[var(--dash-text)]">{tmpl.name}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {tmpl.pills.map((p, pidx) => (
                        <span key={pidx} className="font-mono text-[9.5px] px-2 py-0.5 rounded bg-[var(--dash-hover)] text-[var(--text2)] border border-[var(--border)]">{p}</span>
                      ))}
                    </div>

                    <p className="text-xs text-[var(--text1)] leading-relaxed">{tmpl.desc}</p>

                    <button
                      onClick={() => {
                        const newWf = {
                          id: `tmpl-wf-${Date.now()}`,
                          name: `${tmpl.name} Custom`,
                          isActive: true,
                          definition: { nodes: tmpl.nodes, edges: tmpl.edges }
                        };
                        setWorkflows(prev => [newWf, ...prev]);
                        loadWorkflowIntoCanvas(newWf);
                      }}
                      className="self-end px-3 py-1.5 bg-[var(--orange-dim)] hover:bg-[rgba(232,113,42,0.15)] text-[#e8712a] text-xs font-bold rounded-md transition-all border border-[var(--orange-border)] cursor-pointer"
                    >
                      Use template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedWorkflow ? (
            <>
              {/* Canvas Header toolbar */}
              <div className="h-14 border-b border-[var(--dash-border)] px-4 flex items-center justify-between bg-[var(--dash-hover)]">
                <span className="text-xs font-bold text-[var(--dash-text)] uppercase tracking-wider flex items-center gap-2">
                  <Grid className="h-4.5 w-4.5 text-[#e8712a]" />
                  Canvas: {selectedWorkflow.name}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onLayout}
                    className="p-2 rounded-lg hover:bg-neutral-200 text-[var(--dash-muted)] transition-all"
                    title="Auto Layout Diagram"
                  >
                    <Layout className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleToggleActive}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedWorkflow.isActive
                        ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        : "bg-[var(--dash-hover)] border-[var(--dash-border)] text-[var(--dash-muted)] hover:bg-neutral-200"
                    }`}
                  >
                    {selectedWorkflow.isActive ? "Pause Run" : "Activate"}
                  </button>
                  <button
                    onClick={handleSaveWorkflow}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[rgba(232,113,42,0.1)] hover:bg-[rgba(232,113,42,0.15)] text-xs font-bold text-[#e8712a] border border-[#e8712a]/30 transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleTriggerRun}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e8712a] hover:bg-[#1CA2B8] text-xs font-bold text-white transition-all cursor-pointer border-none shadow-sm"
                  >
                    <Play className="h-4 w-4" /> Run
                  </button>
                </div>
              </div>

              {/* Node Palette overlay */}
              <div className="absolute top-16 left-4 z-10 flex gap-1.5 bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl p-1.5 shadow-sm">
                <button
                  onClick={() => handleAddNode("trigger")}
                  className="px-2 py-1 rounded text-[9.5px] font-bold bg-[#e8712a]/10 text-[#e8712a] border border-[#e8712a]/20 cursor-pointer"
                >
                  + Trigger
                </button>
                <button
                  onClick={() => handleAddNode("ai")}
                  className="px-2 py-1 rounded text-[9.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 cursor-pointer"
                >
                  + AI Agent
                </button>
                <button
                  onClick={() => handleAddNode("action")}
                  className="px-2 py-1 rounded text-[9.5px] font-bold bg-blue-50 text-blue-700 border border-blue-100 cursor-pointer"
                >
                  + Action
                </button>
              </div>

              {/* React Flow Graph */}
              <div className="flex-1 bg-[var(--dash-bg)] min-h-[350px]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                >
                  <Background color="#333" gap={16} size={1} />
                  <Controls className="!bg-[var(--dash-card-bg)] !border-[var(--dash-border)] !shadow-sm" />
                  <MiniMap nodeStrokeWidth={3} className="!border-[var(--dash-border)] !shadow-sm" />
                </ReactFlow>
              </div>

              {/* Last 5 runs */}
              <div className="border-t border-[var(--dash-border)] p-4 bg-[var(--dash-card-bg)] text-left shrink-0">
                <span className="text-[10px] font-bold text-[var(--dash-muted2)] uppercase tracking-[0.08em] block mb-3">LAST 5 RUNS</span>
                <div className="border border-[var(--dash-border)] rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--dash-hover)] border-b border-[var(--dash-border)] text-[10px] font-bold text-[var(--dash-muted2)] uppercase tracking-wider">
                        <th className="p-2.5 pl-4">RUN ID</th>
                        <th className="p-2.5">STATUS</th>
                        <th className="p-2.5">DURATION</th>
                        <th className="p-2.5">TRIGGERED BY</th>
                        <th className="p-2.5 text-right pr-4">TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs.slice(0, 5).map((run, idx) => (
                        <tr key={idx} className="border-b border-[var(--dash-border)] last:border-b-0 text-xs text-[var(--dash-muted)]">
                          <td className="p-2.5 pl-4 font-mono text-[var(--dash-muted2)]">{run.id}</td>
                          <td className="p-2.5">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              run.status === "SUCCESS"
                                ? "bg-[rgba(45,158,107,0.10)] text-[#2d9e6b]"
                                : run.status === "FAILED"
                                  ? "bg-[rgba(220,38,38,0.08)] text-[#dc2626]"
                                  : "bg-[var(--amber-dim)] text-[#d97706] animate-pulse"
                            }`}>
                              {run.status}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono">{run.latency_ms}ms</td>
                          <td className="p-2.5">{run.trigger === "CRON" || run.trigger === "SCHEDULE" ? "Scheduler" : "Manual"}</td>
                          <td className="p-2.5 text-right pr-4 text-[var(--dash-muted2)]">{new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--dash-bg)] text-[var(--dash-muted2)] text-center">
              {/* CSS pipeline illustration */}
              <div className="flex items-center gap-2.5 mb-6">
                <div className="h-10 w-10 rounded-full bg-[var(--bg-card)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-muted2)]">
                  <Zap className="h-4.5 w-4.5 text-[#e8712a]" />
                </div>
                <div className="w-6 h-0.5 bg-[var(--border-md)]" />
                <div className="h-10 w-10 rounded-full bg-[var(--bg-card)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-muted2)]">
                  <Bot className="h-4.5 w-4.5 text-blue-500" />
                </div>
                <div className="w-6 h-0.5 bg-[var(--border-md)]" />
                <div className="h-10 w-10 rounded-full bg-[var(--bg-card)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-muted2)]">
                  <MessageSquare className="h-4.5 w-4.5 text-[#2d9e6b]" />
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-[var(--dash-muted)]">Select a workflow to view its pipeline</h3>
              <p className="text-xs text-[var(--dash-muted2)] mt-1 leading-normal max-w-xs">Or create a new one to automate your agent tasks.</p>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTemplates(true)}
                  className="px-4 py-2 bg-[var(--orange-dim)] hover:bg-[rgba(232,113,42,0.15)] text-[#e8712a] text-xs font-bold rounded-md transition-all border border-[var(--orange-border)] cursor-pointer"
                >
                  Start from template
                </button>
                <button
                  onClick={handleCreateWorkflow}
                  className="px-4 py-2 bg-[var(--bg-card)] hover:bg-[var(--dash-hover)] text-[var(--dash-muted)] text-xs font-bold rounded-md transition-all border border-[var(--border)] cursor-pointer"
                >
                  Start blank
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Column 4: Property Config Editor or Execution history logs */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Selected Node Config Editor */}
          {selectedWorkflow && selectedNode && (
            <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-5 flex flex-col gap-4 shadow-sm text-left">
              <h2 className="text-sm font-bold text-[var(--dash-text)] border-b border-[var(--dash-border)] pb-2 flex justify-between items-center">
                <span>Configure Node: {selectedNode.id}</span>
                <button
                  onClick={handleDeleteNode}
                  className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer bg-transparent border-none"
                  title="Delete Node"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </h2>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">Node Label</label>
                  <input
                    type="text"
                    value={selectedNode.data.label || ""}
                    onChange={(e) => updateSelectedNodeData({ label: e.target.value })}
                    className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] focus:border-[#e8712a] outline-none"
                  />
                </div>

                {/* Conditional fields based on custom node types */}
                {selectedNode.type === "triggerNode" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">Trigger Type</label>
                    <select
                      value={selectedNode.data.triggerType || "MANUAL"}
                      onChange={(e) => updateSelectedNodeData({ triggerType: e.target.value })}
                      className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] outline-none"
                    >
                      <option value="MANUAL">Manual Trigger</option>
                      <option value="WEBHOOK">Webhook (Incoming payload)</option>
                      <option value="CRON">Cron (Scheduled runs)</option>
                    </select>
                    {selectedNode.data.triggerType === "WEBHOOK" && (
                      <div className="mt-2 bg-[var(--dash-hover)] p-2 rounded border text-[9.5px] text-[var(--dash-muted)]">
                        <span className="font-bold block mb-1">Webhook URL:</span>
                        <code className="select-all break-all">{`${window.location.origin}/api/workflows/webhook/${selectedWorkflow.id}`}</code>
                      </div>
                    )}
                  </div>
                )}

                {selectedNode.type === "aiNode" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">Target AI Agent</label>
                      <select
                        value={selectedNode.data.agentType || "general"}
                        onChange={(e) => updateSelectedNodeData({ agentType: e.target.value })}
                        className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] outline-none"
                      >
                        <option value="general">General LLM Agent</option>
                        <option value="code">Code Review Solver</option>
                        <option value="research">Market Research Agent</option>
                        <option value="business">Business Strategy Agent</option>
                        <option value="analytics">Metrics Analytics Agent</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">System Instruction / Prompt</label>
                      <textarea
                        value={selectedNode.data.prompt || ""}
                        onChange={(e) => updateSelectedNodeData({ prompt: e.target.value })}
                        rows={4}
                        placeholder="e.g. Audit these code lines: {{input}}"
                        className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] focus:border-[#e8712a] outline-none resize-none"
                      />
                      <span className="text-[8.5px] text-[var(--dash-muted2)]">Use <code>{"{{input}}"}</code> to insert the output of the parent node.</span>
                    </div>
                  </>
                )}

                {selectedNode.type === "actionNode" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">Integration Tool</label>
                      <select
                        value={selectedNode.data.actionType || "slack"}
                        onChange={(e) => updateSelectedNodeData({ actionType: e.target.value })}
                        className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] outline-none"
                      >
                        <option value="slack">Slack Channel Alert</option>
                        <option value="notion">Notion Page Creator</option>
                        <option value="sheets">Google Sheets Row Appender</option>
                      </select>
                    </div>

                    {selectedNode.data.actionType === "slack" && (
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">Slack Channel</label>
                          <input
                            type="text"
                            value={selectedNode.data.channel || ""}
                            onChange={(e) => updateSelectedNodeData({ channel: e.target.value })}
                            placeholder="e.g. dev-alerts"
                            className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] focus:border-[#e8712a] outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">Message Template</label>
                          <textarea
                            value={selectedNode.data.message || ""}
                            onChange={(e) => updateSelectedNodeData({ message: e.target.value })}
                            rows={3}
                            placeholder="e.g. PR review response: {{input}}"
                            className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] focus:border-[#e8712a] outline-none resize-none"
                          />
                        </div>
                      </>
                    )}

                    {selectedNode.data.actionType === "notion" && (
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">Database ID</label>
                          <input
                            type="text"
                            value={selectedNode.data.databaseId || ""}
                            onChange={(e) => updateSelectedNodeData({ databaseId: e.target.value })}
                            className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] focus:border-[#e8712a] outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">Page Title</label>
                          <input
                            type="text"
                            value={selectedNode.data.title || ""}
                            onChange={(e) => updateSelectedNodeData({ title: e.target.value })}
                            placeholder="e.g. Audit task completed"
                            className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] focus:border-[#e8712a] outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">Page Content</label>
                          <textarea
                            value={selectedNode.data.content || ""}
                            onChange={(e) => updateSelectedNodeData({ content: e.target.value })}
                            rows={3}
                            placeholder="Summary: {{input}}"
                            className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] focus:border-[#e8712a] outline-none resize-none"
                          />
                        </div>
                      </>
                    )}

                    {selectedNode.data.actionType === "sheets" && (
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">Spreadsheet ID</label>
                          <input
                            type="text"
                            value={selectedNode.data.spreadsheetId || ""}
                            onChange={(e) => updateSelectedNodeData({ spreadsheetId: e.target.value })}
                            className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] focus:border-[#e8712a] outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase">Sheet Range</label>
                          <input
                            type="text"
                            value={selectedNode.data.range || ""}
                            onChange={(e) => updateSelectedNodeData({ range: e.target.value })}
                            placeholder="e.g. Sheet1!A1"
                            className="bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs text-[var(--dash-text)] focus:border-[#e8712a] outline-none"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Execution History runs list */}
          {selectedWorkflow && (
            <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-5 flex flex-col gap-4 shadow-sm flex-1 max-h-[360px] overflow-hidden text-left">
              <h2 className="text-sm font-bold text-[var(--dash-text)] border-b border-[var(--dash-border)] pb-2 flex justify-between items-center">
                <span>Execution Logs</span>
                <button
                  onClick={() => fetchRuns(selectedWorkflow.id)}
                  className="text-xs font-semibold text-[#e8712a] hover:underline cursor-pointer bg-transparent border-none"
                >
                  Refresh
                </button>
              </h2>

              <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-1">
                {runs.length === 0 ? (
                  <div className="text-center py-12 text-[var(--dash-muted2)] text-xs italic">No execution history found.</div>
                ) : (
                  runs.map((run) => {
                    const isRunActive = selectedRun?.id === run.id;
                    return (
                      <div
                        key={run.id}
                        onClick={() => setSelectedRun(run)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 text-[11px] ${
                          isRunActive
                            ? "bg-[var(--dash-hover)] border-[var(--dash-border)]"
                            : "bg-[var(--dash-hover)] border-[var(--dash-border)] hover:bg-[var(--dash-hover)]"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[var(--dash-text)] flex items-center gap-1">
                            {run.status === "SUCCESS" ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            ) : run.status === "RUNNING" ? (
                              <Clock className="h-3.5 w-3.5 text-[var(--dash-muted2)] animate-spin" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                            )}
                            {run.trigger} Run
                          </span>
                          <span className="text-[10px] text-[var(--dash-muted2)] font-mono">{run.latency_ms}ms</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-[var(--dash-muted2)] mt-1.5">
                          <span>{new Date(run.created_at).toLocaleDateString()}</span>
                          <span>{new Date(run.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Workflow Run Details Dialog/Drawer */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 text-left max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-[var(--dash-border)] pb-3 mb-4">
                <h3 className="text-base font-extrabold text-[var(--dash-text)]">
                  Run Details: <span className="text-[var(--dash-muted)] font-semibold">{selectedRun.id}</span>
                </h3>
                <span className={`text-[10.5px] px-2.5 py-0.5 rounded font-bold uppercase ${
                  selectedRun.status === "SUCCESS"
                    ? "bg-green-100 text-green-700"
                    : selectedRun.status === "RUNNING"
                      ? "bg-[var(--dash-hover)] text-[var(--dash-muted)] animate-pulse"
                      : "bg-red-100 text-red-700"
                }`}>
                  {selectedRun.status}
                </span>
              </div>

              <div className="flex flex-col gap-4 overflow-y-auto max-h-[50vh] pr-1">
                {/* Step Logs */}
                <span className="text-[10px] text-[var(--dash-muted2)] font-bold uppercase tracking-wider block mb-1">Execution Traversal Steps:</span>
                {(selectedRun.logs as any[] || []).map((step, idx) => (
                  <div key={idx} className="p-3 bg-[var(--dash-hover)] border border-[var(--dash-border)] rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-bold text-[var(--dash-text)]">
                      <span>Step {idx + 1}: {step.stepName}</span>
                      <span className={`text-[9.5px] uppercase ${step.status === "SUCCESS" ? "text-green-600" : "text-red-600"}`}>
                        {step.status}
                      </span>
                    </div>
                    {step.output && (
                      <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] p-2.5 rounded-lg text-[10.5px] text-[var(--dash-text)] whitespace-pre-wrap select-text max-h-40 overflow-y-auto font-mono">
                        {step.output}
                      </div>
                    )}
                    {step.error && (
                      <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-[10.5px] text-red-600 font-mono">
                        Error: {step.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[var(--dash-border)]">
              <button
                type="button"
                onClick={() => setSelectedRun(null)}
                className="px-4.5 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Run Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
