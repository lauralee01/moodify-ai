import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  /** List conversations for this session (newest first). */
  @Get()
  async list(
    @Query('sessionId') sessionId: string,
  ): Promise<Conversation[]> {
    if (!sessionId?.trim()) {
      return [];
    }
    return this.conversationsService.findAllBySession(sessionId.trim());
  }

  /** Get one conversation with all messages. Requires sessionId so only the owner can load it. */
  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Query('sessionId') sessionId: string,
  ): Promise<Conversation & { messages: Message[] }> {
    return this.conversationsService.findOneWithMessages(id, sessionId?.trim() ?? '');
  }

  /** Create a new conversation for this session. */
  @Post()
  async create(@Body('sessionId') sessionId: string): Promise<Conversation> {
    return this.conversationsService.create(sessionId?.trim() ?? '');
  }
}
