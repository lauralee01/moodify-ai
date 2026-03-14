import type { Message } from "@/types/chat";
import { TrackCard } from "./TrackCard";

type ChatMessageProps = { message: Message };

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className="space-y-3">
      <div
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm sm:max-w-[85%] ${
            message.role === "user"
              ? "bg-[#2f2f2f] text-[#ECECF1]"
              : "text-[#ECECF1]"
          }`}
        >
          {message.content}
        </div>
      </div>

      {"tracks" in message && message.tracks && message.tracks.length > 0 && (
        <div className="grid gap-4 sm:gap-8 sm:grid-cols-2">
          {message.tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      )}
    </div>
  );
}
