import { prisma }
from "../../../config/db";

import { Tool }
from "./tool.types";

export const getWorkspacesTool:
Tool = {

  name: "get_workspaces",

  description:
    "Get all workspaces for a user",

  async execute(input) {

    const userId = input.userId;

    const workspaces =
      await prisma.workspace.findMany({

        where: {
          user_id: userId,
        },

      });

    return workspaces;
  },
};