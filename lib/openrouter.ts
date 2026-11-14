import { ModelResponse } from '@/types';
import { getModelInfo, calculateCost } from '@/lib/models';

interface CallModelParams {
  modelId: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  apiKey?: string;
}

export async function callSingleModel({
  modelId,
  messages,
  apiKey = process.env.OPENROUTER_API_KEY,
}: CallModelParams): Promise<ModelResponse> {
  const modelInfo = getModelInfo(modelId);
  const responseId = `resp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const startTime = performance.now();

  // If no API key is provided, provide a graceful demo simulation
  if (!apiKey || apiKey === 'your_openrouter_api_key_here' || apiKey.trim() === '') {
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);
    const mockContent = `[Demo Mode / API Key Required]\n\nThis is a simulated response for **${modelInfo.name}** (${modelInfo.provider}).\n\nTo receive real live responses from OpenRouter, add your API key in \`.env.local\`:\n\`\`\`bash\nOPENROUTER_API_KEY=sk-or-v1-...\n\`\`\`\n\nPrompt received: "${messages[messages.length - 1]?.content.slice(0, 80)}..."`;
    const promptTokens = Math.round((messages[messages.length - 1]?.content.length || 20) / 4);
    const completionTokens = Math.round(mockContent.length / 4);
    const totalTokens = promptTokens + completionTokens;
    const costUsd = calculateCost(modelId, promptTokens, completionTokens);

    return {
      id: responseId,
      modelId,
      modelName: modelInfo.name,
      content: mockContent,
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      costUsd,
      status: 'success',
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'LLM Arena & Multi-Model Judge';

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': appName,
      },
      body: JSON.stringify({
        model: modelId,
        messages,
      }),
    });

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    if (!res.ok) {
      const errorText = await res.text();
      let parsedMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        parsedMessage = errorJson.error?.message || errorJson.message || errorText;
      } catch {
        // use raw errorText
      }

      return {
        id: responseId,
        modelId,
        modelName: modelInfo.name,
        content: '',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        latencyMs,
        costUsd: 0,
        status: 'error',
        errorMessage: `OpenRouter Error (${res.status}): ${parsedMessage}`,
        createdAt: new Date().toISOString(),
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || 'No response content returned.';
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    const totalTokens = data.usage?.total_tokens || (promptTokens + completionTokens);
    const costUsd =
      typeof data.usage?.cost === 'number'
        ? Number(data.usage.cost.toFixed(6))
        : calculateCost(modelId, promptTokens, completionTokens);

    return {
      id: responseId,
      modelId,
      modelName: modelInfo.name,
      content,
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      costUsd,
      status: 'success',
      createdAt: new Date().toISOString(),
    };
  } catch (err: any) {
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    return {
      id: responseId,
      modelId,
      modelName: modelInfo.name,
      content: '',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs,
      costUsd: 0,
      status: 'error',
      errorMessage: err.message || 'Network request to OpenRouter failed',
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Runs all selected models concurrently
 */
export async function callMultipleModels(
  modelIds: string[],
  userPrompt: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ModelResponse[]> {
  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    {
      role: 'system',
      content: 'You are an intelligent, articulate, and accurate AI assistant. Deliver clear, high-quality answers with thoughtful reasoning.',
    },
    ...history,
    {
      role: 'user',
      content: userPrompt,
    },
  ];

  const promises = modelIds.map((modelId) =>
    callSingleModel({
      modelId,
      messages,
    })
  );

  const results = await Promise.allSettled(promises);

  return results.map((res, index) => {
    if (res.status === 'fulfilled') {
      return res.value;
    }
    const modelInfo = getModelInfo(modelIds[index]);
    return {
      id: `err-${Date.now()}-${index}`,
      modelId: modelIds[index],
      modelName: modelInfo.name,
      content: '',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs: 0,
      costUsd: 0,
      status: 'error',
      errorMessage: res.reason?.message || 'Execution rejected',
      createdAt: new Date().toISOString(),
    };
  });
}
