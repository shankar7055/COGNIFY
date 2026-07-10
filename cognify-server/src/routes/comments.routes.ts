import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { workspaceAccess } from "../middleware/workspaceAccess.middleware";
import { prisma } from "../config/db";

const router = Router();

/** GET /api/comments/:workspaceId — Fetch comments for a workspace */
router.get(
  "/:workspaceId",
  authMiddleware,
  workspaceAccess,
  async (req, res) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const comments = await prisma.comment.findMany({
        where: { workspace_id: workspaceId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: "asc" },
      });
      res.json(comments);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** POST /api/comments/:workspaceId — Post a comment in a workspace */
router.post(
  "/:workspaceId",
  authMiddleware,
  workspaceAccess,
  async (req, res) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const { content } = req.body;
      const userId = (req as any).userId;

      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Comment content cannot be empty" });
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          workspace_id: workspaceId,
          user_id: userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json(comment);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
