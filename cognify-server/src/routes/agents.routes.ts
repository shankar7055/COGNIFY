import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { autonomousAgent } from "../services/ai/agents/autonomous.agent";
import { usageService } from "../services/analytics/usage.service";
import { estimateTokens } from "../utils/cost";

const router = Router();

/**
 * POST /api/agents/run
 * Run a specific agent or let the router auto-detect.
 * Body: { message, workspace_id?, agent_type? }
 */
router.post("/run", authMiddleware, async (req, res) => {
  try {
    const { message, workspace_id, agent_type } = req.body;
    const userId = (req as any).userId;

    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    const start  = Date.now();
    const result = await autonomousAgent.run(message, userId, workspace_id);
    const latency = Date.now() - start;

    await usageService.logAIRequest({
      prompt:      message,
      response:    result.response,
      model:       "llama-3.3-70b-versatile",
      latency_ms:  latency,
      tokens_used: estimateTokens(message + result.response),
      user_id:     userId,
      workspace_id,
      agent_type:  result.agentType,
    });

    res.json({
      response:   result.response,
      steps:      result.steps,
      agent_type: result.agentType,
      latency_ms: latency,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** GET /api/agents/types — list available agent types */
router.get("/types", authMiddleware, (req, res) => {
  res.json({
    agents: [
      {
        type:        "code",
        name:        "Code Agent",
        description: "Expert in writing, debugging, and reviewing code",
        keywords:    ["code", "bug", "function", "debug", "implement"],
      },
      {
        type:        "research",
        name:        "Research Agent",
        description: "Summarizes and synthesizes information clearly",
        keywords:    ["research", "summarize", "explain", "compare"],
      },
      {
        type:        "business",
        name:        "Business Agent",
        description: "Strategy, marketing, and startup advisor",
        keywords:    ["business", "marketing", "startup", "strategy"],
      },
      {
        type:        "analytics",
        name:        "Analytics Agent",
        description: "Data analyst and BI expert",
        keywords:    ["analytics", "metric", "trend", "data"],
      },
      {
        type:        "general",
        name:        "General Agent",
        description: "General-purpose AI assistant",
        keywords:    [],
      },
    ],
  });
});

export default router;
