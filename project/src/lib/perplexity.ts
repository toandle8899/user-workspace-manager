import { supabase } from './supabase';
import type { Content } from './supabase';

interface ChatOptions {
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

interface QuizQuestion {
  question: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
}

interface VideoSuggestion {
  title: string;
  description: string;
  key_points: string[];
  recommended_duration: string;
  target_audience: 'Beginner' | 'Intermediate' | 'Advanced';
}

class PerplexityAI {
  private apiKey: string = import.meta.env.VITE_PERPLEXITY_API_KEY;

  async initialize() {
    if (!this.apiKey) {
      console.error('Perplexity API key not found in environment variables');
      return;
    }
    console.log('Perplexity AI initialized successfully');
  }

  async chatWithUser(message: string, options: ChatOptions = {}) {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not initialized');
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-instruct',
          messages: [
            {
              role: 'system',
              content: options.systemPrompt || 'You are a helpful educational assistant.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error in Perplexity chat:', error);
      throw error;
    }
  }

  async generateQuizQuestions(topic: string, numQuestions: number = 3): Promise<QuizQuestion[]> {
    const prompt = `Generate ${numQuestions} multiple-choice questions about ${topic}. 
    Format each question as a JSON object with the following structure:
    {
      "question": "The question text",
      "options": [
        { "text": "Option 1", "isCorrect": false },
        { "text": "Option 2", "isCorrect": true },
        { "text": "Option 3", "isCorrect": false },
        { "text": "Option 4", "isCorrect": false }
      ],
      "explanation": "Brief explanation of why the correct answer is correct"
    }
    Return an array of these question objects. Make sure exactly one option is marked as correct for each question.`;

    const response = await this.chatWithUser(prompt);
    try {
      // Extract JSON array from the response
      const jsonStr = response.match(/\[[\s\S]*\]/)?.[0];
      if (!jsonStr) throw new Error('No valid JSON found in response');
      
      const questions: QuizQuestion[] = JSON.parse(jsonStr);
      
      // Validate the questions
      for (const question of questions) {
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
          throw new Error('Each question must have exactly one correct answer');
        }
      }
      
      return questions;
    } catch (error) {
      console.error('Error parsing quiz questions:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }

  async suggestVideoContent(topic: string): Promise<VideoSuggestion> {
    const prompt = `Suggest educational video content about ${topic}.
    Format the response as a JSON object with the following structure:
    {
      "title": "Suggested video title",
      "description": "Brief description of the video content (2-3 sentences)",
      "key_points": ["Point 1", "Point 2", "Point 3"],
      "recommended_duration": "5-10 minutes",
      "target_audience": "Beginner" | "Intermediate" | "Advanced"
    }`;

    const response = await this.chatWithUser(prompt);
    try {
      // Extract JSON object from the response
      const jsonStr = response.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStr) throw new Error('No valid JSON found in response');
      
      const suggestion: VideoSuggestion = JSON.parse(jsonStr);
      
      // Validate the suggestion
      if (!suggestion.title || !suggestion.description || !suggestion.key_points?.length) {
        throw new Error('Invalid video suggestion format');
      }
      
      return suggestion;
    } catch (error) {
      console.error('Error parsing video suggestion:', error);
      throw new Error('Failed to generate video content suggestion');
    }
  }

  async generateContent(type: Content['type'], topic: string): Promise<Omit<Content, 'id' | 'created_at' | 'updated_at'>> {
    if (type === 'quiz') {
      const questions = await this.generateQuizQuestions(topic);
      return {
        type: 'quiz',
        title: `Quiz: ${topic}`,
        description: `Test your knowledge about ${topic}`,
        content_data: { questions },
        scheduled_time: new Date().toISOString(),
        is_active: true
      };
    } else {
      const suggestion = await this.suggestVideoContent(topic);
      return {
        type: 'video',
        title: suggestion.title,
        description: suggestion.description,
        content_data: { video_url: '' }, // URL to be filled in manually
        scheduled_time: new Date().toISOString(),
        is_active: true
      };
    }
  }
}

export const perplexityAI = new PerplexityAI();
