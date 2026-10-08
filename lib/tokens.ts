// A simple approximation for token count, as true tokenization (like tiktoken) 
// requires heavier dependencies. Usually, 1 token is roughly 4 chars in English text.
export function estimateTokens(text: string): number {
  return Math.ceil((text.length || 0) / 4);
}

export function calculateSavings(rawTokens: number, mdTokens: number) {
  if (rawTokens === 0) return "0%";
  const savings = ((rawTokens - mdTokens) / rawTokens) * 100;
  return `${savings.toFixed(2)}%`;
}

// Cost calculation based on Claude 3.5 Sonnet / GPT-4o approx ($3 / 1M input tokens)
export function estimateCostSavings(rawTokens: number, mdTokens: number): string {
  const savedTokens = rawTokens - mdTokens;
  if (savedTokens <= 0) return "$0.0000";
  const savingsUsd = (savedTokens / 1_000_000) * 3.0; // $3 per 1M tokens
  return `$${savingsUsd.toFixed(4)}`;
}
