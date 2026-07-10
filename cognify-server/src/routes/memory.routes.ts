import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { vectorMemoryService } from "../services/ai/vectorMemory.service";
import { memoryService } from "../services/ai/memory.service";

const router = Router();

/** GET /api/memory/:workspaceId — get recent memories */
router.get("/:workspaceId", authMiddleware, async (req, res) => {
  try {
    const memories = await memoryService.getWorkspaceMemories(
      req.params.workspaceId as string
    );
    res.json(memories);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** POST /api/memory/search — semantic search in workspace */
router.post("/search", authMiddleware, async (req, res) => {
  try {
    const { workspaceId, query, topK } = req.body;

    if (!workspaceId || !query) {
      return res.status(400).json({ message: "workspaceId and query are required" });
    }

    const results = await vectorMemoryService.similarSearch(
      workspaceId,
      query,
      topK ?? 5
    );

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;