import Groq from "groq-sdk";

import { AIProvider }
from "./base.providers";

import { env }
from "../../../config/env";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export class GroqProvider
implements AIProvider {

  async generateResponse(
    prompt: string
  ): Promise<string> {

    const completion =
      await groq.chat.completions.create({

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        model:
          "llama-3.3-70b-versatile",

      });

    return (
      completion.choices[0]
        ?.message?.content || ""
    );
  }
}