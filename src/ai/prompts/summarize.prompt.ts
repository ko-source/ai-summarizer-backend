export const getSummarizePrompt = (text: string): string => {
  return `Analyze the following text and provide a structured summary. Return ONLY a valid JSON object with this exact structure:
{
  "summary": "A concise 2-3 sentence summary",
  "actionItems": ["item1", "item2", ...],
  "risks": ["risk1", "risk2", ...],
  "nextSteps": ["step1", "step2", ...]
}

Text to analyze:
${text}

Return only the JSON object, no additional text or markdown formatting.`;
};
