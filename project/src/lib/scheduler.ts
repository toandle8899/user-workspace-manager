import { supabase } from './supabase';
import type { Content, TelegramUser } from './supabase';
import { telegramBot } from './telegram';

class ContentScheduler {
  private isProcessing = false;

  async processScheduledContent() {
    if (this.isProcessing) return;
    
    try {
      this.isProcessing = true;
      const now = new Date();

      // Get all scheduled content that's due
      const { data: scheduledContent, error } = await supabase
        .from('content')
        .select('*')
        .eq('is_active', true)
        .lte('scheduled_time', now.toISOString());

      if (error) throw error;

      // Process each content item
      for (const content of (scheduledContent || [])) {
        await this.deliverContent(content);
      }
    } catch (error) {
      console.error('Error processing scheduled content:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async deliverContent(content: Content) {
    try {
      // Get all active users
      const { data: users, error: usersError } = await supabase
        .from('telegram_users')
        .select('id, telegram_id')
        .eq('is_active', true);

      if (usersError) throw usersError;

      // Send content to each user
      for (const user of (users || [])) {
        try {
          if (content.type === 'video' && content.content_data.video_url) {
            await telegramBot.sendVideo(
              user.telegram_id, 
              content.content_data.video_url,
              `${content.title}\n\n${content.description || ''}`
            );
          } else if (content.type === 'quiz' && content.content_data.questions?.length) {
            // Send quiz title and description first
            await telegramBot.sendMessage(
              user.telegram_id,
              `📝 ${content.title}\n\n${content.description || ''}`
            );

            // Send each question as a separate quiz
            for (const question of content.content_data.questions) {
              const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
              if (correctOptionIndex === -1) {
                console.error('No correct answer found for question:', question);
                continue;
              }

              await telegramBot.sendQuiz(
                user.telegram_id,
                question.question,
                question.options.map(opt => opt.text),
                correctOptionIndex
              );
            }
          }

          // Log successful delivery
          await supabase
            .from('content_delivery_logs')
            .insert({
              content_id: content.id,
              user_id: user.id,
              status: 'success',
              delivered_at: new Date().toISOString()
            });
        } catch (error) {
          // Log failed delivery
          await supabase
            .from('content_delivery_logs')
            .insert({
              content_id: content.id,
              user_id: user.id,
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
              delivered_at: new Date().toISOString()
            });
        }
      }

      // Mark content as inactive after sending
      await supabase
        .from('content')
        .update({ is_active: false })
        .eq('id', content.id);

    } catch (error) {
      console.error('Error delivering content:', error);
      throw error;
    }
  }

  async forceSendContent(type: 'video' | 'quiz') {
    try {
      // Get all active content of specified type
      const { data: content, error } = await supabase
        .from('content')
        .select('*')
        .eq('type', type)
        .eq('is_active', true);

      if (error) throw error;

      // Process each content item
      for (const item of (content || [])) {
        await this.deliverContent(item);
      }

      return true;
    } catch (error) {
      console.error('Error force sending content:', error);
      throw error;
    }
  }

  startScheduler(intervalMinutes = 1) {
    // Check for scheduled content every minute
    setInterval(() => {
      this.processScheduledContent();
    }, intervalMinutes * 60 * 1000);

    console.log('Content scheduler started');
  }
}

export const contentScheduler = new ContentScheduler();
