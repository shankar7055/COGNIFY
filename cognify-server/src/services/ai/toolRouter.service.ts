import { toolRegistry }
from "./tools/toolRegistry";

export const toolRouter = {

  async handle(
    prompt: string,
    userId: string
  ) {

    const lower =
      prompt.toLowerCase();

    // tool detection

    if (
      lower.includes("workspace")
    ) {

      const tool =
        toolRegistry.get_workspaces;

      const result =
        await tool.execute({
          userId,
        });

      return {
        toolCalled: tool.name,
        result,
      };
    }

    return null;
  },
};