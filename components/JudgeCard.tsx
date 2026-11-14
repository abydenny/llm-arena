'use client';

import React, { useState } from 'react';
import { JudgeEvaluation } from '@/types';
import {
  Scale,
  Crown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
} from 'lucide-react';

interface JudgeCardProps {
  evaluation: JudgeEvaluation;
}

export function JudgeCard({ evaluation }: JudgeCardProps) {
  const [showDetailedCritique, setShowDetailedCritique] = useState(false);

  const scoresEntries = Object.entries(evaluation.scores || {}).sort(
    ([, a], [, b]) => (a.rank || 99) - (b.rank || 99)
  );

  return (
    <div className="rounded-3xl bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-slate-900 border border-amber-500/30 p-5 sm:p-6 shadow-xl shadow-amber-500/5 my-4 backdrop-blur-xl relative overflow-hidden animate-fade-in">
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-orange-500/20 border border-amber-500/40 text-amber-300 shadow-md">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                LLM Judge Evaluation & Verdict
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Automated Arbiter
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluated by{' '}
              <code className="text-amber-300/90 font-mono">
                {evaluation.judgeModel}
              </code>
            </p>
          </div>
        </div>

        {/* Winner Highlight Capsule */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs">
            Winner:{' '}
            <strong className="text-white font-bold">
              {evaluation.winningModelName}
            </strong>
          </span>
        </div>
      </div>

      {/* Winning Justification Box */}
      <div className="my-4 p-4 rounded-2xl bg-slate-950/60 border border-amber-500/20">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span>Why {evaluation.winningModelName} Won</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          {evaluation.winningReason}
        </p>

        {evaluation.comparisonSummary && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 leading-normal">
            <strong className="text-slate-300">Overview: </strong>
            {evaluation.comparisonSummary}
          </div>
        )}
      </div>

      {/* Model Scorecards & Strengths/Weaknesses */}
      {scoresEntries.length > 0 && (
        <div className="space-y-3 mt-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Model Scores & Breakdown
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {scoresEntries.map(([modelId, critique]) => {
              const isWinner = modelId === evaluation.winningModelId;

              return (
                <div
                  key={modelId}
                  className={`p-3.5 rounded-2xl border transition ${
                    isWinner
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white truncate max-w-[140px]">
                      {modelId.split('/')[1] || modelId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {critique.score}/100
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        #{critique.rank}
                      </span>
                    </div>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${
                        isWinner
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, critique.score)}%` }}
                    />
                  </div>

                  {/* Strengths */}
                  {critique.strengths && critique.strengths.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {critique.strengths.slice(0, 2).map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-1.5 text-[11px] text-emerald-400"
                        >
                          <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 line-clamp-1">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Weaknesses */}
                  {critique.weaknesses && critique.weaknesses.length > 0 && (
                    <div className="space-y-1">
                      {critique.weaknesses.slice(0, 1).map((w, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-1.5 text-[11px] text-slate-400"
                        >
                          <XCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-rose-400/70" />
                          <span className="text-slate-400 line-clamp-1">{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable Detailed Critique */}
      {evaluation.detailedCritique && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setShowDetailedCritique(!showDetailedCritique)}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition font-medium"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {showDetailedCritique
                ? 'Hide Analytical Critique'
                : 'Read Deep Dive Judge Critique'}
            </span>
            {showDetailedCritique ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showDetailedCritique && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap animate-fade-in font-sans">
              {evaluation.detailedCritique}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
