import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageRole } from './entities/message.entity';

export type MessagePayload = {
  role: MessageRole;
  content: string;
  tracks?: unknown[];
};

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  /** Create a new conversation for this session. */
  async create(sessionId: string): Promise<Conversation> {
    const conv = this.conversationRepo.create({
      sessionId,
      title: 'New chat',
    });
    return this.conversationRepo.save(conv);
  }

  /** List all conversations for this session (newest first). */
  async findAllBySession(sessionId: string): Promise<Conversation[]> {
    return this.conversationRepo.find({
      where: { sessionId },
      order: { updatedAt: 'DESC' },
    });
  }

  /** Get one conversation by id and sessionId (no messages). Returns null if not found. */
  async findOne(id: string, sessionId: string): Promise<Conversation | null> {
    return this.conversationRepo.findOne({
      where: { id, sessionId },
    });
  }

  /** Get one conversation and its messages. Verifies sessionId so users can't load others' data. */
  async findOneWithMessages(
    id: string,
    sessionId: string,
  ): Promise<Conversation & { messages: Message[] }> {
    const conv = await this.conversationRepo.findOne({
      where: { id, sessionId },
    });
    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }
    const messages = await this.messageRepo.find({
      where: { conversationId: id },
      order: { createdAt: 'ASC' },
    });
    return { ...conv, messages };
  }

  /** Append a message to a conversation. */
  async addMessage(
    conversationId: string,
    payload: MessagePayload,
  ): Promise<Message> {
    const msg = this.messageRepo.create({
      conversationId,
      role: payload.role,
      content: payload.content,
      tracks: payload.tracks ?? null,
    });
    return this.messageRepo.save(msg);
  }

  /** Update the conversation title (e.g. after first user message). */
  async updateTitle(conversationId: string, title: string): Promise<void> {
    await this.conversationRepo.update(
      { id: conversationId },
      { title: title.slice(0, 500) },
    );
  }
}
