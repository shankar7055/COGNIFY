import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { workspaceAccess } from "../middleware/workspaceAccess.middleware";
import { featureGate } from "../middleware/featureGate.middleware";
import { usageService } from "../services/analytics/usage.service";
import { memoryService } from "../services/ai/memory.service";
import { embeddingService } from "../services/ai/embedding.service";
import { vectorMemoryService } from "../services/ai/vectorMemory.service";
import { autonomousAgent } from "../services/ai/agents/autonomous.agent";
import { aiQueue } from "../queues/aiQueue";

const router = Router();

router.post(
  "/",
  authMiddleware,
  workspaceAccess,
  featureGate([
    "FREE",
    "PRO",
    "ENTERPRISE",
  ]),

  async (req, res) => {

    try {

      const {
        message,
        workspace_id,
      } = req.body;

      if (!message) {

        return res.status(400).json({
          message:
            "Message is required",
        });

      }


      // AUTONOMOUS AGENT


      const start = Date.now();

      const agentResult =
        await autonomousAgent.run(
          message,
          (req as any).userId
        );

      const reply =
        agentResult.response;

      const latency =
        Date.now() - start;


      // USAGE LOGGING


      await usageService.logAIRequest({

        prompt: message,

        response: reply,

        model: "mesh",

        latency_ms: latency,

        tokens_used:
          reply.length,

        user_id:
          (req as any).userId,

        workspace_id,

      });


      // MEMORY STORAGE


      await memoryService.storeMemory(
        workspace_id,
        message
      );


      // VECTOR EMBEDDING
   

      const embedding =
        await embeddingService
          .generateEmbedding(
            message
          );

      await vectorMemoryService
        .addMemory(
          workspace_id || "",
          message,
          embedding
        );


      // RESPONSE
   

      res.json({

        reply,

        steps:
          agentResult.steps,

        latency_ms:
          latency,

      });

    } catch (err: any) {

      console.error(err);

      res.status(500).json({
        message: err.message,
      });

    }

  }
);


// AI QUEUE ROUTE


router.post(
  "/queue",
  authMiddleware,

  async (req, res) => {

    const job =
      await aiQueue.add(

        "generate-response",

        {
          message:
            req.body.message,

          userId:
            (req as any).userId,
        }

      );

    res.json({

      message:
        "AI job queued",

      jobId:
        job.id,

    });

  }
);

export default router;