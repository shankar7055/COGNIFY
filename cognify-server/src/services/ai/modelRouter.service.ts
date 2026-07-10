import { MeshProvider }
from "./providers/mesh.provider";

const gemini =
  new MeshProvider();

export const modelRouter = {

  async route(
    prompt: string
  ): Promise<string> {

    const lower =
      prompt.toLowerCase();

    // coding tasks
    if (
      lower.includes("code") ||
      lower.includes("bug") ||
      lower.includes("function")
    ) {

      return gemini.generateResponse(
        `[CODE MODE]\n${prompt}`
      );
    }

    // business tasks
    if (
      lower.includes("business") ||
      lower.includes("marketing") ||
      lower.includes("startup")
    ) {

      return gemini.generateResponse(
        `[BUSINESS MODE]\n${prompt}`
      );
    }

    // default
    return gemini.generateResponse(
      prompt
    );
  },
};