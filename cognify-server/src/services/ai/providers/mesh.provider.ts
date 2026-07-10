import OpenAI from "openai";
import { AIProvider } from "./base.providers";
import { env } from "../../../config/env";

const mesh = new OpenAI({
  apiKey: env.MESH_API_KEY,
  baseURL: "https://api.meshapi.ai/v1",
});

export class MeshProvider implements AIProvider {
  private model: string;

  constructor(model = "gpt-4o") {
    this.model = model;
  }

  async generateResponse(prompt: string): Promise<string> {
    const completion = await mesh.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: this.model,
    });

    return completion.choices[0]?.message?.content || "";
  }
}
