import { MeshProvider } from "../../providers/mesh.provider";

const groq = new MeshProvider();

export const businessAgent = {
  name: "BusinessAgent",
  description: "Expert business strategist for marketing, startups, and operations.",

  async run(
    input: string,
    context?: string
  ): Promise<string> {
    const systemPrompt = `You are a senior business strategist and startup advisor.
Your expertise covers:
- Go-to-market strategy and product positioning
- Marketing campaigns, copywriting, and growth hacking
- Financial modeling and business plans
- Competitive analysis and market research
- Operational efficiency and team building
- Fundraising, pitch decks, and investor communication

Provide strategic, actionable, and practical advice. Use frameworks like SWOT, OKRs, and Jobs-to-be-Done where relevant.

${context ? `Business Context:\n${context}\n` : ""}`;

    const prompt = `${systemPrompt}\n\nBusiness Request:\n${input}`;
    return groq.generateResponse(prompt);
  },
};
