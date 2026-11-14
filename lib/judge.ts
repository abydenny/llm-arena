import { JudgeEvaluation, ModelResponse } from '@/types';
import { getModelInfo } from '@/lib/models';

export async function evaluateResponsesWithJudge(
  userPrompt: string,
  responses: ModelResponse[],
  judgeModelOverride?: string
): Promise<JudgeEvaluation | null> {
  // Only evaluate valid responses
  const successfulResponses = responses.filter(
    (r) => r.status === 'success' && r.content && r.content.trim().length > 0
  );

  if (successfulResponses.length === 0) {
    return null;
  }

  const judgeModel = judgeModelOverride || process.env.JUDGE_MODEL || 'openai/gpt-4o-mini';
  const apiKey = process.env.OPENROUTER_API_KEY;

  // Build evaluation payload
  const responsesText = successfulResponses
    .map(
      (r, i) =>
        `### Candidate Model ${i + 1}: ${r.modelName} (ID: ${r.modelId})\n` +
        `\`\`\`\n${r.content}\n\`\`\`\n`
    )
    .join('\n\n');

  const judgeSystemPrompt = `You are an impartial, highly rigorous expert AI Judge and Benchmark Evaluator.
Your goal is to evaluate, critique, score, and rank multiple LLM responses for a given user prompt.

Evaluation Criteria:
1. Accuracy & Correctness: Did the model answer correctly without hallucinations?
2. Comprehensiveness & Depth: Did it thoroughly address all aspects of the user query?
3. Clarity & Structure: Is the formatting (markdown, code blocks, bullet points) easy to read?
4. Conciseness & Precision: Avoided fluff while retaining substance.

Return ONLY a valid JSON object strictly matching this schema with no conversational fluff or markdown fence around it:
{
  "winningModelId": "<exact modelId of the winning model>",
  "winningModelName": "<name of the winning model>",
  "winningReason": "<A clear, comprehensive explanation of why this model provided the best response>",
  "comparisonSummary": "<A 2-3 sentence overview comparing how the models approached the query>",
  "scores": {
    "<modelId>": {
      "score": <integer from 1 to 100>,
      "rank": <integer rank, 1 being best>,
      "strengths": ["<strength 1>", "<strength 2>"],
      "weaknesses": ["<weakness 1>"]
    }
  },
  "detailedCritique": "<Deep dive analysis comparing each model against the prompt requirements>"
}`;

  const judgeUserPrompt = `[User Prompt]:\n${userPrompt}\n\n[Candidate LLM Responses]:\n${responsesText}\n\nPlease evaluate these responses and provide the verdict in JSON format.`;

  // If no API key or demo mode, provide simulated algorithmic evaluation
  if (!apiKey || apiKey === 'your_openrouter_api_key_here' || apiKey.trim() === '') {
    // Generate intelligent simulated critique
    const ranked = [...successfulResponses].sort((a, b) => {
      // rank by substance, tokens, latency balance
      const scoreA = a.completionTokens * 0.4 + (10000 / (a.latencyMs || 1000));
      const scoreB = b.completionTokens * 0.4 + (10000 / (b.latencyMs || 1000));
      return scoreB - scoreA;
    });

    const winner = ranked[0];
    const scores: JudgeEvaluation['scores'] = {};

    successfulResponses.forEach((r) => {
      const isWinner = r.modelId === winner.modelId;
      const rank = ranked.findIndex((x) => x.modelId === r.modelId) + 1;
      const baseScore = Math.min(98, Math.max(72, 95 - (rank - 1) * 6 + Math.floor(Math.random() * 4)));
      scores[r.modelId] = {
        score: isWinner ? 96 : baseScore,
        rank,
        strengths: [
          isWinner ? 'Exceptional structure and clarity' : 'Accurate direct response',
          'Good responsiveness and tone',
        ],
        weaknesses: isWinner ? ['Could be slightly more concise'] : ['Slightly less thorough compared to top pick'],
      };
    });

    return {
      judgeModel: `${judgeModel} (Demo Evaluator)`,
      winningModelId: winner.modelId,
      winningModelName: winner.modelName,
      winningReason: `${winner.modelName} delivered the most comprehensive, well-structured explanation with clear formatting and optimal tone. (Note: Provide OPENROUTER_API_KEY for live judge evaluation).`,
      comparisonSummary: `Evaluated ${successfulResponses.length} candidate models. ${winner.modelName} showed superior formatting and conceptual coverage.`,
      scores,
      detailedCritique: `The models were evaluated based on clarity, structure, and responsiveness. ${winner.modelName} stood out by answering directly with good structure.`,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': 'LLM Arena Judge',
      },
      body: JSON.stringify({
        model: judgeModel,
        messages: [
          { role: 'system', content: judgeSystemPrompt },
          { role: 'user', content: judgeUserPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      console.error('[Judge] Failed response from OpenRouter:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Clean JSON markdown if wrapped in ```json ... ```
    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanJson);

    // Validate and sanitize parsed structure
    const winningId = parsed.winningModelId || successfulResponses[0].modelId;
    const winnerInfo = getModelInfo(winningId);

    return {
      judgeModel,
      winningModelId: winningId,
      winningModelName: parsed.winningModelName || winnerInfo.name,
      winningReason: parsed.winningReason || 'Provided the most accurate and well-reasoned answer.',
      comparisonSummary: parsed.comparisonSummary || 'Evaluated all models against query requirements.',
      scores: parsed.scores || {},
      detailedCritique: parsed.detailedCritique || 'Evaluation completed successfully.',
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[Judge] Evaluation error:', err);
    return null;
  }
}
