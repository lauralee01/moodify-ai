import type { Conversation } from "@/types/chat";

type ChatSidebarProps = {
  conversations: Conversation[];
  activeId: string | null;
  sidebarOpen: boolean;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onCloseSidebar: () => void;
};

export function ChatSidebar({
  conversations,
  activeId,
  sidebarOpen,
  onNewChat,
  onSelectConversation,
  onCloseSidebar,
}: ChatSidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-20 bg-black/50 transition-opacity duration-200 md:hidden"
        style={{
          visibility: sidebarOpen ? "visible" : "hidden",
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
        }}
        onClick={onCloseSidebar}
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-[min(280px,85vw)] flex-col border-r border-[#2f2f2f] bg-[#171717] transition-transform duration-200 ease-out
          md:relative md:inset-auto md:z-auto md:w-[260px] md:flex-shrink-0 md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between gap-2 p-3">
          <span className="text-lg font-semibold">MoodifyAI</span>
          <button
            type="button"
            aria-label="Close menu"
            className="rounded-lg p-2 text-[#8E8EA0] hover:bg-[#2f2f2f] hover:text-[#ECECF1] md:hidden"
            onClick={onCloseSidebar}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          className="mx-2 mb-2 flex items-center gap-2 rounded-lg border border-[#2f2f2f] bg-transparent px-3 py-2.5 text-sm hover:bg-[#2f2f2f]"
        >
          <span className="text-[#ECECF1]">+ New chat</span>
        </button>
        <div className="flex-1 overflow-y-auto px-2">
          {conversations.length === 0 && (
            <p className="px-2 py-4 text-xs text-[#8E8EA0]">
              No conversations yet. Start by typing below.
            </p>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => onSelectConversation(conv.id)}
              className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm ${
                activeId === conv.id ? "bg-[#2f2f2f]" : "hover:bg-[#252525]"
              }`}
            >
              <span className="line-clamp-2 text-[#ECECF1]">{conv.title}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
