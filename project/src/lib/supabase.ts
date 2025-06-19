import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Content {
  id: string;
  type: 'video' | 'quiz';
  title: string;
  description: string;
  content_data: {
    video_url?: string;
    questions?: {
      question: string;
      options: {
        text: string;
        isCorrect: boolean;
      }[];
    }[];
  };
  scheduled_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TelegramUser {
  id: string;
  telegram_id: string;
  username: string;
  first_name: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentDeliveryLog {
  id: string;
  content_id: string;
  user_id: string;
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
  delivered_at: string;
  created_at: string;
}

export interface BotSettings {
  id: string;
  greeting_message: string;
  tone_of_voice: 'friendly' | 'professional' | 'casual' | 'formal';
  perplexity_api_key: string;
  telegram_bot_token: string;
  created_at: string;
  updated_at: string;
}

export interface ChatHistory {
  id: string;
  user_id: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
  created_at: string;
  updated_at: string;
}

// Type-safe database interface
export type Database = {
  public: {
    Tables: {
      telegram_users: {
        Row: TelegramUser;
        Insert: Omit<TelegramUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TelegramUser, 'id' | 'created_at' | 'updated_at'>>;
      };
      content: {
        Row: Content;
        Insert: Omit<Content, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Content, 'id' | 'created_at' | 'updated_at'>>;
      };
      content_delivery_logs: {
        Row: ContentDeliveryLog;
        Insert: Omit<ContentDeliveryLog, 'id' | 'created_at'>;
        Update: Partial<Omit<ContentDeliveryLog, 'id' | 'created_at'>>;
      };
      bot_settings: {
        Row: BotSettings;
        Insert: Omit<BotSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BotSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      chat_history: {
        Row: ChatHistory;
        Insert: Omit<ChatHistory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ChatHistory, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};

// Export typed client
export const typedSupabase = supabase as ReturnType<typeof createClient<Database>>;
