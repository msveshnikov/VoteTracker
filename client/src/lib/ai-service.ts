// This is a simplified AI service simulation
// In a production environment, this would connect to a real AI API like OpenAI/Gemini

interface AIServiceOptions {
  apiKey?: string;
}

export class AIService {
  private apiKey: string | undefined;
  
  constructor(options: AIServiceOptions = {}) {
    this.apiKey = options.apiKey || import.meta.env.VITE_AI_API_KEY;
  }
  
  async getTopicSuggestions(context?: string): Promise<string[]> {
    // In a real implementation, this would call an AI service API
    // For now, we'll fetch from our local API endpoint
    try {
      const response = await fetch('/api/suggestions');
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Error fetching topic suggestions:', error);
      return this.getFallbackSuggestions();
    }
  }
  
  private getFallbackSuggestions(): string[] {
    // Fallback suggestions if the API call fails
    return [
      "Should universal healthcare be implemented globally?",
      "Is cryptocurrency the future of money?",
      "Should self-driving cars be allowed on public roads?",
      "Are streaming services better than traditional television?",
      "Should college education be free for all citizens?"
    ];
  }
}

export const aiService = new AIService();
