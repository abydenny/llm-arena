'use client';

import React from 'react';
import { ModelResponse } from '@/types';
import {
  X,
  Zap,
  DollarSign,
  Clock,
  Cpu,
  BarChart3,
  Flame,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

interface MetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeResponse: ModelResponse | null;
  allTurnResponses: ModelResponse[];
}

export function MetricsModal({
  isOpen,
  onClose,
  activeResponse,
  allTurnResponses,
}: MetricsModalProps) {
  if (!isOpen || !activeResponse) return null;

  const latencySeconds = (activeResponse.latencyMs / 1000).toFixed(2);
  const throughput =
    activeResponse.latencyMs > 0 && activeResponse.completionTokens > 0
      ? (
          activeResponse.completionTokens /
          (activeResponse.latencyMs / 1000)
        ).toFixed(1)
      : '0.0';

  // Find fastest & cheapest in this turn
  const validResponses = allTurnResponses.filter(
    (r) => r.status === 'success' && r.latencyMs > 0
  );
  const fastest = validResponses.reduce(
    (prev, curr) => (curr.latencyMs < prev.latencyMs ? curr : prev),
    validResponses[0] || activeResponse
  );
  const cheapest = validResponses.reduce(
    (prev, curr) => (curr.costUsd < prev.costUsd ? curr : prev),
    validResponses[0] || activeResponse
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Performance & Cost Telemetry</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                  {activeResponse.modelName}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Detailed token consumption, latency benchmarks, and generation pricing
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

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Latency */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Latency</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {activeResponse.latencyMs.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {latencySeconds}s total time
              </div>
            </div>

            {/* Total Cost */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Cost</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">
                ${activeResponse.costUsd.toFixed(6)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {activeResponse.costUsd === 0 ? 'Free tier' : 'OpenRouter rate'}
              </div>
            </div>

            {/* Total Tokens */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Tokens</span>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {activeResponse.totalTokens.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                in + out tokens
              </div>
            </div>

            {/* Generation Speed */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Throughput</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {throughput}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">tokens / second</div>
            </div>
          </div>

          {/* Token Breakdown Detailed Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Token Consumption Breakdown</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5 text-indigo-400" />
                    Input Tokens (Prompt)
                  </span>
                  <span className="font-mono text-white font-medium">
                    {activeResponse.promptTokens.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (activeResponse.promptTokens /
                          (activeResponse.totalTokens || 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
                    Output Tokens (Completion)
                  </span>
                  <span className="font-mono text-white font-medium">
                    {activeResponse.completionTokens.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (activeResponse.completionTokens /
                          (activeResponse.totalTokens || 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cross-Model Comparison Table for this turn */}
          {allTurnResponses.length > 1 && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Turn Comparison Across Selected LLMs</span>
                </span>
                <span className="text-[11px] text-slate-500 normal-case">
                  {allTurnResponses.length} models compared
                </span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium">
                      <th className="pb-2">Model</th>
                      <th className="pb-2 text-right">In Tokens</th>
                      <th className="pb-2 text-right">Out Tokens</th>
                      <th className="pb-2 text-right">Latency</th>
                      <th className="pb-2 text-right">Cost (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {allTurnResponses.map((r) => {
                      const isCurrent = r.modelId === activeResponse.modelId;
                      const isFastest = r.modelId === fastest?.modelId;
                      const isCheapest = r.modelId === cheapest?.modelId;

                      return (
                        <tr
                          key={r.modelId}
                          className={`${
                            isCurrent
                              ? 'bg-indigo-500/10 text-white font-medium'
                              : 'text-slate-300 hover:bg-slate-900/40'
                          }`}
                        >
                          <td className="py-2.5 font-sans flex items-center gap-2">
                            <span>{r.modelName}</span>
                            {isFastest && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 font-sans">
                                Fastest
                              </span>
                            )}
                            {isCheapest && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                                Lowest Cost
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-right text-slate-400">
                            {r.promptTokens}
                          </td>
                          <td className="py-2.5 text-right text-slate-300">
                            {r.completionTokens}
                          </td>
                          <td className="py-2.5 text-right text-slate-200">
                            {r.latencyMs.toLocaleString()} ms
                          </td>
                          <td className="py-2.5 text-right text-emerald-400">
                            ${r.costUsd.toFixed(6)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
