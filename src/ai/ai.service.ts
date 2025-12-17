import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { getSummarizePrompt } from './prompts/summarize.prompt';
import { GeminiApiResponse, SummaryData } from '../interfaces/ai-interfaces';

@Injectable()
export class AiService {
  private readonly apiKey = process.env.GEMINI_API_KEY as string;
  private readonly apiUrl =
    'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

  async summarize(text: string): Promise<SummaryData> {
    const response: AxiosResponse<GeminiApiResponse> = await axios.post(
      `${this.apiUrl}?key=${this.apiKey}`,
      { contents: [{ parts: [{ text: getSummarizePrompt(text) }] }] },
      { timeout: 30000, headers: { 'Content-Type': 'application/json' } },
    );

    const textContent =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const content = typeof textContent === 'string' ? textContent.trim() : '';

    const cleanedContent = content
      .replace(/```json?\n?/g, '')
      .replace(/```/g, '')
      .trim();

    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    const jsonToParse =
      jsonMatch && jsonMatch[0] ? jsonMatch[0] : cleanedContent;

    let parsed: SummaryData = {};
    try {
      const parsedValue: unknown = JSON.parse(jsonToParse);
      if (
        typeof parsedValue === 'object' &&
        parsedValue !== null &&
        !Array.isArray(parsedValue)
      ) {
        parsed = parsedValue;
      }
    } catch {
      parsed = {};
    }

    return {
      summary:
        typeof parsed.summary === 'string' && parsed.summary.trim()
          ? parsed.summary.trim()
          : content.substring(0, 200) || 'No summary available',
      actionItems: this.parseStringArray(parsed.actionItems),
      risks: this.parseStringArray(parsed.risks),
      nextSteps: this.parseStringArray(parsed.nextSteps),
    };
  }

  private parseStringArray(value: string[] | undefined): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim());
  }
}
