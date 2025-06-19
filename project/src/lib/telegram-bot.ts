import TelegramBot from 'node-telegram-bot-api';
import { supabase } from './supabase';
import axios from 'axios';
import schedule from 'node-schedule';

let bot: TelegramBot | null = null;

export async function initializeBot() {
  const { data: settings } = await supabase
    .from('bot_settings')
    .select('*')
    .single();

  if (!settings) {
    throw new Error('Bot settings not found');
  }

  bot = new TelegramBot(settings.telegram_bot_token, { polling: true });

  // Handle /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;

    if (!user) return;

    // Save or update user in database
    const { error } = await supabase
      .from('users')
      .upsert({
        telegram_id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      });

    if (error) {
      console.error('Error saving user:', error);
      return;
    }

    // Send welcome message
    await bot?.sendMessage(chatId, settings.greeting_message);
  });

  // Handle regular messages for AI chat
  bot.on('message', async (msg) => {
    if (msg.text && !msg.text.startsWith('/')) {
      const chatId = msg.chat.id;
      
      try {
        // Call Perplexity API
        const response = await axios.post(
          'https://api.perplexity.ai/chat/completions',
          {
            model: 'pplx-7b-online',
            messages: [{ role: 'user', content: msg.text }],
          },
          {
            headers: {
              'Authorization': `Bearer ${settings.perplexity_api_key}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const aiResponse = response.data.choices[0].message.content;
        await bot?.sendMessage(chatId, aiResponse);
      } catch (error) {
        console.error('Error calling Perplexity API:', error);
        await bot?.sendMessage(chatId, 'Sorry, I encountered an error while processing your message.');
      }
    }
  });

  // Schedule content delivery
  scheduleContentDelivery();
}

async function scheduleContentDelivery() {
  // Get all active content
  const { data: content } = await supabase
    .from('content')
    .select('*')
    .eq('is_active', true);

  if (!content) return;

  // Get all users
  const { data: users } = await supabase
    .from('users')
    .select('*');

  if (!users) return;

  // Schedule each content item
  content.forEach((item) => {
    const scheduledTime = new Date(item.scheduled_time);
    
    schedule.scheduleJob(scheduledTime, async () => {
      // Send content to all users
      for (const user of users) {
        try {
          if (item.type === 'video') {
            await bot?.sendMessage(
              user.telegram_id,
              `${item.title}\n\n${item.description || ''}\n\n${(item.content_data as any).video_url}`
            );
          } else if (item.type === 'quiz') {
            const questions = (item.content_data as any).questions;
            for (const question of questions) {
              const options = question.options
                .map((opt: string, idx: number) => `${idx + 1}. ${opt}`)
                .join('\n');
              
              await bot?.sendMessage(
                user.telegram_id,
                `${question.question}\n\n${options}`
              );
            }
          }

          // Log successful delivery
          await supabase
            .from('content_delivery_logs')
            .insert({
              content_id: item.id,
              user_id: user.id,
              status: 'success',
            });
        } catch (error) {
          console.error('Error delivering content:', error);
          
          // Log failed delivery
          await supabase
            .from('content_delivery_logs')
            .insert({
              content_id: item.id,
              user_id: user.id,
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
      }
    });
  });
}

export function stopBot() {
  if (bot) {
    bot.stopPolling();
    bot = null;
  }
} 