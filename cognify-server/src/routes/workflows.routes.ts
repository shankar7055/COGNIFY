import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { workspaceAccess, hasWorkspaceAccess } from "../middleware/workspaceAccess.middleware";
import { prisma } from "../config/db";
import { triggerEngine } from "../services/automation/triggerEngine.service";

const router = Router();

/** GET /api/workflows/:workspaceId — List all workflows in a workspace */
router.get(
  "/:workspaceId",
  authMiddleware,
  workspaceAccess,
  async (req, res) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const workflows = await prisma.workflow.findMany({
        where: { workspace_id: workspaceId },
        orderBy: { created_at: "desc" },
      });
      res.json(workflows);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** POST /api/workflows/:workspaceId — Create a new workflow in a workspace */
router.post(
  "/:workspaceId",
  authMiddleware,
  workspaceAccess,
  async (req, res) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const userId = (req as any).userId;
      const { name, description, definition } = req.body;

      if (!name) return res.status(400).json({ message: "Workflow name is required" });

      const workflow = await prisma.workflow.create({
        data: {
          name,
          description,
          definition: definition || { nodes: [], edges: [] },
          workspace_id: workspaceId,
          user_id: userId,
        },
      });

      res.status(201).json(workflow);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** PUT /api/workflows/:id — Update a workflow definition or status */
router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id as string;
      const userId = (req as any).userId;
      const { name, description, isActive, definition } = req.body;

      // Find the workflow to check permissions
      const workflow = await prisma.workflow.findUnique({
        where: { id },
      });
      if (!workflow) return res.status(404).json({ message: "Workflow not found" });

      const hasAccess = await hasWorkspaceAccess(workflow.workspace_id, userId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this workspace" });
      }

      const updatedWorkflow = await prisma.workflow.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          description: description !== undefined ? description : undefined,
          isActive: isActive !== undefined ? isActive : undefined,
          definition: definition !== undefined ? definition : undefined,
        },
      });

      res.json(updatedWorkflow);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** DELETE /api/workflows/:id — Delete a workflow */
router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id as string;
      const userId = (req as any).userId;

      const workflow = await prisma.workflow.findUnique({
        where: { id },
      });
      if (!workflow) return res.status(404).json({ message: "Workflow not found" });

      const hasAccess = await hasWorkspaceAccess(workflow.workspace_id, userId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this workspace" });
      }

      // Delete runs first
      await prisma.workflowRun.deleteMany({
        where: { workflow_id: id },
      });

      await prisma.workflow.delete({
        where: { id },
      });

      res.json({ message: "Workflow deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** POST /api/workflows/:id/trigger — Manually trigger a workflow run */
router.post(
  "/:id/trigger",
  authMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id as string;
      const userId = (req as any).userId;

      const workflow = await prisma.workflow.findUnique({
        where: { id },
      });
      if (!workflow) return res.status(404).json({ message: "Workflow not found" });

      const hasAccess = await hasWorkspaceAccess(workflow.workspace_id, userId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this workspace" });
      }

      const run = await triggerEngine.triggerWorkflow(id, "MANUAL", req.body.inputVariables);

      res.json({ message: "Workflow triggered successfully", runId: run.id });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** GET /api/workflows/:id/runs — Fetch execution runs history for a workflow */
router.get(
  "/:id/runs",
  authMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id as string;
      const userId = (req as any).userId;

      const workflow = await prisma.workflow.findUnique({
        where: { id },
      });
      if (!workflow) return res.status(404).json({ message: "Workflow not found" });

      const hasAccess = await hasWorkspaceAccess(workflow.workspace_id, userId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this workspace" });
      }

      const runs = await prisma.workflowRun.findMany({
        where: { workflow_id: id },
        orderBy: { created_at: "desc" },
        take: 50,
      });

      res.json(runs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** POST /api/workflows/webhook/:id — External webhook endpoint to trigger workflow */
router.post(
  "/webhook/:id",
  async (req, res) => {
    try {
      const id = req.params.id as string;
      const workflow = await prisma.workflow.findUnique({
        where: { id },
      });

      if (!workflow) return res.status(404).json({ message: "Workflow not found" });
      if (!workflow.isActive) return res.status(400).json({ message: "Workflow is inactive" });

      const run = await triggerEngine.triggerWorkflow(id, "WEBHOOK", {
        webhookPayload: req.body,
        headers: req.headers,
      });

      res.json({ message: "Webhook received and workflow queued", runId: run.id });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
