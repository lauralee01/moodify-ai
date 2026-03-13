export interface MusicParams {
  /** Suggested Deezer seed genres, e.g. ['chill', 'indie'] */
  genres: string[];
  /**
   * Overall energy of the music: 0 = very calm, 1 = very intense.
   * Will later map to Deezer target_energy.
   */
  energy: number;
  /**
   * Valence = how positive/happy the music feels.
   * 0 = very sad, 1 = very happy.
   */
  valence: number;
  /**
   * How acoustic/organic the music should feel.
   * 0 = very electronic, 1 = very acoustic.
   */
  acousticness: number;
  /** Optional tempo suggestion in BPM (e.g. 70 for chill, 130 for upbeat). */
  tempoBpm?: number;
  /**
   * Search phrase that should work well with Deezer's search API
   * (e.g. "calm acoustic ambient piano relax").
   */
  deezerQuery?: string;
}

