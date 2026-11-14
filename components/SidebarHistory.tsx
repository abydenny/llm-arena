'use client';

import React from 'react';
import { Conversation } from '@/types';
import {
  MessageSquare,
  PlusCircle,
  X,
  Clock,
  Sparkles,
  Database,
} from 'lucide-react';

interface SidebarHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isSupabaseConnected: boolean;
}

export function SidebarHistory({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  isSupabaseConnected,
}: SidebarHistoryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white">Arena History</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: New Session */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-medium text-xs transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Arena Session</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 space-y-2">
              <Clock className="w-6 h-6 mx-auto text-slate-600" />
              <p>No previous conversations recorded yet.</p>
              {!isSupabaseConnected && (
                <p className="text-[11px] text-amber-400/80">
                  Connect Supabase in .env.local to persist sessions across reloads.
                </p>
              )}
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 ${
                    isActive
                      ? 'bg-slate-800 text-white border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <span className="font-medium truncate text-slate-200">
                    {conv.title || 'Comparison Turn'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isSupabaseConnected ? 'Cloud Synced' : 'Local State'}</span>
          </div>
          <span>{conversations.length} saved</span>
        </div>
      </div>
    </div>
  );
}
