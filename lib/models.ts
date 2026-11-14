import { ModelInfo } from '@/types';

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Flagship high-intelligence multimodal model for complex reasoning and tasks.',
    contextLength: 128000,
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    color: 'from-emerald-500 to-teal-700',
    isPopular: true,
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    description: 'Fast, highly capable, cost-efficient model for everyday chat and code.',
    contextLength: 128000,
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    color: 'from-green-500 to-emerald-700',
    isPopular: true,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Industry-leading benchmark scores in coding, nuanced logic, and creative prose.',
    contextLength: 200000,
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    color: 'from-amber-500 to-orange-700',
    isPopular: true,
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    description: 'Blazing fast intelligence with near-instant responsiveness.',
    contextLength: 200000,
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.00,
    color: 'from-amber-400 to-rose-600',
    isPopular: false,
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    provider: 'Google',
    description: 'Next-gen multimodal performance with lightning speed and free tier access.',
    contextLength: 1048576,
    inputCostPer1M: 0.00,
    outputCostPer1M: 0.00,
    color: 'from-blue-500 to-indigo-600',
    isPopular: true,
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    description: 'High-throughput 1M token context window for large documents and data.',
    contextLength: 1000000,
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    color: 'from-cyan-500 to-blue-700',
    isPopular: false,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    description: 'State-of-the-art open weights model rivaling commercial proprietary giants.',
    contextLength: 128000,
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    color: 'from-sky-500 to-indigo-700',
    isPopular: true,
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'Exceptional math, coding, and multilingual reasoning at ultra-low price.',
    contextLength: 64000,
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    color: 'from-blue-600 to-cyan-700',
    isPopular: true,
  },
  {
    id: 'mistralai/mistral-large-2407',
    name: 'Mistral Large 2',
    provider: 'Mistral',
    description: 'Top-tier European multilingual model specializing in reasoning and precision.',
    contextLength: 128000,
    inputCostPer1M: 2.00,
    outputCostPer1M: 6.00,
    color: 'from-orange-500 to-red-600',
    isPopular: false,
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    provider: 'Other',
    description: 'Massive open weights powerhouse with superior code and mathematics capabilities.',
    contextLength: 128000,
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    color: 'from-purple-500 to-violet-700',
    isPopular: false,
  }
];

export const DEFAULT_SELECTED_MODEL_IDS = [
  'openai/gpt-4o-mini',
  'anthropic/claude-3.5-sonnet',
  'meta-llama/llama-3.3-70b-instruct'
];

export function getModelInfo(modelId: string): ModelInfo {
  const found = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (found) return found;

  // Fallback for custom model IDs
  const parts = modelId.split('/');
  const name = parts[1] || modelId;
  const provider = parts[0]?.toLowerCase().includes('anthropic') ? 'Anthropic'
    : parts[0]?.toLowerCase().includes('openai') ? 'OpenAI'
    : parts[0]?.toLowerCase().includes('google') ? 'Google'
    : parts[0]?.toLowerCase().includes('meta') ? 'Meta'
    : 'Other';

  return {
    id: modelId,
    name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    provider,
    description: `OpenRouter model ${modelId}`,
    contextLength: 128000,
    inputCostPer1M: 0.50,
    outputCostPer1M: 1.50,
    color: 'from-purple-500 to-indigo-600',
  };
}

export function calculateCost(modelId: string, promptTokens: number, completionTokens: number): number {
  const model = getModelInfo(modelId);
  const inputCost = (promptTokens / 1_000_000) * model.inputCostPer1M;
  const outputCost = (completionTokens / 1_000_000) * model.outputCostPer1M;
  return Number((inputCost + outputCost).toFixed(6));
}
