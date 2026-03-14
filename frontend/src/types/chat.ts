export type MusicParams = {
  genres: string[];
  energy: number;
  valence: number;
  acousticness: number;
  tempoBpm?: number;
  deezerQuery?: string;
  artistName?: string;
};

export type Track = {
  id: string;
  name: string;
  artistNames: string[];
  previewUrl: string | null;
  url: string;
  imageUrl: string | null;
};

export type Message =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string; tracks?: Track[] };

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

export function getConversationTitle(messages: Message[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (firstUser && firstUser.content) {
    const text = firstUser.content.trim();
    return text.length > 36 ? `${text.slice(0, 36)}…` : text;
  }
  return "New chat";
}
