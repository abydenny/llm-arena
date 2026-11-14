export interface ModelInfo {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Meta' | 'Mistral' | 'DeepSeek' | 'Other';
  description: string;
  contextLength: number;
  inputCostPer1M: number;  // Cost in USD per 1M input tokens
  outputCostPer1M: number; // Cost in USD per 1M output tokens
  color: string;
  isPopular?: boolean;
}

export interface ModelResponse {
  id: string;
  modelId: string;
  modelName: string;
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  costUsd: number;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
  createdAt: string;
}

export interface ModelScoreCritique {
  score: number; // 1-100
  rank: number;
  strengths: string[];
  weaknesses: string[];
}

export interface JudgeEvaluation {
  id?: string;
  judgeModel: string;
  winningModelId: string;
  winningModelName: string;
  winningReason: string;
  scores: Record<string, ModelScoreCritique>;
  detailedCritique: string;
  comparisonSummary: string;
  createdAt: string;
}

export interface ChatTurn {
  id: string;
  conversationId: string;
  role: 'user';
  content: string;
  selectedModels: string[];
  responses: ModelResponse[];
  judgeEvaluation?: JudgeEvaluation | null;
  isEvaluatingJudge?: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface TelemetryMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  costUsd: number;
  tokensPerSecond: number;
}
