import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_BOT_TOKEN = '7596530494:AAGNH2Q6L-Fk2cfE-Z452r099zF55P1P870';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    // Check for scheduled videos
    const { data: videos } = await supabase
      .from('videos')
      .select('*')
      .eq('status', 'scheduled')
      .eq('scheduled_date', currentDate)
      .lte('scheduled_time', currentTime);

    // Check for scheduled quizzes
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('*')
      .eq('status', 'scheduled')
      .eq('scheduled_date', currentDate)
      .lte('scheduled_time', currentTime);

    // Get all active users
    const { data: users } = await supabase
      .from('telegram_users')
      .select('telegram_id')
      .eq('is_active', true);

    if (!users || users.length === 0) {
      return new Response('No active users', { headers: corsHeaders });
    }

    let sentCount = 0;

    // Send scheduled videos
    if (videos && videos.length > 0) {
      for (const video of videos) {
        for (const user of users) {
          try {
            await sendTelegramVideo(
              parseInt(user.telegram_id),
              video.video_url,
              `📚 <b>${video.title}</b>\n\n${video.description}`
            );
            sentCount++;
          } catch (error) {
            console.error(`Failed to send video to user ${user.telegram_id}:`, error);
          }
        }

        // Mark video as sent
        await supabase
          .from('videos')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', video.id);
      }
    }

    // Send scheduled quizzes
    if (quizzes && quizzes.length > 0) {
      for (const quiz of quizzes) {
        for (const user of users) {
          try {
            // Send quiz introduction
            await sendTelegramMessage(
              parseInt(user.telegram_id),
              `🧠 <b>${quiz.title}</b>\n\n${quiz.description}\n\nGet ready for the quiz!`
            );

            // Send each question as a poll
            for (const question of quiz.questions) {
              const options = question.options.map((opt: any) => opt.text);
              const correctIndex = question.options.findIndex((opt: any) => opt.isCorrect);
              
              await sendTelegramPoll(
                parseInt(user.telegram_id),
                question.question,
                options,
                correctIndex
              );
            }
            sentCount++;
          } catch (error) {
            console.error(`Failed to send quiz to user ${user.telegram_id}:`, error);
          }
        }

        // Mark quiz as sent
        await supabase
          .from('quizzes')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', quiz.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed scheduled content. Sent ${sentCount} items.`,
        videos: videos?.length || 0,
        quizzes: quizzes?.length || 0,
        users: users.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scheduler error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendTelegramMessage(chatId: number, text: string) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.statusText}`);
  }

  return response.json();
}

async function sendTelegramVideo(chatId: number, videoUrl: string, caption?: string) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      video: videoUrl,
      caption,
      parse_mode: 'HTML',
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.statusText}`);
  }

  return response.json();
}

async function sendTelegramPoll(chatId: number, question: string, options: string[], correctIndex: number) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPoll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      question,
      options,
      type: 'quiz',
      correct_option_id: correctIndex,
      is_anonymous: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.statusText}`);
  }

  return response.json();
}