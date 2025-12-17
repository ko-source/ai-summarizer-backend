export interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export interface SummaryData {
  summary?: string;
  actionItems?: string[];
  risks?: string[];
  nextSteps?: string[];
}
