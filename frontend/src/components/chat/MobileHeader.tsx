type MobileHeaderProps = {
  title: string;
  onMenuClick: () => void;
};

export function MobileHeader({ title, onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-[#2f2f2f] bg-[#212121] px-4 py-3 md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-[#ECECF1] hover:bg-[#2f2f2f]"
        onClick={onMenuClick}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <span className="min-w-0 flex-1 truncate text-base font-medium text-[#ECECF1]">
        {title}
      </span>
    </header>
  );
}
