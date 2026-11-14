import { createClient } from '@supabase/supabase-js';
import { ModelResponse, JudgeEvaluation, ChatTurn, Conversation } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseKey.includes('your_supabase')
);

export const supabaseServer = isServerSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Creates or updates a conversation record
 */
export async function ensureConversation(id: string, title?: string): Promise<string> {
  if (!supabaseServer) return id;

  try {
    const finalTitle = title ? title.slice(0, 100) : 'Arena Chat';
    const { error } = await supabaseServer
      .from('conversations')
      .upsert({
        id,
        title: finalTitle,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] ensureConversation error:', error.message);
    }
  } catch (err) {
    console.error('[Supabase] Exception in ensureConversation:', err);
  }
  return id;
}

/**
 * Saves a user message to Supabase
 */
export async function saveUserMessage(
  conversationId: string,
  content: string,
  selectedModels: string[]
): Promise<string | null> {
  if (!supabaseServer) return null;

  try {
    await ensureConversation(conversationId, content);

    const { data, error } = await supabaseServer
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content,
        selected_models: selectedModels,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Supabase] saveUserMessage error:', error.message);
      return null;
    }
    return data?.id || null;
  } catch (err) {
    console.error('[Supabase] Exception in saveUserMessage:', err);
    return null;
  }
}

/**
 * Saves model response records to Supabase
 */
export async function saveModelResponses(
  messageId: string,
  conversationId: string,
  responses: ModelResponse[]
): Promise<void> {
  if (!supabaseServer || !messageId) return;

  try {
    const rows = responses.map((r) => ({
      message_id: messageId,
      conversation_id: conversationId,
      model_id: r.modelId,
      model_name: r.modelName,
      content: r.content,
      prompt_tokens: r.promptTokens,
      completion_tokens: r.completionTokens,
      total_tokens: r.totalTokens,
      latency_ms: r.latencyMs,
      cost_usd: r.costUsd,
      status: r.status,
      error_message: r.errorMessage || null,
      raw_metadata: {
        createdAt: r.createdAt,
      },
    }));

    const { error } = await supabaseServer
      .from('model_responses')
      .insert(rows);

    if (error) {
      console.error('[Supabase] saveModelResponses error:', error.message);
    }
  } catch (err) {
    console.error('[Supabase] Exception in saveModelResponses:', err);
  }
}

/**
 * Saves judge evaluation to Supabase
 */
export async function saveJudgeEvaluation(
  messageId: string,
  conversationId: string,
  evaluation: JudgeEvaluation
): Promise<void> {
  if (!supabaseServer || !messageId) return;

  try {
    const { error } = await supabaseServer
      .from('judge_evaluations')
      .insert({
        message_id: messageId,
        conversation_id: conversationId,
        judge_model: evaluation.judgeModel,
        winning_model_id: evaluation.winningModelId,
        winning_model_name: evaluation.winningModelName,
        winning_reason: evaluation.winningReason,
        scores: evaluation.scores,
        detailed_critique: evaluation.detailedCritique,
        comparison_summary: evaluation.comparisonSummary,
      });

    if (error) {
      console.error('[Supabase] saveJudgeEvaluation error:', error.message);
    }
  } catch (err) {
    console.error('[Supabase] Exception in saveJudgeEvaluation:', err);
  }
}

/**
 * Loads recent conversations
 */
export async function getConversationsList(): Promise<Conversation[]> {
  if (!supabaseServer) return [];

  try {
    const { data, error } = await supabaseServer
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('[Supabase] getConversationsList error:', error.message);
      return [];
    }

    return (data || []).map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
  } catch (err) {
    console.error('[Supabase] Exception in getConversationsList:', err);
    return [];
  }
}

/**
 * Loads complete chat turns for a conversation
 */
export async function getConversationChatTurns(conversationId: string): Promise<ChatTurn[]> {
  if (!supabaseServer) return [];

  try {
    // 1. Fetch user messages
    const { data: messages, error: msgError } = await supabaseServer
      .from('messages')
      .select('id, conversation_id, role, content, selected_models, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError || !messages) {
      console.error('[Supabase] getConversationChatTurns msgError:', msgError?.message);
      return [];
    }

    const messageIds = messages.map(m => m.id);
    if (messageIds.length === 0) return [];

    // 2. Fetch all model responses for these messages
    const { data: responses, error: respError } = await supabaseServer
      .from('model_responses')
      .select('*')
      .in('message_id', messageIds)
      .order('created_at', { ascending: true });

    if (respError) {
      console.error('[Supabase] getConversationChatTurns respError:', respError.message);
    }

    // 3. Fetch judge evaluations
    const { data: judges, error: judgeError } = await supabaseServer
      .from('judge_evaluations')
      .select('*')
      .in('message_id', messageIds);

    if (judgeError) {
      console.error('[Supabase] getConversationChatTurns judgeError:', judgeError.message);
    }

    // 4. Group together
    const turns: ChatTurn[] = messages.map((m) => {
      const turnResponses: ModelResponse[] = (responses || [])
        .filter((r) => r.message_id === m.id)
        .map((r) => ({
          id: r.id,
          modelId: r.model_id,
          modelName: r.model_name,
          content: r.content,
          promptTokens: r.prompt_tokens,
          completionTokens: r.completion_tokens,
          totalTokens: r.total_tokens,
          latencyMs: r.latency_ms,
          costUsd: Number(r.cost_usd),
          status: r.status as 'success' | 'error',
          errorMessage: r.error_message || undefined,
          createdAt: r.created_at,
        }));

      const judgeRow = (judges || []).find((j) => j.message_id === m.id);
      const judgeEvaluation: JudgeEvaluation | undefined = judgeRow
        ? {
            id: judgeRow.id,
            judgeModel: judgeRow.judge_model,
            winningModelId: judgeRow.winning_model_id,
            winningModelName: judgeRow.winning_model_name,
            winningReason: judgeRow.winning_reason,
            scores: judgeRow.scores || {},
            detailedCritique: judgeRow.detailed_critique,
            comparisonSummary: judgeRow.comparison_summary,
            createdAt: judgeRow.created_at,
          }
        : undefined;

      return {
        id: m.id,
        conversationId: m.conversation_id,
        role: 'user',
        content: m.content,
        selectedModels: m.selected_models || [],
        responses: turnResponses,
        judgeEvaluation,
        createdAt: m.created_at,
      };
    });

    return turns;
  } catch (err) {
    console.error('[Supabase] Exception in getConversationChatTurns:', err);
    return [];
  }
}
