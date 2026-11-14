import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { callMultipleModels } from '@/lib/openrouter';
import { evaluateResponsesWithJudge } from '@/lib/judge';
import {
  saveUserMessage,
  saveModelResponses,
  saveJudgeEvaluation,
} from '@/lib/supabase/server';

export const maxDuration = 60; // Allow 60 seconds on Vercel Pro/Hobby for multi-model queries

export async function POST(req: NextRequest) {
  try {
    // 1. PIN Authentication check
    if (!isAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid PIN session required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      conversationId = `conv-${Date.now()}`,
      prompt,
      selectedModels = [],
      enableJudge = true,
      judgeModel,
      history = [],
    } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!selectedModels || !Array.isArray(selectedModels) || selectedModels.length === 0) {
      return NextResponse.json(
        { error: 'At least one model must be selected' },
        { status: 400 }
      );
    }

    // 2. Persist user message to Supabase
    const messageId = await saveUserMessage(conversationId, prompt.trim(), selectedModels);
    const resolvedMessageId = messageId || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // 3. Process all selected models concurrently
    const responses = await callMultipleModels(selectedModels, prompt.trim(), history);

    // 4. Persist model responses to Supabase
    await saveModelResponses(resolvedMessageId, conversationId, responses);

    // 5. Run LLM Judge if enabled
    let judgeEvaluation = null;
    if (enableJudge) {
      judgeEvaluation = await evaluateResponsesWithJudge(prompt.trim(), responses, judgeModel);
      if (judgeEvaluation) {
        // 6. Persist judge evaluation to Supabase
        await saveJudgeEvaluation(resolvedMessageId, conversationId, judgeEvaluation);
      }
    }

    return NextResponse.json({
      success: true,
      turn: {
        id: resolvedMessageId,
        conversationId,
        role: 'user',
        content: prompt.trim(),
        selectedModels,
        responses,
        judgeEvaluation,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[API /api/chat] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error processing prompt' },
      { status: 500 }
    );
  }
}
