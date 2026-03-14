import type { Track } from "@/types/chat";

type TrackCardProps = { track: Track };

export function TrackCard({ track }: TrackCardProps) {
  return (
    <article className="flex gap-3 rounded-xl border border-[#2f2f2f] bg-[#252525] p-3">
      {track.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.imageUrl}
          alt={track.name}
          className="h-14 w-14 flex-none rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-[#ECECF1]">
          {track.name}
        </h3>
        <p className="truncate text-xs text-[#8E8EA0]">
          {track.artistNames.join(", ")}
        </p>
        <div className="mt-2 flex flex-col gap-1.5">
          {track.previewUrl && (
            <audio
              controls
              src={track.previewUrl}
              className="h-8 w-full max-w-full"
            />
          )}
          <a
            href={track.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center rounded-md border border-[#565869] px-2.5 py-1 text-xs text-[#ECECF1] hover:bg-[#343541]"
          >
            Open on Deezer
          </a>
        </div>
      </div>
    </article>
  );
}
