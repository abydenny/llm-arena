'use client';

import React from 'react';
import {
  Sparkles,
  Layers,
  Scale,
  Database,
  LogOut,
  SlidersHorizontal,
  PlusCircle,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  selectedModelCount: number;
  enableJudge: boolean;
  onToggleJudge: () => void;
  judgeModel: string;
  onChangeJudgeModel: (model: string) => void;
  onOpenModelSelector: () => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
  isSupabaseConnected: boolean;
}

export function Navbar({
  selectedModelCount,
  enableJudge,
  onToggleJudge,
  judgeModel,
  onChangeJudgeModel,
  onOpenModelSelector,
  onOpenSettings,
  onNewChat,
  onToggleSidebar,
  onLogout,
  isSupabaseConnected,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Sidebar toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition md:hidden"
            title="Toggle History"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  LLM Arena
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  OpenRouter
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Model Selector Pill */}
          <button
            onClick={onOpenModelSelector}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition group shadow-sm"
          >
            <Layers className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
            <span>
              Models:{' '}
              <strong className="text-white font-semibold">{selectedModelCount}</strong>
            </span>
          </button>

          {/* Quick LLM Judge Selector & Toggle Pill */}
          <div
            className={`flex items-center rounded-xl border transition shadow-sm ${
              enableJudge
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <button
              onClick={onToggleJudge}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-l-xl text-xs font-medium transition ${
                enableJudge
                  ? 'text-amber-300 hover:bg-amber-500/20'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}
              title={enableJudge ? 'Judge Enabled (Click to disable)' : 'Judge Disabled (Click to enable)'}
            >
              <Scale
                className={`w-3.5 h-3.5 ${
                  enableJudge ? 'text-amber-400 animate-pulse-subtle' : 'text-slate-500'
                }`}
              />
              <span className="hidden sm:inline">Judge:</span>
            </button>

            {enableJudge && (
              <select
                value={judgeModel}
                onChange={(e) => onChangeJudgeModel(e.target.value)}
                className="bg-transparent text-amber-300 hover:text-amber-200 text-xs py-1.5 pl-1.5 pr-2 rounded-r-xl font-medium focus:outline-none cursor-pointer border-l border-amber-500/20 appearance-none text-left"
                title="Select which model acts as the LLM Judge"
              >
                <option value="anthropic/claude-3.5-sonnet" className="bg-slate-900 text-white">
                  Claude 3.5 Sonnet ⭐
                </option>
                <option value="openai/gpt-4o" className="bg-slate-900 text-white">
                  GPT-4o
                </option>
                <option value="openai/gpt-4o-mini" className="bg-slate-900 text-white">
                  GPT-4o mini
                </option>
                <option value="google/gemini-2.0-flash-exp:free" className="bg-slate-900 text-white">
                  Gemini 2.0 Flash
                </option>
                <option value="meta-llama/llama-3.3-70b-instruct" className="bg-slate-900 text-white">
                  Llama 3.3 70B
                </option>
              </select>
            )}
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition"
            title="Start new arena session"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden md:inline">New Session</span>
          </button>
        </div>

        {/* Right: Supabase Indicator & Settings / Logout */}
        <div className="flex items-center gap-2">
          {/* Supabase status badge */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border ${
              isSupabaseConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
            title={
              isSupabaseConnected
                ? 'Supabase database connected & synced'
                : 'Local mode (Configure Supabase keys in .env.local to persist)'
            }
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSupabaseConnected ? 'Supabase Synced' : 'Local Mode'}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Settings & Setup Info"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Lock / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
