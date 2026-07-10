import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { logger } from "../config/logger";

/**
 * Helper to check if a user has access to a workspace (either as owner or through team sharing)
 */
export const hasWorkspaceAccess = async (
  workspaceId: string,
  userId: string
): Promise<boolean> => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      team_workspaces: {
        include: {
          team: {
            include: {
              members: {
                where: { user_id: userId },
              },
            },
          },
        },
      },
    },
  });

  if (!workspace) return false;

  // Access granted if user is the direct owner
  if (workspace.user_id === userId) return true;

  // Access granted if user belongs to any team with shared access
  return workspace.team_workspaces.some((tw) => tw.team.members.length > 0);
};

export const workspaceAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const workspaceId =
      (req.body.workspace_id as string) ||
      (req.query.workspace_id as string) ||
      (req.params.workspaceId as string) ||
      (req.params.workspace_id as string);

    // If no workspace ID is found in the request, skip permission validation
    if (!workspaceId) {
      return next();
    }

    const hasAccess = await hasWorkspaceAccess(workspaceId, userId);

    if (!hasAccess) {
      logger.warn(`User ${userId} denied access to workspace ${workspaceId}`);
      return res.status(403).json({ message: "Access denied to this workspace" });
    }

    next();
  } catch (err: any) {
    logger.error("Workspace access validation error", { error: err.message });
    return res.status(500).json({ message: "Internal server error during permission check" });
  }
};
