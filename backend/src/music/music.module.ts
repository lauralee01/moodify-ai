import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { DeezerService } from './deezer.service';

@Module({
  controllers: [MusicController],
  providers: [DeezerService],
  exports: [DeezerService],
})
export class MusicModule {}
