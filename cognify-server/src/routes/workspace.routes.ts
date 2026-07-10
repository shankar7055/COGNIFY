import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createWorkspaceSchema } from "../services/workspace/workspace.schema";
import { workspaceService } from "../services/workspace/workspace.service";
import { prisma } from "../config/db";

const router = Router();

router.post(
    "/",
    authMiddleware,
    validate(createWorkspaceSchema),
    async(req, res) => {
        try {
            const userId = (req as any).userId;

            const workspace = await workspaceService.createworkspace(
                userId,
                req.body
            );

            res.status(201).json(workspace);
        } catch(err: any){
            res.status(500).json({
                message: err.message,
            });
        }
    }
);

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const workspaces = await workspaceService.getUserWorkspaces(
      userId
    );
    res.json(workspaces);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const workspaceId = req.params.id as string;
    const { name, description } = req.body;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        team_workspaces: {
          include: {
            team: {
              include: {
                members: true
              }
            }
          }
        }
      }
    }) as any;

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.user_id === userId;
    const isTeamAdmin = workspace.team_workspaces.some((tw: any) =>
      tw.team.members.some((m: any) => m.user_id === userId && m.role === "ADMIN")
    );

    if (!isOwner && !isTeamAdmin) {
      return res.status(403).json({ message: "Only workspace owner or team admins can update this workspace" });
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const workspaceId = req.params.id as string;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.user_id !== userId) {
      return res.status(403).json({ message: "Only the owner can delete this workspace" });
    }

    // Delete dependent records
    await prisma.teamWorkspace.deleteMany({ where: { workspace_id: workspaceId } });
    await prisma.workflowRun.deleteMany({ where: { workflow: { workspace_id: workspaceId } } });
    await prisma.workflow.deleteMany({ where: { workspace_id: workspaceId } });
    await prisma.comment.deleteMany({ where: { workspace_id: workspaceId } });
    await prisma.file.deleteMany({ where: { workspace_id: workspaceId } });
    await prisma.embedding.deleteMany({ where: { workspace_id: workspaceId } });
    await prisma.message.deleteMany({ where: { workspace_id: workspaceId } });
    await prisma.promptVersion.deleteMany({ where: { workspace_id: workspaceId } });
    await prisma.aIRequest.deleteMany({ where: { workspace_id: workspaceId } });

    await prisma.workspace.delete({ where: { id: workspaceId } });
    res.json({ message: "Workspace deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;