'use client';

import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface PinAuthModalProps {
  onSuccess: () => void;
}

export function PinAuthModal({ onSuccess }: PinAuthModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Invalid PIN code');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError('Connection failed. Please check network.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 8) {
      const next = pin + num;
      setPin(next);
      if (next.length === 4) {
        // Auto-attempt when 4 digits reached
        setTimeout(() => {
          fetch('/api/auth/verify-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: next }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) onSuccess();
            })
            .catch(() => {});
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        className={`w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${
          shake ? 'animate-bounce' : 'animate-slide-up'
        }`}
      >
        {/* Soft Ambient Glow Gradients */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            LLM Arena Security
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Enter your configured PIN from <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">.env</code> to access the multi-model hub
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* PIN Dots indicator */}
            <div className="flex justify-center items-center gap-3 my-4">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    idx < pin.length
                      ? 'bg-gradient-to-r from-indigo-400 to-purple-400 scale-125 shadow-lg shadow-indigo-500/50'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="relative">
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter PIN..."
                autoFocus
                className="w-full text-center tracking-[0.5em] text-2xl font-mono px-4 py-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-rose-400 text-xs py-1 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Numeric Keypad for fast input */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => {
                    if (btn === 'C') setPin('');
                    else if (btn === '⌫') handleDelete();
                    else handleKeyPress(btn);
                  }}
                  className="py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 active:scale-95 text-slate-200 font-semibold text-lg transition border border-slate-800 hover:border-slate-700 select-none shadow-sm"
                >
                  {btn}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || pin.length === 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-medium shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Default local development PIN: <strong className="text-slate-300">1234</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
