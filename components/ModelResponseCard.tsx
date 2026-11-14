'use client';

import React, { useState } from 'react';
import { ModelResponse } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  BarChart2,
  Crown,
  Clock,
  DollarSign,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface ModelResponseCardProps {
  response: ModelResponse;
  isWinner?: boolean;
  score?: number;
  onOpenMetrics: (response: ModelResponse) => void;
}

export function ModelResponseCard({
  response,
  isWinner = false,
  score,
  onOpenMetrics,
}: ModelResponseCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!response.content) return;
    navigator.clipboard.writeText(response.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = response.status === 'success';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg ${
        isWinner
          ? 'bg-gradient-to-b from-amber-950/20 via-slate-900/90 to-slate-900 border-amber-500/40 shadow-amber-500/10'
          : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700/80 shadow-black/20'
      }`}
    >
      {/* Card Header */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between gap-3 ${
          isWinner
            ? 'border-amber-500/20 bg-amber-500/5'
            : 'border-slate-800/80 bg-slate-950/40'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isWinner ? (
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0 animate-pulse-subtle">
              <Crown className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
          )}

          <div className="truncate">
            <span className="font-semibold text-xs text-white tracking-tight">
              {response.modelName}
            </span>
          </div>

          {isWinner && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 tracking-wider uppercase">
              Judge Winner {score ? `(${score}/100)` : ''}
            </span>
          )}
        </div>

        {/* Action icons: Metrics button & Copy button */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Telemetry pill button (Requirement 5) */}
          {isSuccess && (
            <button
              onClick={() => onOpenMetrics(response)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white text-[11px] transition font-mono group"
              title="Click to view full tokens, latency & cost telemetry"
            >
              <BarChart2 className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition" />
              <span className="hidden sm:inline">
                {response.latencyMs}ms
              </span>
              <span className="text-slate-500 hidden md:inline">|</span>
              <span className="text-emerald-400 hidden md:inline">
                ${response.costUsd.toFixed(4)}
              </span>
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={!isSuccess}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition disabled:opacity-40"
            title="Copy response"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Card Content (Markdown) */}
      <div className="p-4 sm:p-5 flex-1 text-slate-200 text-sm leading-relaxed overflow-x-auto select-text prose prose-invert prose-sm max-w-none prose-pre:bg-slate-950/80 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl">
        {isSuccess ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {response.content}
          </ReactMarkdown>
        ) : (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div>
              <div className="font-semibold mb-1">Model Execution Failed</div>
              <p className="text-slate-400 font-mono">
                {response.errorMessage || 'Unknown error occurred while contacting OpenRouter'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Sub-metrics */}
      {isSuccess && (
        <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/30 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>
              Tokens: <strong className="text-slate-300">{response.totalTokens}</strong> ({response.promptTokens} in / {response.completionTokens} out)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenMetrics(response)}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 flex items-center gap-1"
            >
              <BarChart2 className="w-3 h-3" />
              <span>Telemetry</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
