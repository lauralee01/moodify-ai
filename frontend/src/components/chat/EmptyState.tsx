export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h2 className="text-xl font-medium text-[#ECECF1]">
        How are you feeling?
      </h2>
      <p className="max-w-md text-sm text-[#8E8EA0]">
        Tell me your mood or what you want to listen to. I&apos;ll suggest
        music that fits.
      </p>
      <p className="text-xs text-[#6B6B7B]">
        e.g. &quot;I feel anxious but want something hopeful&quot; or
        &quot;Nigerian gospel worship&quot;
      </p>
    </div>
  );
}
