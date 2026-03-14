"use client";

import { useRef, useEffect } from "react";

function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
};

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) e.currentTarget.form?.requestSubmit();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    onSubmit(e);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  return (
    <div className="bg-[#212121] px-4 pb-4 pt-3">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="flex w-full items-end">
          <div className="relative flex min-h-[44px] flex-1 items-end rounded-xl bg-[#303030] px-4 py-2.5 shadow-sm focus-within:border focus-within:border-[#565869]">
            <textarea
              ref={textareaRef}
              className="min-h-[28px] max-h-[240px] w-full flex-1 resize-none overflow-y-auto bg-transparent pr-10 text-sm leading-relaxed text-[#ffffff] outline-none placeholder:text-[#8E8EA0]"
              placeholder="Ask for music based on your mood…"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <span
              className="absolute bottom-2.5 right-2.5 flex h-8 w-8 shrink-0 items-center justify-center gap-0.5"
              aria-hidden
            >
              {isLoading ? (
                <span
                  className="flex items-center gap-0.5 text-[#ECECF1]"
                  aria-label="Thinking..."
                >
                  <Sparkle className="animate-twinkle" style={{ animationDelay: "0ms" }} />
                  <Sparkle className="animate-twinkle" style={{ animationDelay: "150ms" }} />
                  <Sparkle className="animate-twinkle" style={{ animationDelay: "300ms" }} />
                </span>
              ) : (
                <button
                  type="submit"
                  disabled={!value.trim()}
                  className="flex h-8 w-8 items-center justify-center text-[#8E8EA0] hover:text-[#ECECF1] disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Send message"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </button>
              )}
            </span>
          </div>
        </form>
        <p className="mt-2 text-center text-xs text-[#6B6B7B]">
          MoodifyAI suggests music via Deezer. Results may vary.
        </p>
      </div>
    </div>
  );
}
