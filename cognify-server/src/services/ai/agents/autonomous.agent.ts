import { toolRouter } from "../toolRouter.service";
import { modelRouter } from "../modelRouter.service";
import { vectorMemoryService } from "../vectorMemory.service";
import { codeAgent } from "./specialized/code.agent";
import { researchAgent } from "./specialized/research.agent";
import { businessAgent } from "./specialized/business.agent";
import { analyticsAgent } from "./specialized/analytics.agent";
import { logger } from "../../../config/logger";

type AgentType = "code" | "research" | "business" | "analytics" | "general";

function detectAgentType(input: string): AgentType {
  const lower = input.toLowerCase();

  if (
    lower.includes("code") ||
    lower.includes("bug") ||
    lower.includes("function") ||
    lower.includes("debug") ||
    lower.includes("implement") ||
    lower.includes("refactor") ||
    lower.includes("typescript") ||
    lower.includes("javascript") ||
    lower.includes("python") ||
    lower.includes("api") ||
    lower.includes("database")
  ) return "code";

  if (
    lower.includes("research") ||
    lower.includes("summarize") ||
    lower.includes("explain") ||
    lower.includes("what is") ||
    lower.includes("how does") ||
    lower.includes("compare") ||
    lower.includes("analyze")
  ) return "research";

  if (
    lower.includes("business") ||
    lower.includes("marketing") ||
    lower.includes("startup") ||
    lower.includes("strategy") ||
    lower.includes("revenue") ||
    lower.includes("customer") ||
    lower.includes("pitch") ||
    lower.includes("growth")
  ) return "business";

  if (
    lower.includes("analytics") ||
    lower.includes("metric") ||
    lower.includes("trend") ||
    lower.includes("data") ||
    lower.includes("report") ||
    lower.includes("insight") ||
    lower.includes("performance")
  ) return "analytics";

  return "general";
}

export const autonomousAgent = {
  async run(
    input: string,
    userId: string,
    workspaceId?: string
  ) {
    const steps: object[] = [];

    // STEP 1: Detect agent type
    const agentType = detectAgentType(input);
    steps.push({ thought: `Detected task type: ${agentType}` });

    // STEP 2: Build memory context from workspace
    let context = "";
    if (workspaceId) {
      try {
        context = await vectorMemoryService.buildContext(workspaceId, input);
        if (context) {
          steps.push({ thought: "Injecting relevant workspace memory into context" });
        }
      } catch (err) {
        logger.warn("Failed to build vector context", { err });
      }
    }

    // STEP 3: Check for tool usage
    const toolResult = await toolRouter.handle(input, userId);

    if (toolResult) {
      steps.push({
        thought: "Tool was required",
        action: toolResult.toolCalled,
        observation: toolResult.result,
      });

      const finalPrompt = `User Request:\n${input}\n\nTool Result:\n${JSON.stringify(toolResult.result, null, 2)}\n\n${context}\n\nGenerate a helpful response.`;
      const response = await modelRouter.route(finalPrompt);

      return { steps, response, agentType };
    }

    // STEP 4: Route to specialized agent
    let response: string;

    switch (agentType) {
      case "code":
        steps.push({ thought: "Routing to Code Agent" });
        response = await codeAgent.run(input, context);
        break;

      case "research":
        steps.push({ thought: "Routing to Research Agent" });
        response = await researchAgent.run(input, context);
        break;

      case "business":
        steps.push({ thought: "Routing to Business Agent" });
        response = await businessAgent.run(input, context);
        break;

      case "analytics":
        steps.push({ thought: "Routing to Analytics Agent" });
        response = await analyticsAgent.run(input, context);
        break;

      default:
        steps.push({ thought: "Routing to General Model Router" });
        response = await modelRouter.route(
          context ? `${context}\n\nUser: ${input}` : input
        );
    }

    return { steps, response, agentType };
  },
};