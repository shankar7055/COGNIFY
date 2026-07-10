import OpenAI from "openai";
import { env } from "../../config/env";
import { Response } from "express";
import { logger } from "../../config/logger";

const mesh = new OpenAI({
  apiKey: env.MESH_API_KEY,
  baseURL: "https://api.meshapi.ai/v1",
});

export const streamService = {
  /**
   * Streams response chunks via SSE to the HTTP response.
   * Caller must have set appropriate SSE headers before calling this.
   */
  async streamToSSE(
    prompt: string,
    res: Response,
    model = "gpt-4o"
  ): Promise<void> {
    try {
      const stream = await mesh.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";

        if (delta) {
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }

        if (chunk.choices[0]?.finish_reason === "stop") {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
          return;
        }
      }

      // Safety end
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: any) {
      logger.error("Stream error:", err);
      res.write(
        `data: ${JSON.stringify({ error: err.message })}\n\n`
      );
      res.end();
    }
  },

  /**
   * Streams response chunks via Socket.io events.
   */
  async streamToSocket(
    prompt: string,
    socketEmit: (event: string, data: unknown) => void,
    model = "gpt-4o"
  ): Promise<string> {
    const stream = await mesh.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model,
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (delta) {
        fullResponse += delta;
        socketEmit("ai:chunk", { delta });
      }
    }

    socketEmit("ai:done", { response: fullResponse });
    return fullResponse;
  },
};
