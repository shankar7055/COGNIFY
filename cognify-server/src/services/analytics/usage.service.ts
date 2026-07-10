import { prisma } from "../../config/db";
import { calculateCost, estimateTokens } from "../../utils/cost";
import { logger } from "../../config/logger";

interface LogAIRequestInput {
  prompt: string;
  response: string;
  model: string;
  latency_ms: number;
  tokens_used?: number;
  user_id: string;
  workspace_id?: string;
  agent_type?: string;
}

export const usageService = {
  async logAIRequest(input: LogAIRequestInput) {
    const tokens =
      input.tokens_used ?? estimateTokens(input.prompt + input.response);

    const cost_usd = calculateCost(tokens, input.model);

    logger.info(
      `AI request logged: model=${input.model}, tokens=${tokens}, cost=$${cost_usd}`
    );

    return prisma.aIRequest.create({
      data: {
        prompt: input.prompt,
        response: input.response,
        model: input.model,
        latency_ms: input.latency_ms,
        tokens_used: tokens,
        cost_usd,
        agent_type: input.agent_type,
        user_id: input.user_id,
        workspace_id: input.workspace_id,
      },
    });
  },

  async getUserUsage(userId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return prisma.aIRequest.findMany({
      where: {
        user_id: userId,
        created_at: { gte: since },
      },
      orderBy: { created_at: "asc" },
    });
  },
};