/**
 * Body for the "send message" flow: mood + recommendations + persist to DB.
 * When sessionId is provided, the message and reply are saved and linked to a conversation.
 */
export class SendMessageDto {
  /** User's message (e.g. "I feel chill, play something by Wizkid"). */
  message!: string;
  /** Identifies the browser/session so we only return that session's conversations. */
  sessionId!: string;
  /** If provided, append to this conversation; otherwise create a new one. */
  conversationId?: string;
}
