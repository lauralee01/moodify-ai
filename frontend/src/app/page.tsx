"use client";

import { useState } from "react";

type MusicParams = {
  genres: string[];
  energy: number;
  valence: number;
  acousticness: number;
  tempoBpm?: number;
  deezerQuery?: string;
};

type Track = {
  id: string;
  name: string;
  artistNames: string[];
  previewUrl: string | null;
  url: string;
  imageUrl: string | null;
};

type Message =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string; tracks?: Track[] };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

console.log('API_BASE', API_BASE);
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setIsLoading(true);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      // 1) Call backend mood endpoint
      const moodRes = await fetch(`${API_BASE}/api/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!moodRes.ok) {
        throw new Error("Mood analysis failed");
      }

      const moodJson: { reply: string; musicParams: MusicParams } =
        await moodRes.json();

      // 2) Call recommendations with LLM-generated deezerQuery
      const deezerQuery =
        moodJson.musicParams.deezerQuery ??
        moodJson.musicParams.genres.join(" ");

      const recRes = await fetch(`${API_BASE}/api/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deezerQuery,
          genres: moodJson.musicParams.genres,
        }),
      });

      let tracks: Track[] | undefined;
      if (recRes.ok) {
        const recJson: { tracks: Track[] } = await recRes.json();
        tracks = recJson.tracks;
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: moodJson.reply,
        tracks,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong talking to MoodifyAI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen justify-center bg-zinc-950 px-4 py-6 text-zinc-50">
      <main className="flex w-full max-w-3xl flex-col rounded-3xl bg-zinc-900/80 shadow-xl ring-1 ring-zinc-800 backdrop-blur-sm">
        <header className="border-b border-zinc-800 px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">
            MoodifyAI 
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Tell me how you feel, and I&apos;ll find music that matches your
            mood.
          </p>
        </header>

        <section className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {messages.length === 0 && (
            <p className="text-sm text-zinc-500">
              Try something like:{" "}
              <span className="italic">
                &quot;I feel anxious but want something hopeful&quot;
              </span>{" "}
              or{" "}
              <span className="italic">
                &quot;I need ambient focus music for late-night studying&quot;
              </span>
              .
            </p>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-500 text-white"
                      : "bg-zinc-800 text-zinc-50"
                  }`}
                >
                  {msg.content}
                </div>
              </div>

              {"tracks" in msg && msg.tracks && msg.tracks.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {msg.tracks.map((track) => (
                    <article
                      key={track.id}
                      className="flex gap-3 rounded-2xl bg-zinc-900 p-3 ring-1 ring-zinc-800"
                    >
                      {track.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={track.imageUrl}
                          alt={track.name}
                          className="h-16 w-16 flex-none rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold">
                          {track.name}
                        </h3>
                        <p className="truncate text-xs text-zinc-400">
                          {track.artistNames.join(", ")}
                        </p>
                        <div className="mt-2 flex flex-col gap-2">
                          {track.previewUrl && (
                            <audio
                              controls
                              src={track.previewUrl}
                              className="w-full"
                            />
                          )}
                          <a
                            href={track.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                          >
                            Open on Deezer
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
        </section>

        <form
          onSubmit={handleSend}
          className="border-t border-zinc-800 px-4 py-3"
        >
          <div className="flex items-end gap-2 rounded-2xl bg-zinc-900 px-3 py-2 ring-1 ring-zinc-800">
            <textarea
              className="h-16 max-h-32 flex-1 resize-none bg-transparent text-sm text-zinc-50 outline-none placeholder:text-zinc-500"
              placeholder="Tell MoodifyAI how you feel or what you want to listen to..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-indigo-500/40"
            >
              {isLoading ? "Thinking..." : "Send"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

