import { Body, Controller, Post } from '@nestjs/common';
import { MoodService, MoodResponse } from './mood.service';
import { CreateMoodDto } from './dto/create-mood.dto';

@Controller('mood')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post()
  async create(@Body() body: CreateMoodDto): Promise<MoodResponse> {
    // For now we only need the message; later we can add history, tags, etc.
    return this.moodService.analyzeMood(body.message);
  }
}

