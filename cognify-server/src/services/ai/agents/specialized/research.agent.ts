import { MeshProvider } from "../../providers/mesh.provider";

const groq = new MeshProvider();

export const researchAgent = {
  name: "ResearchAgent",
  description: "Expert researcher who summarizes, analyses and synthesizes information.",

  async run(
    input: string,
    context?: string
  ): Promise<string> {
    const systemPrompt = `You are an expert research analyst.
Your job is to:
- Synthesize information clearly and concisely
- Provide well-structured summaries with key takeaways
- Compare and contrast different perspectives
- Identify trends, patterns, and insights
- Cite reasoning and draw evidence-based conclusions
- Structure responses with headers, bullet points, and clear sections

${context ? `Workspace Context:\n${context}\n` : ""}`;

    const prompt = `${systemPrompt}\n\nResearch Request:\n${input}`;
    return groq.generateResponse(prompt);
  },
};
