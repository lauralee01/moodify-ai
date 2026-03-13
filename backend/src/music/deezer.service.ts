import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Track } from './types/track.interface';
import { RecommendationsRequestDto } from './dto/recommendations-request.dto';

/**
 * Service that fetches track suggestions from Deezer based on mood parameters.
 */
@Injectable()
export class DeezerService {
  /**
   * Use Deezer's search API and map the result to Track[].
   */
  async getRecommendations(params: RecommendationsRequestDto): Promise<Track[]> {
    const initialQuery =
      params.deezerQuery && params.deezerQuery.trim().length > 0
        ? params.deezerQuery
        : (params.genres ?? []).join(' ');
    const query = initialQuery.trim();

    const search = async (q: string) => {
      const url = `https://api.deezer.com/search?q=${encodeURIComponent(
        q,
      )}&limit=20`;
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new InternalServerErrorException(
          `Deezer search failed: ${response.status} ${text}`,
        );
      }
      const data = (await response.json()) as {
        data: Array<{
          id: number;
          title: string;
          artist: { name: string };
          album: { cover_medium?: string; cover?: string };
          preview?: string;
          link: string;
        }>;
      };
      console.log('data.data', data.data);
      return data.data;
    };

    // First try with the LLM-provided query
    let items = query ? await search(query) : [];

    // Fallback: if nothing found and we have genres, try a simpler genre-only query.
    if ((!items || items.length === 0) && (params.genres?.length ?? 0) > 0) {
      const fallbackQuery = (params.genres ?? []).join(' ').trim();
      if (fallbackQuery && fallbackQuery !== query) {
        items = await search(fallbackQuery);
      }
    }
    console.log('items', items);

    return items.map((t) => ({
      id: String(t.id),
      name: t.title,
      artistNames: [t.artist.name],
      previewUrl: t.preview ?? null,
      url: t.link,
      imageUrl: t.album?.cover_medium ?? t.album?.cover ?? null,
    }));
  }

  // No more numeric heuristics here; we rely on the LLM's deezerQuery.
}
