import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { aggregatorService } from "../services/analytics/aggregator.service";

const router = Router();

/** GET /api/analytics/overview — total requests, tokens, cost, latency */
router.get("/overview", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data   = await aggregatorService.getOverview(userId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** GET /api/analytics/trends?days=30 — daily usage trend */
router.get("/trends", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const days   = Number(req.query.days) || 30;
    const data   = await aggregatorService.getDailyTrends(userId, days);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** GET /api/analytics/agents — breakdown by agent type */
router.get("/agents", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data   = await aggregatorService.getAgentBreakdown(userId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;