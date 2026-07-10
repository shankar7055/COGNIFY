import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { aiRateLimit } from "../middleware/rateLimit.middleware";
import { streamService } from "../services/ai/stream.service";
import { usageService } from "../services/analytics/usage.service";
import { memoryService } from "../services/ai/memory.service";
import { estimateTokens } from "../utils/cost";

const router = Router();

/**
 * GET /api/stream?message=...&workspace_id=...
 * Server-Sent Events endpoint for streaming AI responses.
 */
router.get("/", authMiddleware, aiRateLimit, async (req, res) => {
  const { message, workspace_id } = req.query as {
    message?: string;
    workspace_id?: string;
  };

  if (!message) {
    return res.status(400).json({ message: "Message query param is required" });
  }

  // Set SSE headers
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const userId = (req as any).userId;
  const start  = Date.now();

  // Keep connection alive with a heartbeat comment
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15_000);

  res.on("close", () => clearInterval(heartbeat));

  // Build context string if workspace provided
  let prompt = message;
  if (workspace_id) {
    try {
      const memories = await memoryService.getWorkspaceMemories(workspace_id);
      if (memories.length) {
        const ctx = memories
          .slice(0, 3)
          .map((m) => `- ${m.content}`)
          .join("\n");
        prompt = `Workspace context:\n${ctx}\n\nUser: ${message}`;
      }
    } catch {}
  }

  // Stream to SSE — this handles res.end() internally
  await streamService.streamToSSE(prompt, res);

  // Log usage after stream completes
  try {
    const latency    = Date.now() - start;
    const tokensUsed = estimateTokens(message + message); // approx

    await usageService.logAIRequest({
      prompt:      message,
      response:    "[streamed]",
      model:       "llama-3.3-70b-versatile",
      latency_ms:  latency,
      tokens_used: tokensUsed,
      user_id:     userId,
      workspace_id,
      agent_type:  "stream",
    });

    if (workspace_id) {
      await memoryService.storeMemory(workspace_id, message);
    }
  } catch {}
});

export default router;