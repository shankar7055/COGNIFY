export const faqs = [
  {
    question: "What exactly is an AI agent in Cognify?",
    answer:
      "An agent is a Claude-powered assistant with a custom system prompt, a configured model, tool access, and memory from your knowledge base. Cognify ships with five built-in agents (Code, Research, Business, Analytics, General) and lets you create unlimited custom ones.",
  },
  {
    question: "How does RAG memory work?",
    answer:
      "When you upload a file, Cognify automatically parses it, splits it into semantic chunks, generates vector embeddings, and stores them in your workspace's vector database. On every chat query, the most relevant chunks are retrieved and injected into the agent's context window automatically.",
  },
  {
    question: "Can I use Cognify via API from my own backend?",
    answer:
      "Yes. Generate an API key from the Developer Tools section and use it to call Cognify's agent execution endpoints from any external script, CLI tool, or backend service. Rate limits apply per key.",
  },
  {
    question: "Can I run workflows automatically on a schedule?",
    answer:
      "Yes — workflows support manual, scheduled (cron), and event-based triggers. Each workflow step can invoke an agent, send an email, call a webhook, or evaluate a conditional branch.",
  },
  {
    question: "What models does Cognify support?",
    answer:
      "Cognify currently runs on Anthropic's Claude family (claude-sonnet-4, claude-opus-4) and is model-agnostic by design. Additional providers will be added based on demand.",
  },
  {
    question: "Is my data used to train AI models?",
    answer:
      "No. Files you upload and conversations you have in Cognify are never used to train any model. Your workspace data is private to your account and isolated per workspace.",
  },
];
