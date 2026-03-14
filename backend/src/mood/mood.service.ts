import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MusicParams } from './types/music-params.interface';

export interface MoodResponse {
  /** Short, human-friendly reply to show in the chat UI. */
  reply: string;
  /** Structured parameters we will later feed into Deezer. */
  musicParams: MusicParams;
}

@Injectable()
export class MoodService {
  private readonly model;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in the environment');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
    });
  }

  async analyzeMood(message: string): Promise<MoodResponse> {
    const systemInstruction = `
You are MoodifyAI, a friendly music mood assistant.

Your job:
- Read the user's message about how they feel or what they want to listen to.
- Decide suitable music parameters for a music recommendation API (Deezer).

Respond with ONLY valid JSON, no backticks, no extra text.

JSON shape:
{
  "reply": string,
  "musicParams": {
    "genres": string[],
    "energy": number,
    "valence": number,
    "acousticness": number,
    "tempoBpm"?: number,
    "deezerQuery": string,
    "artistName"?: string
  }
}

Rules:
- Always return valid JSON.
- "genres" must be simple, common genres or moods (e.g. "acoustic", "ambient", "lofi", "afrobeats", "gospel", "rock").
- Clamp numeric values to 0–1.
- "deezerQuery" MUST be 1–3 short keywords that Deezer search can match.
- Deezer-friendly queries include:
  - genres ("acoustic", "ambient", "lofi", "afrobeats")
  - genre pairs ("acoustic chill", "ambient sleep", "lofi study")
  - artist names ("ed sheeran acoustic", "yiruma piano", "burna boy afrobeats")
- DO NOT generate descriptive phrases like "sweet peaceful acoustic melodies".
- DO NOT generate full sentences.
- DO NOT include filler words like "songs", "music", "please", "some".
- DO NOT include mood adjectives unless they are genres (e.g. "chill" is OK, "peaceful" is NOT).
- Always include at least one strong genre keyword.
- If the user mentions a region or culture, include it (e.g. "nigerian gospel", "korean ballad").
- If the user asks for a specific artist or band by name, set "artistName" to that name exactly (e.g. "Nathaniel Bassey", "Burna Boy"). Use the spelling the user used. Leave "artistName" out or null if no specific artist is requested.
`;

    const prompt = `${systemInstruction}\n\nUser message:\n${message}`;

    try {
      const result = await this.model.generateContent([prompt]);
      const text = result.response.text();
      const parsed = JSON.parse(text) as MoodResponse;
      return parsed;
    } catch (error) {
      console.error('Gemini analyzeMood error:', error);
      // For now we surface a generic error; later we can log details.
      throw new InternalServerErrorException(
        'Failed to analyze mood with Gemini',
      );
    }
  }
}
