import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoodModule } from './mood/mood.module';
import { MusicModule } from './music/music.module';

@Module({
  imports: [
    // Loads variables from backend/.env and makes ConfigService available app-wide.
    ConfigModule.forRoot({ isGlobal: true }),
    MoodModule,
    MusicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
