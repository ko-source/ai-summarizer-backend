import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { getSummarizePrompt } from './prompts/summarize.prompt';
import { GeminiApiResponse, SummaryData } from '../interfaces/ai-interfaces';
import { parseStringArray } from '../utils/ai-helper';

@Injectable()
export class AiService {
  private readonly apiKey = process.env.GEMINI_API_KEY;
  private readonly apiUrl =
    'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

  async summarize(inputText: string): Promise<SummaryData> {
    const geminiResponse: AxiosResponse<GeminiApiResponse> = await axios.post(
      `${this.apiUrl}?key=${this.apiKey}`,
      { contents: [{ parts: [{ text: getSummarizePrompt(inputText) }] }] },
      { timeout: 30000, headers: { 'Content-Type': 'application/json' } },
    );

    const rawAiText =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const trimmedAiText = typeof rawAiText === 'string' ? rawAiText.trim() : '';

    const sanitizedContent = trimmedAiText
      .replace(/```json?\n?/g, '')
      .replace(/```/g, '')
      .trim();

    const jsonMatchResult = sanitizedContent.match(/\{[\s\S]*\}/);
    const jsonPayload =
      jsonMatchResult && jsonMatchResult[0]
        ? jsonMatchResult[0]
        : sanitizedContent;

    let summaryData: SummaryData = {};
    try {
      const parsedJson: SummaryData = JSON.parse(jsonPayload) as SummaryData;
      if (
        typeof parsedJson === 'object' &&
        parsedJson !== null &&
        !Array.isArray(parsedJson)
      ) {
        summaryData = parsedJson;
      }
    } catch {
      summaryData = {};
    }

    return {
      summary:
        typeof summaryData.summary === 'string' && summaryData.summary.trim()
          ? summaryData.summary.trim()
          : trimmedAiText.substring(0, 200) || 'No summary available',
      actionItems: parseStringArray(summaryData.actionItems),
      risks: parseStringArray(summaryData.risks),
      nextSteps: parseStringArray(summaryData.nextSteps),
    };
  }
}
