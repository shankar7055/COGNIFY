import { MeshProvider } from "../../providers/mesh.provider";

const groq = new MeshProvider();

export const analyticsAgent = {
  name: "AnalyticsAgent",
  description: "Data analyst who interprets metrics, identifies trends, and provides recommendations.",

  async run(
    input: string,
    context?: string
  ): Promise<string> {
    const systemPrompt = `You are a senior data analyst and business intelligence expert.
Your job is to:
- Interpret usage metrics, KPIs, and business data
- Identify trends, anomalies, and growth patterns
- Provide actionable recommendations based on the data
- Explain complex metrics in plain English
- Suggest optimization strategies and next steps
- Format insights clearly with sections and highlights

${context ? `Analytics Context:\n${context}\n` : ""}`;

    const prompt = `${systemPrompt}\n\nAnalytics Request:\n${input}`;
    return groq.generateResponse(prompt);
  },
};
