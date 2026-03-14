import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Track } from './types/track.interface';
import { RecommendationsRequestDto } from './dto/recommendations-request.dto';

/** Raw track shape from Deezer search / artist top. */
type DeezerTrack = {
  id: number;
  title: string;
  artist: { name: string };
  album: { cover_medium?: string; cover?: string };
  preview?: string;
  link: string;
};

/**
 * Service that fetches track suggestions from Deezer based on mood parameters.
 */
@Injectable()
export class DeezerService {
  private mapTrack(t: DeezerTrack): Track {
    return {
      id: String(t.id),
      name: t.title,
      artistNames: [t.artist.name],
      previewUrl: t.preview ?? null,
      url: t.link,
      imageUrl: t.album?.cover_medium ?? t.album?.cover ?? null,
    };
  }

  /**
   * When user asked for a specific artist: search artist by name, then get that artist's top tracks.
   * This guarantees returned tracks are by that artist.
   */
  private async getTracksByArtist(artistName: string, limit = 20): Promise<Track[]> {
    const searchUrl = `https://api.deezer.com/search/artist?q=${encodeURIComponent(
      artistName.trim(),
    )}&limit=1`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];
    const searchData = (await searchRes.json()) as { data?: Array<{ id: number }> };
    const artistId = searchData.data?.[0]?.id;
    if (artistId == null) return [];

    const topUrl = `https://api.deezer.com/artist/${artistId}/top?limit=${limit}`;
    const topRes = await fetch(topUrl);
    if (!topRes.ok) return [];
    const topData = (await topRes.json()) as { data?: DeezerTrack[] };
    const items = topData.data ?? [];
    return items.map((t) => this.mapTrack(t));
  }

  /**
   * Use Deezer's track search (or artist top when artistName is set) and map to Track[].
   */
  async getRecommendations(params: RecommendationsRequestDto): Promise<Track[]> {
    const artistName = params.artistName?.trim();
    if (artistName && artistName.length > 0) {
      const byArtist = await this.getTracksByArtist(artistName);
      if (byArtist.length > 0) return byArtist;
      // If artist not found, fall through to track search below.
    }

    const initialQuery =
      params.deezerQuery && params.deezerQuery.trim().length > 0
        ? params.deezerQuery
        : (params.genres ?? []).join(' ');
    const query = initialQuery.trim();

    const search = async (q: string): Promise<DeezerTrack[]> => {
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
      const data = (await response.json()) as { data: DeezerTrack[] };
      return data.data;
    };

    let items = query ? await search(query) : [];

    if ((!items || items.length === 0) && (params.genres?.length ?? 0) > 0) {
      const fallbackQuery = (params.genres ?? []).join(' ').trim();
      if (fallbackQuery && fallbackQuery !== query) {
        items = await search(fallbackQuery);
      }
    }

    return items.map((t) => this.mapTrack(t));
  }
}
