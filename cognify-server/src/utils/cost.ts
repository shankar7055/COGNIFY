/**
 * Calculates USD cost from token usage.
 * Prices per 1M tokens (as of 2024):
 *  - groq/llama-3.3-70b: ~$0.59 input / $0.79 output  (avg ~$0.69)
 *  - openai/gpt-4o:      ~$5.00 input / $15.00 output
 *  - anthropic/claude-3.5-sonnet: ~$3.00 / $15.00
 */

const PRICE_PER_1M: Record<string, number> = {
  "llama-3.3-70b-versatile": 0.69,
  "llama-3.1-8b-instant":    0.10,
  "gpt-4o":                  10.00,
  "gpt-4o-mini":              0.60,
  "claude-3-5-sonnet-20240620": 9.00,
  default:                   0.69,
};

export function calculateCost(
  tokens: number,
  model: string
): number {
  const pricePerMillion =
    PRICE_PER_1M[model] ?? PRICE_PER_1M["default"];

  return parseFloat(
    ((tokens / 1_000_000) * pricePerMillion).toFixed(8)
  );
}

/** Estimate tokens from character count (~4 chars per token) */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
