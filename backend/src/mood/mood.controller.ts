import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { MoodService, MoodResponse } from './mood.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationsService } from '../conversations/conversations.service';
import { DeezerService } from '../music/deezer.service';
import { Track } from '../music/types/track.interface';

export type SendMessageResponse = {
  reply: string;
  tracks: Track[];
  conversationId: string;
};

@Controller('mood')
export class MoodController {
  constructor(
    private readonly moodService: MoodService,
    private readonly conversationsService: ConversationsService,
    private readonly deezerService: DeezerService,
  ) {}

  /** Analyze mood only (no DB, no recommendations). Used when frontend doesn't send sessionId. */
  @Post()
  async create(@Body() body: CreateMoodDto): Promise<MoodResponse> {
    return this.moodService.analyzeMood(body.message);
  }

  /**
   * Full flow: persist user message, run mood + recommendations, persist assistant message.
   * Returns reply, tracks, and conversationId so the frontend can show the reply and use the same conversation for the next message.
   */
  @Post('send')
  async send(@Body() body: SendMessageDto): Promise<SendMessageResponse> {
    const { message, sessionId, conversationId: existingId } = body;
    const trimmed = message?.trim();
    if (!trimmed || !sessionId?.trim()) {
      throw new BadRequestException('message and sessionId are required');
    }

    // 1) Get or create conversation
    let conversationId: string;
    if (existingId?.trim()) {
      const conv = await this.conversationsService.findOne(
        existingId.trim(),
        sessionId.trim(),
      );
      if (!conv) throw new BadRequestException('Conversation not found');
      conversationId = conv.id;
    } else {
      const conv = await this.conversationsService.create(sessionId.trim());
      conversationId = conv.id;
    }

    // 2) Save user message
    await this.conversationsService.addMessage(conversationId, {
      role: 'user',
      content: trimmed,
    });

    // 3) Mood analysis (Gemini)
    const moodResult = await this.moodService.analyzeMood(trimmed);
    const deezerQuery =
      moodResult.musicParams.deezerQuery ??
      moodResult.musicParams.genres?.join(' ') ??
      '';
    const artistName = moodResult.musicParams.artistName;

    // 4) Recommendations (Deezer)
    const tracks = await this.deezerService.getRecommendations({
      deezerQuery,
      genres: moodResult.musicParams.genres,
      artistName,
    });

    // 5) Save assistant message
    await this.conversationsService.addMessage(conversationId, {
      role: 'assistant',
      content: moodResult.reply,
      tracks: tracks.length ? (tracks as unknown[]) : undefined,
    });

    // 6) Update conversation title from first user message (trimmed)
    const title =
      trimmed.length > 36 ? `${trimmed.slice(0, 36)}…` : trimmed;
    await this.conversationsService.updateTitle(conversationId, title);

    return {
      reply: moodResult.reply,
      tracks,
      conversationId,
    };
  }
}

