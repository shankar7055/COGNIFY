import { prisma } from "../../config/db";
import { embeddingService } from "./embedding.service";
import { logger } from "../../config/logger";

export const vectorMemoryService = {
  /** Add a new memory vector to the DB */
  async addMemory(
    workspaceId: string,
    content: string,
    vector?: number[]
  ) {
    const embedding =
      vector ?? (await embeddingService.generateEmbedding(content));

    return prisma.embedding.create({
      data: {
        content,
        vector: embedding as any,
        workspace_id: workspaceId,
      },
    });
  },

  /** Search for the top-k most similar memories in a workspace */
  async similarSearch(
    workspaceId: string,
    query: string,
    topK = 5
  ): Promise<{ content: string; score: number }[]> {
    const queryVector =
      await embeddingService.generateEmbedding(query);

    const memories = await prisma.embedding.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: "desc" },
      take: 200, // cap to avoid huge loads
    });

    const scored = memories
      .map((m) => ({
        content: m.content,
        score: embeddingService.cosineSimilarity(
          queryVector,
          m.vector as number[]
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    logger.info(
      `Vector search in workspace ${workspaceId}: top score = ${scored[0]?.score.toFixed(4)}`
    );

    return scored;
  },

  /** Build a context string from top-k memories for prompt injection */
  async buildContext(workspaceId: string, query: string): Promise<string> {
    if (!workspaceId) return "";

    const memories = await this.similarSearch(workspaceId, query, 5);
    if (!memories.length) return "";

    const relevant = memories.filter((m) => m.score > 0.6);
    if (!relevant.length) return "";

    return (
      "Relevant context from workspace memory:\n" +
      relevant.map((m) => `- ${m.content}`).join("\n")
    );
  },
};