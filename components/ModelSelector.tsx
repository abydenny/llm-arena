'use client';

import React, { useState } from 'react';
import {
  AVAILABLE_MODELS,
  DEFAULT_SELECTED_MODEL_IDS,
} from '@/lib/models';
import { ModelInfo } from '@/types';
import {
  X,
  Check,
  Zap,
  DollarSign,
  Plus,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModelIds: string[];
  onSelectModels: (modelIds: string[]) => void;
}

export function ModelSelector({
  isOpen,
  onClose,
  selectedModelIds,
  onSelectModels,
}: ModelSelectorProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [customModelId, setCustomModelId] = useState('');
  const [customModels, setCustomModels] = useState<ModelInfo[]>([]);

  if (!isOpen) return null;

  const allModels = [...AVAILABLE_MODELS, ...customModels];
  const providers = ['All', 'OpenAI', 'Anthropic', 'Google', 'Meta', 'DeepSeek', 'Mistral'];

  const filteredModels = allModels.filter((m) =>
    activeFilter === 'All' ? true : m.provider === activeFilter
  );

  const toggleModel = (id: string) => {
    if (selectedModelIds.includes(id)) {
      if (selectedModelIds.length === 1) {
        alert('You must have at least 1 model selected.');
        return;
      }
      onSelectModels(selectedModelIds.filter((m) => m !== id));
    } else {
      onSelectModels([...selectedModelIds, id]);
    }
  };

  const applyPreset = (presetIds: string[]) => {
    onSelectModels(presetIds);
  };

  const handleAddCustomModel = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customModelId.trim();
    if (!trimmed) return;

    if (allModels.some((m) => m.id === trimmed)) {
      if (!selectedModelIds.includes(trimmed)) {
        onSelectModels([...selectedModelIds, trimmed]);
      }
      setCustomModelId('');
      return;
    }

    const newModel: ModelInfo = {
      id: trimmed,
      name: trimmed.split('/')[1] || trimmed,
      provider: 'Other',
      description: `Custom model from OpenRouter: ${trimmed}`,
      contextLength: 128000,
      inputCostPer1M: 0.5,
      outputCostPer1M: 1.5,
      color: 'from-violet-500 to-indigo-700',
    };

    setCustomModels([...customModels, newModel]);
    onSelectModels([...selectedModelIds, trimmed]);
    setCustomModelId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Select LLM Arena Contenders
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Choose which models will concurrently generate and compete on your prompts ({selectedModelIds.length} selected)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 py-3.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">Presets:</span>
          <button
            onClick={() => applyPreset(['openai/gpt-4o', 'anthropic/claude-3.5-sonnet'])}
            className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 whitespace-nowrap transition border border-slate-700/60"
          >
            ⚔️ Flagship Duel (GPT-4o vs Claude 3.5 Sonnet)
          </button>
          <button
            onClick={() =>
              applyPreset([
                'openai/gpt-4o-mini',
                'google/gemini-2.0-flash-exp:free',
                'deepseek/deepseek-chat',
              ])
            }
            className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 whitespace-nowrap transition border border-slate-700/60"
          >
            ⚡ Speed & Budget (Mini vs Gemini Flash vs DeepSeek)
          </button>
          <button
            onClick={() =>
              applyPreset([
                'openai/gpt-4o',
                'anthropic/claude-3.5-sonnet',
                'meta-llama/llama-3.3-70b-instruct',
              ])
            }
            className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 whitespace-nowrap transition border border-slate-700/60"
          >
            👑 Tri-Colossus (GPT-4o, Claude 3.5, Llama 3.3)
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 pt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {providers.map((p) => (
              <button
                key={p}
                onClick={() => setActiveFilter(p)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                  activeFilter === p
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 hidden sm:inline">
            Click to toggle candidate models
          </span>
        </div>

        {/* Model Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredModels.map((model) => {
            const isSelected = selectedModelIds.includes(model.id);
            return (
              <div
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white group-hover:text-indigo-300 transition">
                          {model.name}
                        </span>
                        {model.isPopular && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                            Popular
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {model.id}
                      </span>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                          : 'border border-slate-700 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {model.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {Math.round(model.contextLength / 1000)}k ctx
                    </span>
                    <span className="text-slate-500">{model.provider}</span>
                  </div>
                  <div className="text-slate-300 font-mono">
                    ${model.inputCostPer1M.toFixed(2)} in / ${model.outputCostPer1M.toFixed(2)} out (1M)
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Model Input & Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleAddCustomModel} className="w-full sm:w-auto flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Add custom OpenRouter model (e.g. cohere/command-r-plus)..."
              value={customModelId}
              onChange={(e) => setCustomModelId(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!customModelId.trim()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 disabled:opacity-50 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium text-xs shadow-md shadow-indigo-500/20 transition"
          >
            Confirm Selection ({selectedModelIds.length} Models)
          </button>
        </div>
      </div>
    </div>
  );
}
