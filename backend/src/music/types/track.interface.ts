/**
 * Shape of a track we return to the frontend.
 * We keep this independent from any specific music provider (Spotify, Deezer, etc.).
 */
export interface Track {
  id: string;
  name: string;
  artistNames: string[];
  previewUrl: string | null;
  url: string;
  imageUrl: string | null;
}
