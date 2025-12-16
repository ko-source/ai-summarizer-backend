import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { getSummarizePrompt } from './prompts/summarize.prompt';

export interface SummaryResult {
  summary: string;
  actionItems: string[];
  risks: string[];
  nextSteps: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY as string;
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY not found in environment variables');
    }
    this.apiUrl =
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
  }

  async summarize(text: string): Promise<SummaryResult> {
    if (!this.apiKey) {
      throw new Error('AI API key not configured');
    }

    const prompt = getSummarizePrompt(text);

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const content = this.extractContent(
        response as AxiosResponse<{
          candidates?: Array<{
            content?: {
              parts?: Array<{ text?: string }>;
            };
          }>;
        }>,
      );
      return this.parseResponse(content);
    } catch (error) {
      this.handleError(error);
      throw new Error('Failed to generate summary. Please try again.');
    }
  }

  private extractContent(
    response: AxiosResponse<{
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    }>,
  ): string {
    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response structure from AI service');
    }

    const text = response.data.candidates[0].content.parts[0].text;
    if (!text) {
      throw new Error('Invalid response structure from AI service');
    }
    return text.trim();
  }

  private parseResponse(content: string): SummaryResult {
    const jsonString = this.extractJsonString(content);

    try {
      const parsed: unknown = JSON.parse(jsonString);
      return this.validateAndFormat(parsed);
    } catch (error) {
      this.logger.error('Failed to parse AI response', error);
      return this.createFallbackResponse(content);
    }
  }

  private extractJsonString(content: string): string {
    let jsonString = content;

    jsonString = jsonString
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    return jsonString;
  }

  private validateAndFormat(parsed: unknown): SummaryResult {
    const parsedObj = parsed as {
      summary?: unknown;
      actionItems?: unknown;
      risks?: unknown;
      nextSteps?: unknown;
    };
    return {
      summary: this.ensureString(parsedObj.summary, 'No summary available'),
      actionItems: this.ensureArray(parsedObj.actionItems),
      risks: this.ensureArray(parsedObj.risks),
      nextSteps: this.ensureArray(parsedObj.nextSteps),
    };
  }

  private ensureString(value: unknown, fallback: string): string {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    return fallback;
  }

  private ensureArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .filter(
          (item): item is string =>
            typeof item === 'string' && item.trim() !== '',
        )
        .map((item) => item.trim());
    }
    return [];
  }

  private createFallbackResponse(content: string): SummaryResult {
    return {
      summary: content.substring(0, 200) || 'Summary generation failed',
      actionItems: [],
      risks: [],
      nextSteps: [],
    };
  }

  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `AI API Error: ${axiosError.message}`,
        axiosError.response?.data,
      );
    } else {
      this.logger.error('Unexpected error in AI service', error);
    }
  }
}
