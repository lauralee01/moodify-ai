import { Module } from '@nestjs/common';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { MusicModule } from '../music/music.module';

@Module({
  imports: [ConversationsModule, MusicModule],
  controllers: [MoodController],
  providers: [MoodService],
})
export class MoodModule {}

