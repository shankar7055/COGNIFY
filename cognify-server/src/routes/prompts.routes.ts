import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { workspaceAccess } from "../middleware/workspaceAccess.middleware";
import { prisma } from "../config/db";
import { logger } from "../config/logger";

async function computeDiff(oldText: string, newText: string): Promise<string> {
  const diff = await import("diff");
  const patches = diff.createPatch("prompt", oldText, newText);
  return patches;
}

const router = Router();

/** GET /api/prompts/:workspaceId */
router.get("/:workspaceId", authMiddleware, workspaceAccess, async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId as string;

    const prompts = await prisma.promptVersion.findMany({
      where:   { workspace_id: workspaceId },
      orderBy: { version: "desc" },
      select:  { id: true, version: true, title: true, content: true, created_at: true },
    });

    res.json(prompts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** POST /api/prompts/:workspaceId */
router.post("/:workspaceId", authMiddleware, workspaceAccess, async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const userId      = (req as any).userId as string;
    const { title, content } = req.body;

    if (!title || !content)
      return res.status(400).json({ message: "title and content are required" });

    const latest = await prisma.promptVersion.findFirst({
      where:   { workspace_id: workspaceId },
      orderBy: { version: "desc" },
    });

    const nextVersion = (latest?.version ?? 0) + 1;
    const diff = latest ? await computeDiff(latest.content, content) : undefined;

    const prompt = await prisma.promptVersion.create({
      data: { version: nextVersion, title, content, diff, workspace_id: workspaceId, user_id: userId },
    });

    logger.info(`Prompt v${nextVersion} created in workspace ${workspaceId}`);
    res.status(201).json(prompt);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** GET /api/prompts/:workspaceId/diff/:versionA/:versionB */
router.get("/:workspaceId/diff/:versionA/:versionB", authMiddleware, workspaceAccess, async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const versionA    = Number(req.params.versionA);
    const versionB    = Number(req.params.versionB);

    const [pvA, pvB] = await Promise.all([
      prisma.promptVersion.findUnique({
        where: { workspace_id_version: { workspace_id: workspaceId, version: versionA } },
      }),
      prisma.promptVersion.findUnique({
        where: { workspace_id_version: { workspace_id: workspaceId, version: versionB } },
      }),
    ]);

    if (!pvA || !pvB)
      return res.status(404).json({ message: "One or both versions not found" });

    const diff = await computeDiff(pvA.content, pvB.content);
    res.json({ from: versionA, to: versionB, diff });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** POST /api/prompts/:workspaceId/rollback/:version */
router.post("/:workspaceId/rollback/:version", authMiddleware, workspaceAccess, async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const version     = Number(req.params.version);
    const userId      = (req as any).userId as string;

    const target = await prisma.promptVersion.findUnique({
      where: { workspace_id_version: { workspace_id: workspaceId, version } },
    });

    if (!target) return res.status(404).json({ message: "Version not found" });

    const latest = await prisma.promptVersion.findFirst({
      where:   { workspace_id: workspaceId },
      orderBy: { version: "desc" },
    });

    const nextVersion = (latest?.version ?? 0) + 1;
    const diff = latest ? await computeDiff(latest.content, target.content) : undefined;

    const rollback = await prisma.promptVersion.create({
      data: {
        version:      nextVersion,
        title:        `Rollback to v${version}: ${target.title}`,
        content:      target.content,
        diff,
        workspace_id: workspaceId,
        user_id:      userId,
      },
    });

    logger.info(`Rolled back to v${version} as new v${nextVersion}`);
    res.status(201).json(rollback);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
