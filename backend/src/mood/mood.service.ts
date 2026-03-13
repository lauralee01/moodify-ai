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
- Decide suitable music parameters for a music recommendation API (for example, Deezer).

Respond with **ONLY valid JSON**, no backticks, no extra text.

JSON shape:
{
  "reply": string,            // a short, 1–2 sentence reply for the user
  "musicParams": {
    "genres": string[],       // 1–5 genre or mood labels like ["chill", "indie-pop"]
    "energy": number,         // 0.0–1.0 (0 = very calm, 1 = very energetic)
    "valence": number,        // 0.0–1.0 (0 = sad, 1 = very happy)
    "acousticness": number,   // 0.0–1.0 (0 = electronic, 1 = acoustic/organic)
    "tempoBpm"?: number,      // optional, typical BPM like 60–180
    "deezerQuery": string     // a good search phrase for Deezer search, e.g. "calm acoustic ambient relax"
  }
}

Rules:
- Always return valid JSON.
- Keep "genres" simple words that common music services could understand as seed genres.
- Clamp numeric values to the 0–1 range where specified.
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
