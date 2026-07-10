import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { prisma } from "../config/db";
import { TeamRole } from "@prisma/client";

const router = Router();

/** Helper to check if current user is ADMIN of the team */
async function checkTeamAdmin(userId: string, teamId: string): Promise<boolean> {
  const membership = await prisma.teamMember.findUnique({
    where: {
      user_id_team_id: {
        user_id: userId,
        team_id: teamId,
      },
    },
  });
  return membership?.role === "ADMIN";
}

/** Create a team */
router.post(
  "/create",
  authMiddleware,
  async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Team name is required" });

      const team = await prisma.team.create({
        data: {
          name,
          members: {
            create: {
              user_id: (req as any).userId,
              role: "ADMIN",
            },
          },
        },
        include: {
          members: true,
        },
      });

      res.status(201).json(team);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** List user's teams (including members and shared workspaces) */
router.get(
  "/my-teams",
  authMiddleware,
  async (req, res) => {
    try {
      const teams = await prisma.teamMember.findMany({
        where: {
          user_id: (req as any).userId,
        },
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
              team_workspaces: {
                include: {
                  workspace: true,
                },
              },
            },
          },
        },
      });
      res.json(teams);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** Get team members list */
router.get(
  "/:teamId/members",
  authMiddleware,
  async (req, res) => {
    try {
      const teamId = req.params.teamId as string;
      const members = await prisma.teamMember.findMany({
        where: { team_id: teamId },
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
      res.json(members);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** Invite (Add instantly) member to team by email */
router.post(
  "/:teamId/invite",
  authMiddleware,
  async (req, res) => {
    try {
      const teamId = req.params.teamId as string;
      const { email, role } = req.body;
      const userId = (req as any).userId;

      if (!email) return res.status(400).json({ message: "Email is required" });

      // Only team admins can invite members
      const isAdmin = await checkTeamAdmin(userId, teamId);
      if (!isAdmin) {
        return res.status(403).json({ message: "Only team admins can invite members" });
      }

      // Check if target user exists in DB
      const targetUser = await prisma.user.findUnique({
        where: { email },
      });
      if (!targetUser) {
        return res.status(404).json({ message: "User not found with this email" });
      }

      // Check if user is already in the team
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          user_id_team_id: {
            user_id: targetUser.id,
            team_id: teamId,
          },
        },
      });
      if (existingMember) {
        return res.status(400).json({ message: "User is already a member of this team" });
      }

      // Add to team
      const newMember = await prisma.teamMember.create({
        data: {
          team_id: teamId,
          user_id: targetUser.id,
          role: (role as TeamRole) || "VIEWER",
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

      res.status(201).json(newMember);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** Update a member's role in the team */
router.put(
  "/:teamId/members/:memberId/role",
  authMiddleware,
  async (req, res) => {
    try {
      const teamId = req.params.teamId as string;
      const memberId = req.params.memberId as string;
      const { role } = req.body;
      const userId = (req as any).userId;

      const isAdmin = await checkTeamAdmin(userId, teamId);
      if (!isAdmin) {
        return res.status(403).json({ message: "Only team admins can update roles" });
      }

      const updatedMember = await prisma.teamMember.update({
        where: { id: memberId },
        data: {
          role: role as TeamRole,
        },
      });

      res.json(updatedMember);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** Remove a member from the team */
router.delete(
  "/:teamId/members/:memberId",
  authMiddleware,
  async (req, res) => {
    try {
      const teamId = req.params.teamId as string;
      const memberId = req.params.memberId as string;
      const userId = (req as any).userId;

      const isAdmin = await checkTeamAdmin(userId, teamId);
      if (!isAdmin) {
        return res.status(403).json({ message: "Only team admins can remove members" });
      }

      await prisma.teamMember.delete({
        where: { id: memberId },
      });

      res.json({ message: "Member removed from team successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** Share a workspace with a team */
router.post(
  "/:teamId/workspaces/:workspaceId",
  authMiddleware,
  async (req, res) => {
    try {
      const teamId = req.params.teamId as string;
      const workspaceId = req.params.workspaceId as string;
      const userId = (req as any).userId;

      // Verify the user owns the workspace they are sharing
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
      });
      if (!workspace || workspace.user_id !== userId) {
        return res.status(403).json({ message: "You can only share workspaces you own" });
      }

      // Create TeamWorkspace connection
      const sharedWorkspace = await prisma.teamWorkspace.create({
        data: {
          team_id: teamId,
          workspace_id: workspaceId,
        },
      });

      res.status(201).json(sharedWorkspace);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

/** Unshare a workspace with a team */
router.delete(
  "/:teamId/workspaces/:workspaceId",
  authMiddleware,
  async (req, res) => {
    try {
      const teamId = req.params.teamId as string;
      const workspaceId = req.params.workspaceId as string;
      const userId = (req as any).userId;

      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
      });
      if (!workspace || workspace.user_id !== userId) {
        return res.status(403).json({ message: "You can only unshare workspaces you own" });
      }

      await prisma.teamWorkspace.delete({
        where: {
          team_id_workspace_id: {
            team_id: teamId,
            workspace_id: workspaceId,
          },
        },
      });

      res.json({ message: "Workspace unshared successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;