import { codeAgent } from "./codeAgent.service";
import { researchAgent } from "./researchAgent.service";
import { buisnessAgent } from "./businessAgent.service";

export const agentRouter = {
  async route(message: string) {
    const lower = message.toLowerCase();

    if (
      lower.includes("code") ||
      lower.includes("bug") ||
      lower.includes("function")
    ) {
      return codeAgent.execute(message);
    }

    if (
      lower.includes("research") ||
      lower.includes("study") ||
      lower.includes("analysis")
    ) {
      return researchAgent.execute(message);
    }

    return buisnessAgent.execute(message);
  },
};