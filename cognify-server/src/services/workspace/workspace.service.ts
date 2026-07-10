import { prisma } from "../../config/db";
import { CreateWorkspaceInput } from "./workspace.schema";

function mapWorkspace(w: any) {
  const uniqueUserIds = new Set();
  if (w.user_id) uniqueUserIds.add(w.user_id);
  w.team_workspaces?.forEach((tw: any) => {
    tw.team?.members?.forEach((m: any) => {
      if (m.user_id) uniqueUserIds.add(m.user_id);
    });
  });

  return {
    ...w,
    membersCount: uniqueUserIds.size,
    filesCount: w._count?.files || 0,
    activeAgentsCount: w._count?.workflows || 0,
  };
}

export const workspaceService = {
  async createworkspace(userId: string, data: CreateWorkspaceInput) {
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
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
        team_workspaces: {
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
              },
            },
          },
        },
        _count: {
          select: {
            files: true,
            workflows: true,
          }
        }
      },
    });
    return mapWorkspace(workspace);
  },

  async getUserWorkspaces(userId: string) {
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { user_id: userId },
          {
            team_workspaces: {
              some: {
                team: {
                  members: {
                    some: {
                      user_id: userId,
                    },
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team_workspaces: {
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
              },
            },
          },
        },
        _count: {
          select: {
            files: true,
            workflows: true,
          }
        }
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return workspaces.map(mapWorkspace);
  },
};
