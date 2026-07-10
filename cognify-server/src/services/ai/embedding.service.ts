import OpenAI from "openai";
import { env } from "../../config/env";
import { logger } from "../../config/logger";

// Fallback: character-code embedding when no OpenAI key is set
function charCodeEmbedding(text: string): number[] {
  return text.split("").map((c) => c.charCodeAt(0) / 255);
}

const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

export const embeddingService = {
  async generateEmbedding(text: string): Promise<number[]> {
    if (!openai) {
      logger.warn("No OPENAI_API_KEY — using fallback char-code embedding");
      return charCodeEmbedding(text);
    }

    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text.slice(0, 8000), // ada-002 limit
      });

      return response.data[0].embedding;
    } catch (err) {
      logger.error("OpenAI embedding failed, using fallback", { err });
      return charCodeEmbedding(text);
    }
  },

  /** Cosine similarity between two vectors */
  cosineSimilarity(a: number[], b: number[]): number {
    const len = Math.min(a.length, b.length);
    let dot = 0, magA = 0, magB = 0;

    for (let i = 0; i < len; i++) {
      dot  += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }

    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
  },
};