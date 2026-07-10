import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
);

export const claudeService = {
  async generateResponse(message: string) {
    return `Mock AI response for: ${message}`;
  },
};