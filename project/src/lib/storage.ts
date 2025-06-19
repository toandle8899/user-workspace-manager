// Types
export interface Content {
  id: string;
  type: 'video' | 'quiz';
  title: string;
  description: string;
  content_data: {
    video_url?: string;
    questions?: Array<{
      question: string;
      options: string[];
      correct_answer: number;
    }>;
  };
  scheduled_time: string;
  is_active: boolean;
  created_at: string;
}

export interface BotSettings {
  greeting_message: string;
  perplexity_api_key: string;
  telegram_bot_token: string;
}

// Storage keys
const CONTENT_KEY = 'learning_cms_content';
const SETTINGS_KEY = 'learning_cms_settings';

// Helper functions
function getItem<T>(key: string): T | null {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Content functions
export function getContent(): Content[] {
  return getItem<Content[]>(CONTENT_KEY) || [];
}

export function addContent(content: Omit<Content, 'id' | 'created_at'>): Content {
  const contents = getContent();
  const newContent: Content = {
    ...content,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  setItem(CONTENT_KEY, [...contents, newContent]);
  return newContent;
}

export function updateContent(id: string, content: Partial<Content>): Content | null {
  const contents = getContent();
  const index = contents.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  const updatedContent = { ...contents[index], ...content };
  contents[index] = updatedContent;
  setItem(CONTENT_KEY, contents);
  return updatedContent;
}

export function deleteContent(id: string): boolean {
  const contents = getContent();
  const filtered = contents.filter(c => c.id !== id);
  if (filtered.length === contents.length) return false;
  
  setItem(CONTENT_KEY, filtered);
  return true;
}

// Settings functions
export function getSettings(): BotSettings | null {
  return getItem<BotSettings>(SETTINGS_KEY);
}

export function updateSettings(settings: Partial<BotSettings>): BotSettings {
  const currentSettings = getSettings() || {
    greeting_message: 'Welcome to our learning platform! 👋',
    perplexity_api_key: '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',
    telegram_bot_token: '7596530494:AAGNH2Q6L-Fk2cfE-Z452r099zF55P1P870',
  };
  
  const updatedSettings = { ...currentSettings, ...settings };
  setItem(SETTINGS_KEY, updatedSettings);
  return updatedSettings;
} 