'use client';

import React from 'react';
import { ChatTurn, ModelResponse } from '@/types';
import { ModelResponseCard } from '@/components/ModelResponseCard';
import { JudgeCard } from '@/components/JudgeCard';
import {
  User,
  Scale,
  Sparkles,
  Layers,
  Zap,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface ChatThreadProps {
  turns: ChatTurn[];
  isLoading: boolean;
  activeModelIds: string[];
  onOpenMetrics: (
    response: ModelResponse,
    allTurnResponses: ModelResponse[]
  ) => void;
  onOpenModelSelector: () => void;
}

export function ChatThread({
  turns,
  isLoading,
  activeModelIds,
  onOpenMetrics,
  onOpenModelSelector,
}: ChatThreadProps) {
  // Empty State Hero
  if (turns.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto animate-fade-in">
        {/* Soft Radial Ambient Aura */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl" />
          <div className="relative w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl">
            <Sparkles className="w-10 h-10 text-indigo-400" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Multi-Model LLM Arena
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
          Broadcast your prompts simultaneously across top-tier foundation models, inspect granular token & cost telemetry, and receive unbiased verdicts from the automated LLM Judge.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full text-left mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2.5">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Concurrent LLMs</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Compare GPT-4o, Claude 3.5 Sonnet, Gemini, and Llama side-by-side in real time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2.5">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Deep Telemetry</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Track token counts, generation latency, and micro-dollar API costs for every response.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2.5">
              <Scale className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Automated LLM Judge</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              An impartial model scores answers and explains why the winning response took 1st place.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenModelSelector}
          className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 transition"
        >
          Configure Arena Models
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 overflow-y-auto">
      {turns.map((turn, turnIdx) => {
        const winningModelId = turn.judgeEvaluation?.winningModelId;

        return (
          <div key={turn.id || turnIdx} className="space-y-4 animate-slide-up">
            {/* User Message Header */}
            <div className="flex items-start gap-3 bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Prompt Query
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">
                      {new Date(turn.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                      {turn.selectedModels.length} models
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {turn.content}
                </p>
              </div>
            </div>

            {/* Model Responses Grid */}
            <div
              className={`grid gap-4 ${
                turn.responses.length === 1
                  ? 'grid-cols-1'
                  : turn.responses.length === 2
                  ? 'grid-cols-1 lg:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {turn.responses.map((response) => {
                const isWinner = winningModelId === response.modelId;
                const score =
                  turn.judgeEvaluation?.scores?.[response.modelId]?.score;

                return (
                  <ModelResponseCard
                    key={response.id || response.modelId}
                    response={response}
                    isWinner={isWinner}
                    score={score}
                    onOpenMetrics={(resp) => onOpenMetrics(resp, turn.responses)}
                  />
                );
              })}
            </div>

            {/* Judge Evaluation Section */}
            {turn.judgeEvaluation && (
              <JudgeCard evaluation={turn.judgeEvaluation} />
            )}
          </div>
        );
      })}

      {/* Loading Turn Skeleton (when generating) */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium px-1">
            <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
            <span>
              Querying {activeModelIds.length} candidate models and running LLM Judge...
            </span>
          </div>

          <div
            className={`grid gap-4 ${
              activeModelIds.length === 1
                ? 'grid-cols-1'
                : activeModelIds.length === 2
                ? 'grid-cols-1 lg:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {activeModelIds.map((mId, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="h-4 w-28 bg-slate-800 rounded-md" />
                  <div className="h-4 w-12 bg-slate-800 rounded-md" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3.5 w-full bg-slate-800/70 rounded" />
                  <div className="h-3.5 w-5/6 bg-slate-800/70 rounded" />
                  <div className="h-3.5 w-4/6 bg-slate-800/70 rounded" />
                  <div className="h-3.5 w-3/4 bg-slate-800/70 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
