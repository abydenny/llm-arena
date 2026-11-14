-- ==============================================================================
-- LLM Arena & Judge - Supabase Database Schema
-- Run this script in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'New Arena Comparison',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Messages Table (User prompts)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    content TEXT NOT NULL,
    selected_models TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Model Responses Table (Individual LLM outputs, metrics & telemetry)
CREATE TABLE IF NOT EXISTS public.model_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    cost_usd NUMERIC(10, 6) DEFAULT 0.000000,
    status TEXT NOT NULL DEFAULT 'success',
    error_message TEXT,
    raw_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Judge Evaluations Table (LLM Judge analysis, score & verdict)
CREATE TABLE IF NOT EXISTS public.judge_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    judge_model TEXT NOT NULL,
    winning_model_id TEXT NOT NULL,
    winning_model_name TEXT NOT NULL,
    winning_reason TEXT NOT NULL,
    scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    detailed_critique TEXT,
    comparison_summary TEXT,
    raw_judge_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_model_responses_message_id ON public.model_responses(message_id);
CREATE INDEX IF NOT EXISTS idx_model_responses_conversation_id ON public.model_responses(conversation_id);
CREATE INDEX IF NOT EXISTS idx_judge_evaluations_message_id ON public.judge_evaluations(message_id);
CREATE INDEX IF NOT EXISTS idx_judge_evaluations_conversation_id ON public.judge_evaluations(conversation_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judge_evaluations ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies (Idempotent: drops previous policy if already exists)
-- Conversations Policies
DROP POLICY IF EXISTS "Allow public read conversations" ON public.conversations;
CREATE POLICY "Allow public read conversations" ON public.conversations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert conversations" ON public.conversations;
CREATE POLICY "Allow public insert conversations" ON public.conversations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update conversations" ON public.conversations;
CREATE POLICY "Allow public update conversations" ON public.conversations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete conversations" ON public.conversations;
CREATE POLICY "Allow public delete conversations" ON public.conversations FOR DELETE USING (true);

-- Messages Policies
DROP POLICY IF EXISTS "Allow public read messages" ON public.messages;
CREATE POLICY "Allow public read messages" ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert messages" ON public.messages;
CREATE POLICY "Allow public insert messages" ON public.messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update messages" ON public.messages;
CREATE POLICY "Allow public update messages" ON public.messages FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete messages" ON public.messages;
CREATE POLICY "Allow public delete messages" ON public.messages FOR DELETE USING (true);

-- Model Responses Policies
DROP POLICY IF EXISTS "Allow public read model_responses" ON public.model_responses;
CREATE POLICY "Allow public read model_responses" ON public.model_responses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert model_responses" ON public.model_responses;
CREATE POLICY "Allow public insert model_responses" ON public.model_responses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update model_responses" ON public.model_responses;
CREATE POLICY "Allow public update model_responses" ON public.model_responses FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete model_responses" ON public.model_responses;
CREATE POLICY "Allow public delete model_responses" ON public.model_responses FOR DELETE USING (true);

-- Judge Evaluations Policies
DROP POLICY IF EXISTS "Allow public read judge_evaluations" ON public.judge_evaluations;
CREATE POLICY "Allow public read judge_evaluations" ON public.judge_evaluations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert judge_evaluations" ON public.judge_evaluations;
CREATE POLICY "Allow public insert judge_evaluations" ON public.judge_evaluations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update judge_evaluations" ON public.judge_evaluations;
CREATE POLICY "Allow public update judge_evaluations" ON public.judge_evaluations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete judge_evaluations" ON public.judge_evaluations FOR DELETE USING (true);

-- 8. Grant schema permissions to standard Supabase roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
