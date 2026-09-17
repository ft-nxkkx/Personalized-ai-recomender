export interface ModelCandidate {
  id: string;
  name: string;
  provider: string;
}

export interface BattleState {
  prompt: string;
  modelA: ModelCandidate;
  modelB: ModelCandidate;
  responseA: string;
  responseB: string;
  isRevealed: boolean;
  winner?: 'model_a' | 'model_b' | 'tie' | 'both_bad';
}

export const AVAILABLE_MODELS: ModelCandidate[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta' },
];

/**
 * Anonymization Engine:
 * Randomly picks two distinct models and masks their names
 * so the evaluator cannot see provider branding.
 */
export function initializeBlindBattle(): { modelA: ModelCandidate; modelB: ModelCandidate } {
  const shuffled = [...AVAILABLE_MODELS].sort(() => 0.5 - Math.random());
  return {
    modelA: shuffled[0],
    modelB: shuffled[1],
  };
}

/**
 * Strips common self-identifying provider headers/signatures
 * to prevent blind-eval leakage.
 */
export function sanitizeOutput(rawText: string, modelName: string, provider: string): string {
  const pattern = new RegExp(`(as an ai language model|developed by ${provider}|i am ${modelName})`, 'gi');
  return rawText.replace(pattern, '[Identity Redacted]');
}