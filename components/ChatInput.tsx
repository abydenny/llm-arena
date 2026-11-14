'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Layers, ArrowUp, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (prompt: string) => void;
  isLoading: boolean;
  selectedModelCount: number;
  onOpenModelSelector: () => void;
}

const PROMPT_SUGGESTIONS = [
  'Compare Python vs Rust for building high-throughput APIs',
  'Write an async retry utility with exponential backoff in TypeScript',
  'Explain how LLM KV cache optimization works in simple terms',
  'Draft a polite follow-up email after a job interview',
];

export function ChatInput({
  onSendMessage,
  isLoading,
  selectedModelCount,
  onOpenModelSelector,
}: ChatInputProps) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSendMessage(prompt.trim());
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-6 pt-2">
      {/* Quick Prompt Starters (when prompt is empty) */}
      {!prompt && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 text-xs scrollbar-none">
          <span className="text-slate-500 flex-shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Try:</span>
          </span>
          {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(suggestion);
                textareaRef.current?.focus();
              }}
              className="px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700 whitespace-nowrap transition flex-shrink-0 text-[11px]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Box with soft gradient ring */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-300"
      >
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything to compare responses across your selected LLMs..."
          rows={1}
          disabled={isLoading}
          className="w-full px-5 pt-4 pb-12 rounded-3xl bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none resize-none leading-relaxed max-h-52 overflow-y-auto"
        />

        {/* Input Bar Controls */}
        <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between pointer-events-none">
          {/* Active Model Counter Pill */}
          <button
            type="button"
            onClick={onOpenModelSelector}
            className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-xs transition border border-slate-700/50"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {selectedModelCount} {selectedModelCount === 1 ? 'model' : 'models'}
            </span>
          </button>

          {/* Right Action: Send Button */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="text-[10px] text-slate-500 hidden sm:inline-flex items-center gap-1">
              Press <CornerDownLeft className="w-3 h-3 text-slate-400" /> to send
            </span>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-9 h-9 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white flex items-center justify-center transition shadow-md shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
