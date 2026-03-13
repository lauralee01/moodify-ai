import { Body, Controller, Post } from '@nestjs/common';
import { DeezerService } from './deezer.service';
import { RecommendationsRequestDto } from './dto/recommendations-request.dto';
import { Track } from './types/track.interface';

/**
 * MusicController exposes one endpoint: POST /api/recommendations.
 * The frontend (or Postman) sends the same musicParams it got from POST /api/mood.
 * We return a list of tracks so the UI can show cover art, title, artist, preview link, etc.
 */
@Controller('recommendations')
export class MusicController {
  constructor(private readonly deezerService: DeezerService) {}

  @Post()
  async getRecommendations(
    @Body() body: RecommendationsRequestDto,
  ): Promise<{ tracks: Track[] }> {
    const tracks = await this.deezerService.getRecommendations(body);
    return { tracks };
  }
}
