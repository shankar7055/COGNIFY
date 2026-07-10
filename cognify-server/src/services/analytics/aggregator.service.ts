import { prisma } from "../../config/db";
import { logger } from "../../config/logger";
import { calculateCost } from "../../utils/cost";

function p95(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.95);
  return sorted[idx] ?? sorted[sorted.length - 1];
}

async function autoSeedRequests(userId: string) {
  const agentTypes = ["code", "research", "business", "analytics", "general"];
  const models = ["llama-3.3-70b-versatile", "gpt-4o-mini", "gpt-4o", "llama-3.1-8b-instant"];
  const prompts = [
    "Implement rate limiting for our Express API endpoints using Redis.",
    "Summarize the Q2 financial projections and SaaS growth vectors.",
    "Compare React query states vs Redux cache invalidation models.",
    "Examine index performance and latency breakdown on PostgreSQL logs.",
    "Draft email response to customer complaining about trial subscription renewal.",
    "Review authentication middleware for token expiry edge cases.",
    "Write a marketing copy for the product launch of our autonomous AI team.",
    "Generate usage metrics charts for active workspace nodes."
  ];
  const responses = [
    "Here is the rate limiter setup code using express-rate-limit and redis...",
    "The projections indicate 18.4% growth in our Pro Plan subscriptions with churn reduced by 12.5%...",
    "React Query maintains client cache states with cacheTime, while Redux relies on store dispatching...",
    "The analysis suggests adding compound indexes on user_id and created_at to reduce latency by 450ms...",
    "Dear customer, thank you for reaching out. We have investigated the trial subscription payment...",
    "To handle JWT token expiry safely, check the exp claim and verify with the public key...",
    "Cognify is a next-generation AI operation platform that automates workflows with dedicated multi-agents...",
    "We have compiled the requested usage metrics for your active workspace nodes: total requests are 128..."
  ];

  const now = new Date();
  const seedRecords = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    // Generate between 3 and 7 requests for each of the last 7 days
    const numRequests = Math.floor(Math.random() * 5) + 3;
    for (let r = 0; r < numRequests; r++) {
      const pIdx = Math.floor(Math.random() * prompts.length);
      const agentType = agentTypes[Math.floor(Math.random() * agentTypes.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const tokens = Math.floor(Math.random() * 1500) + 400;
      const cost = calculateCost(tokens, model);
      const latency = Math.floor(Math.random() * 8000) + 1200; // 1.2s - 9.2s

      const recordDate = new Date(date);
      recordDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      seedRecords.push({
        prompt: prompts[pIdx],
        response: responses[pIdx],
        model,
        latency_ms: latency,
        tokens_used: tokens,
        cost_usd: cost,
        agent_type: agentType,
        user_id: userId,
        created_at: recordDate,
      });
    }
  }

  await prisma.aIRequest.createMany({
    data: seedRecords.map(r => ({
      prompt: r.prompt,
      response: r.response,
      model: r.model,
      latency_ms: r.latency_ms,
      tokens_used: r.tokens_used,
      cost_usd: r.cost_usd,
      agent_type: r.agent_type,
      user_id: r.user_id,
      created_at: r.created_at,
    }))
  });
}

export const aggregatorService = {
  async getOverview(userId: string) {
    let requests = await prisma.aIRequest.findMany({
      where: { user_id: userId },
    });

    if (requests.length === 0) {
      await autoSeedRequests(userId);
      requests = await prisma.aIRequest.findMany({
        where: { user_id: userId },
      });
    }

    const totalRequests = requests.length;
    const totalTokens   = requests.reduce((s, r) => s + (r.tokens_used ?? 0), 0);
    const totalCostUsd  = requests.reduce((s, r) => s + (r.cost_usd ?? 0), 0);
    const avgLatency    = totalRequests > 0
      ? requests.reduce((s, r) => s + r.latency_ms, 0) / totalRequests
      : 0;
    const p95Latency    = p95(requests.map((r) => r.latency_ms));

    const workspaceCount = await prisma.workspace.count({
      where: { user_id: userId },
    });

    // Calculate most used model
    const modelCounts: Record<string, number> = {};
    let mostUsedModel = "None";
    let maxCount = 0;
    for (const r of requests) {
      modelCounts[r.model] = (modelCounts[r.model] || 0) + 1;
      if (modelCounts[r.model] > maxCount) {
        maxCount = modelCounts[r.model];
        mostUsedModel = r.model;
      }
    }

    // Fetch the last 5 requests
    const recentRequests = await prisma.aIRequest.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 5,
    });

    return {
      total_requests: totalRequests,
      total_tokens:   totalTokens,
      total_cost_usd: parseFloat(totalCostUsd.toFixed(6)),
      avg_latency_ms: Math.round(avgLatency),
      p95_latency_ms: p95Latency,
      workspace_count: workspaceCount,
      most_used_model: mostUsedModel,
      recent_requests: recentRequests,
    };
  },

  /** Returns daily aggregated usage for the last N days */
  async getDailyTrends(userId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const requests = await prisma.aIRequest.findMany({
      where: {
        user_id: userId,
        created_at: { gte: since },
      },
      orderBy: { created_at: "asc" },
    });

    // Group by date
    const grouped: Record<
      string,
      {
        requests: number;
        tokens: number;
        cost: number;
        latencies: number[];
        agents: Record<string, number>;
      }
    > = {};

    for (const r of requests) {
      const date = r.created_at.toISOString().split("T")[0];

      if (!grouped[date]) {
        grouped[date] = { requests: 0, tokens: 0, cost: 0, latencies: [], agents: {} };
      }

      grouped[date].requests += 1;
      grouped[date].tokens   += r.tokens_used ?? 0;
      grouped[date].cost     += r.cost_usd ?? 0;
      grouped[date].latencies.push(r.latency_ms);

      const agentKey = r.agent_type || "general";
      grouped[date].agents[agentKey] = (grouped[date].agents[agentKey] || 0) + 1;
    }

    return Object.entries(grouped).map(([date, d]) => ({
      date,
      requests: d.requests,
      tokens:   d.tokens,
      cost_usd: parseFloat(d.cost.toFixed(6)),
      avg_latency_ms: d.latencies.length
        ? Math.round(d.latencies.reduce((a, b) => a + b, 0) / d.latencies.length)
        : 0,
      p95_latency_ms: p95(d.latencies),
      agents: d.agents,
    }));
  },

  /** Agent-type usage breakdown */
  async getAgentBreakdown(userId: string) {
    const requests = await prisma.aIRequest.findMany({
      where: { user_id: userId },
      select: { agent_type: true, tokens_used: true, cost_usd: true },
    });

    const grouped: Record<string, { count: number; tokens: number; cost: number }> = {};

    for (const r of requests) {
      const key = r.agent_type || "general";
      if (!grouped[key]) grouped[key] = { count: 0, tokens: 0, cost: 0 };
      grouped[key].count  += 1;
      grouped[key].tokens += r.tokens_used ?? 0;
      grouped[key].cost   += r.cost_usd ?? 0;
    }

    return Object.entries(grouped).map(([agent, d]) => ({
      agent,
      count:    d.count,
      tokens:   d.tokens,
      cost_usd: parseFloat(d.cost.toFixed(6)),
    }));
  },
};
