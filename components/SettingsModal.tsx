'use client';

import React, { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  Key,
  Database,
  Scale,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Server,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSupabaseConnected: boolean;
  judgeModel: string;
  onChangeJudgeModel: (model: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  isSupabaseConnected,
  judgeModel,
  onChangeJudgeModel,
}: SettingsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEnvList = () => {
    const text = `APP_PIN=1234
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JUDGE_MODEL=openai/gpt-4o-mini
PIN_SESSION_SECRET=your_random_secret_string`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Arena Configuration & Deployment
              </h3>
              <p className="text-xs text-slate-400">
                Setup status, LLM Judge model, and Vercel environment keys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Active Judge Model Selector */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Active LLM Judge Model</span>
            </label>
            <p className="text-slate-400 text-[11px]">
              Select which model reviews candidate answers and determines the winning response:
            </p>

            <select
              value={judgeModel}
              onChange={(e) => onChangeJudgeModel(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="openai/gpt-4o-mini">openai/gpt-4o-mini (Recommended: Fast & Accurate)</option>
              <option value="openai/gpt-4o">openai/gpt-4o (Ultra-Deep Benchmark Evaluation)</option>
              <option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet (High-Nuance Arbiter)</option>
              <option value="google/gemini-2.0-flash-exp:free">google/gemini-2.0-flash-exp:free (Zero-Cost Judge)</option>
              <option value="meta-llama/llama-3.3-70b-instruct">meta-llama/llama-3.3-70b-instruct (Open-Weights Judge)</option>
            </select>
          </div>

          {/* Database Status Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Supabase Database Status</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSupabaseConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {isSupabaseConnected ? 'Connected & Active' : 'Waiting for Credentials'}
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              When configured in <code className="text-indigo-300">.env.local</code>, all prompt queries, candidate model responses, performance logs (latency, tokens, cost), and LLM Judge evaluations are stored in Supabase tables.
            </p>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 text-slate-400 text-[11px]">
              SQL Schema located at:{' '}
              <code className="text-slate-200 font-mono">
                supabase/schema.sql
              </code>
            </div>
          </div>

          {/* Vercel Deployment Checklist */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Server className="w-4 h-4 text-purple-400" />
                <span>Vercel Deployment Checklist</span>
              </div>
              <button
                onClick={handleCopyEnvList}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition border border-slate-700"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copied ? 'Copied' : 'Copy Keys'}</span>
              </button>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              To deploy to Vercel, push this repository to GitHub and add the following Environment Variables in your Vercel Project Settings:
            </p>

            <ul className="space-y-1.5 font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <li>• <span className="text-indigo-300">APP_PIN</span>: Your PIN code (e.g. 1234)</li>
              <li>• <span className="text-indigo-300">OPENROUTER_API_KEY</span>: OpenRouter secret key</li>
              <li>• <span className="text-indigo-300">NEXT_PUBLIC_SUPABASE_URL</span>: Supabase project URL</li>
              <li>• <span className="text-indigo-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>: Supabase anon key</li>
              <li>• <span className="text-indigo-300">SUPABASE_SERVICE_ROLE_KEY</span>: Supabase service key</li>
              <li>• <span className="text-indigo-300">JUDGE_MODEL</span>: Model ID for evaluation</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-md shadow-indigo-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
