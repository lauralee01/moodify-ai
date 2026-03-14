const STORAGE_KEY = "moodify_session_id";

/**
 * Get or create a session ID for this browser. Stored in localStorage so
 * conversations persist across refreshes and are tied to this "user" until
 * they clear storage.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
