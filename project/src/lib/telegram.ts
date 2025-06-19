import { getSettings } from './storage';

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    message: TelegramMessage;
    data: string;
  };
}

class TelegramBot {
  private token: string;
  private webhookUrl: string | null = null;
  private messageHandlers: Map<string, (message: TelegramMessage) => Promise<void>> = new Map();
  private callbackHandlers: Map<string, (callback: any) => Promise<void>> = new Map();

  constructor() {
    const settings = getSettings();
    this.token = settings?.telegram_bot_token || '';
  }

  async initialize() {
    if (!this.token) {
      throw new Error('Telegram bot token not found');
    }

    // Test the bot token
    const response = await fetch(`https://api.telegram.org/bot${this.token}/getMe`);
    const data = await response.json();

    if (!data.ok) {
      throw new Error('Invalid Telegram bot token');
    }

    return data.result;
  }

  async sendMessage(chatId: number, text: string, options: any = {}) {
    const response = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...options,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Failed to send message: ${data.description}`);
    }

    return data.result;
  }

  async sendVideo(chatId: number, videoUrl: string, caption?: string) {
    const response = await fetch(`https://api.telegram.org/bot${this.token}/sendVideo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        video: videoUrl,
        caption,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Failed to send video: ${data.description}`);
    }

    return data.result;
  }

  async sendQuiz(chatId: number, question: string, options: string[], correctOptionId: number) {
    const response = await fetch(`https://api.telegram.org/bot${this.token}/sendPoll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        question,
        options,
        correct_option_id: correctOptionId,
        type: 'quiz',
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Failed to send quiz: ${data.description}`);
    }

    return data.result;
  }

  onMessage(pattern: string, handler: (message: TelegramMessage) => Promise<void>) {
    this.messageHandlers.set(pattern, handler);
  }

  onCallback(pattern: string, handler: (callback: any) => Promise<void>) {
    this.callbackHandlers.set(pattern, handler);
  }

  async handleUpdate(update: TelegramUpdate) {
    if (update.message) {
      const message = update.message;
      for (const [pattern, handler] of this.messageHandlers) {
        if (message.text?.match(new RegExp(pattern))) {
          await handler(message);
          break;
        }
      }
    }

    if (update.callback_query) {
      const callback = update.callback_query;
      for (const [pattern, handler] of this.callbackHandlers) {
        if (callback.data.match(new RegExp(pattern))) {
          await handler(callback);
          break;
        }
      }
    }
  }
}

export const telegramBot = new TelegramBot();