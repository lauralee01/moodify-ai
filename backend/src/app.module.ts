import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationsModule } from './conversations/conversations.module';
import { MoodModule } from './mood/mood.module';
import { MusicModule } from './music/music.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Step 1: Connect to PostgreSQL. TypeORM will use DATABASE_URL from .env.
    // We use forRootAsync so we can inject ConfigService and read the URL at runtime.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true, // Load entities from modules we register with TypeOrmModule.forFeature()
        synchronize: true, // In dev: create/update tables from entities. Set false in production and use migrations.
      }),
      inject: [ConfigService],
    }),
    ConversationsModule,
    MoodModule,
    MusicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
