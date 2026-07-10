import { MeshProvider } from "../../providers/mesh.provider";

const groq = new MeshProvider();

export const codeAgent = {
  name: "CodeAgent",
  description: "Expert in writing, debugging, reviewing, and explaining code.",

  async run(
    input: string,
    context?: string
  ): Promise<string> {
    const systemPrompt = `You are an expert software engineer and code assistant.
Your job is to:
- Write clean, well-commented code
- Debug issues and explain the root cause clearly
- Review code for bugs, performance, and security issues
- Suggest refactoring improvements
- Always provide working, production-ready code snippets

${context ? `Workspace Context:\n${context}\n` : ""}`;

    const prompt = `${systemPrompt}\n\nUser Request:\n${input}`;
    return groq.generateResponse(prompt);
  },
};