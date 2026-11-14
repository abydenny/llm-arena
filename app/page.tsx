'use client';

import React, { useState, useEffect } from 'react';
import { ChatTurn, ModelResponse, Conversation } from '@/types';
import { DEFAULT_SELECTED_MODEL_IDS } from '@/lib/models';
import { Navbar } from '@/components/Navbar';
import { ChatThread } from '@/components/ChatThread';
import { ChatInput } from '@/components/ChatInput';
import { PinAuthModal } from '@/components/PinAuthModal';
import { ModelSelector } from '@/components/ModelSelector';
import { MetricsModal } from '@/components/MetricsModal';
import { SidebarHistory } from '@/components/SidebarHistory';
import { SettingsModal } from '@/components/SettingsModal';

export default function Home() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // App & Conversation State
  const [conversationId, setConversationId] = useState<string>(() => `conv-${Date.now()}`);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Model & Judge Settings
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(DEFAULT_SELECTED_MODEL_IDS);
  const [enableJudge, setEnableJudge] = useState<boolean>(true);
  const [judgeModel, setJudgeModel] = useState<string>('anthropic/claude-3.5-sonnet');

  // Modal Dialog States
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Metrics Telemetry Modal
  const [telemetryResponse, setTelemetryResponse] = useState<ModelResponse | null>(null);
  const [telemetryTurnResponses, setTelemetryTurnResponses] = useState<ModelResponse[]>([]);

  // 1. Check Authentication on Mount
  useEffect(() => {
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  // 2. Fetch Conversations from Supabase once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/conversations')
        .then((res) => {
          if (res.ok) {
            setIsSupabaseConnected(true);
            return res.json();
          }
          return { conversations: [] };
        })
        .then((data) => {
          if (data.conversations && data.conversations.length > 0) {
            setConversations(data.conversations);
          }
        })
        .catch(() => {
          setIsSupabaseConnected(false);
        });
    }
  }, [isAuthenticated]);

  // Load chat turns when selecting a conversation
  const handleSelectConversation = async (id: string) => {
    setConversationId(id);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/conversations?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setTurns(data.turns || []);
      }
    } catch (err) {
      console.error('Failed to load conversation turns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setConversationId(`conv-${Date.now()}`);
    setTurns([]);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setIsAuthenticated(false);
  };

  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Build conversation history from previous turns
      const history = turns.flatMap((t) => [
        { role: 'user' as const, content: t.content },
        {
          role: 'assistant' as const,
          content:
            t.responses.find((r) => r.status === 'success')?.content || '',
        },
      ]);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          prompt: promptText,
          selectedModels: selectedModelIds,
          enableJudge,
          judgeModel,
          history: history.slice(-6), // Send last 3 dialogue turns for context
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate model responses');
      }

      const data = await res.json();
      if (data.turn) {
        setTurns((prev) => [...prev, data.turn]);

        // Refresh conversation list to show newly updated title
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === conversationId);
          if (exists) {
            return prev.map((c) =>
              c.id === conversationId
                ? { ...c, updatedAt: new Date().toISOString() }
                : c
            );
          }
          return [
            {
              id: conversationId,
              title: promptText.slice(0, 60),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...prev,
          ];
        });
      }
    } catch (err: any) {
      alert(`Error running models: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMetrics = (
    response: ModelResponse,
    allResponses: ModelResponse[]
  ) => {
    setTelemetryResponse(response);
    setTelemetryTurnResponses(allResponses);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* 1. PIN Authentication Barrier */}
      {isAuthenticated === false && (
        <PinAuthModal onSuccess={() => setIsAuthenticated(true)} />
      )}

      {/* 2. Top Navigation */}
      <Navbar
        selectedModelCount={selectedModelIds.length}
        enableJudge={enableJudge}
        onToggleJudge={() => setEnableJudge(!enableJudge)}
        judgeModel={judgeModel}
        onChangeJudgeModel={(m) => setJudgeModel(m)}
        onOpenModelSelector={() => setIsModelSelectorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewChat={handleNewChat}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* 3. Main Chat Viewport */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Soft Ambient Radial Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <ChatThread
          turns={turns}
          isLoading={isLoading}
          activeModelIds={selectedModelIds}
          onOpenMetrics={handleOpenMetrics}
          onOpenModelSelector={() => setIsModelSelectorOpen(true)}
        />

        {/* 4. Bottom Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          selectedModelCount={selectedModelIds.length}
          onOpenModelSelector={() => setIsModelSelectorOpen(true)}
        />
      </main>

      {/* 5. Modals & Drawers */}
      <ModelSelector
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        selectedModelIds={selectedModelIds}
        onSelectModels={(models) => setSelectedModelIds(models)}
      />

      <MetricsModal
        isOpen={Boolean(telemetryResponse)}
        onClose={() => setTelemetryResponse(null)}
        activeResponse={telemetryResponse}
        allTurnResponses={telemetryTurnResponses}
      />

      <SidebarHistory
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        isSupabaseConnected={isSupabaseConnected}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isSupabaseConnected={isSupabaseConnected}
        judgeModel={judgeModel}
        onChangeJudgeModel={(m) => setJudgeModel(m)}
      />
    </div>
  );
}
