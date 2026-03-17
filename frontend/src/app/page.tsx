"use client";

import { useState, useEffect, useCallback } from "react";
import type { Conversation, Message, Track } from "@/types/chat";
import { API_BASE } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import {
  ChatSidebar,
  ChatMessage,
  ChatInput,
  EmptyState,
  MobileHeader,
} from "@/components/chat";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeConversation =
    activeId != null
      ? conversations.find((c) => c.id === activeId)
      : null;
  const messages = activeConversation?.messages ?? [];

  // Load conversation list from the API when the page mounts (persisted in DB).
  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId) return;
    fetch(`${API_BASE}/api/conversations?sessionId=${encodeURIComponent(sessionId)}`)
      .then((res) => res.ok ? res.json() : [])
      .then((list: { id: string; title: string }[]) => {
        setConversations(
          list.map((c) => ({ id: c.id, title: c.title, messages: [] }))
        );
      })
      .catch(() => {});
  }, []);

  // When user selects a conversation, load its messages if we don't have them yet.
  const selectConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    const existing = conversations.find((c) => c.id === id);
    if (existing?.messages && existing.messages.length > 0) return;
    const sessionId = getSessionId();
    if (!sessionId) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/conversations/${id}?sessionId=${encodeURIComponent(sessionId)}`
      );
      if (!res.ok) return;
      const data: { id: string; title: string; messages: Message[] } = await res.json();
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, title: data.title, messages: data.messages ?? [] } : c
        )
      );
    } catch {
      // ignore
    }
  }, [conversations]);

  function startNewChat() {
    setActiveId(null);
    setError(null);
    setSidebarOpen(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setIsLoading(true);
    setInput("");

    const sessionId = getSessionId();
    if (!sessionId) {
      setError("Session not available. Please refresh.");
      setIsLoading(false);
      return;
    }

    // Show the user's message immediately (optimistic UI) so they see it while the AI responds
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    const isNewConversation =
      activeId == null || !conversations.some((c) => c.id === activeId);
    const pendingId = isNewConversation ? `pending-${crypto.randomUUID()}` : null;

    setConversations((prev) => {
      if (isNewConversation) {
        return [
          ...prev,
          {
            id: pendingId!,
            title: trimmed.length > 36 ? `${trimmed.slice(0, 36)}…` : trimmed,
            messages: [userMsg],
          },
        ];
      }
      return prev.map((c) =>
        c.id === activeId ? { ...c, messages: [...c.messages, userMsg] } : c
      );
    });
    if (pendingId) setActiveId(pendingId);

    try {
      const res = await fetch(`${API_BASE}/api/mood/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          conversationId: isNewConversation ? undefined : activeId ?? undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Request failed");
      }

      const data: { reply: string; tracks: Track[]; conversationId: string } = await res.json();

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        tracks: data.tracks?.length ? data.tracks : undefined,
      };

      setConversations((prev) => {
        if (pendingId) {
          // Replace the pending conversation with the real one from the server
          return prev.map((c) =>
            c.id === pendingId
              ? {
                  id: data.conversationId,
                  title: trimmed.length > 36 ? `${trimmed.slice(0, 36)}…` : trimmed,
                  messages: [...c.messages, assistantMsg],
                }
              : c
          );
        }
        return prev.map((c) =>
          c.id === data.conversationId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        );
      });
      setActiveId(data.conversationId);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#212121] text-[#ECECF1]">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        sidebarOpen={sidebarOpen}
        onNewChat={startNewChat}
        onSelectConversation={selectConversation}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col bg-[#212121]">
        <MobileHeader
          title={activeConversation?.title ?? "MoodifyAI"}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto pt-14 pb-32 md:pt-0 md:pb-0">
          {messages.length === 0 && <EmptyState />}

          <div className="mx-auto max-w-3xl space-y-6 px-4 py-4 sm:px-0 sm:py-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
