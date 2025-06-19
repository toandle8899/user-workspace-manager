import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
  };
}

const TELEGRAM_BOT_TOKEN = '7596530494:AAGNH2Q6L-Fk2cfE-Z452r099zF55P1P870';
const PERPLEXITY_API_KEY = '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';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const update: TelegramUpdate = await req.json();
    
    if (!update.message) {
      return new Response('No message', { status: 200, headers: corsHeaders });
    }

    const { message } = update;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text || '';

    // Store/update user in database
    await supabase
      .from('telegram_users')
      .upsert({
        telegram_id: userId.toString(),
        username: message.from.username || null,
        first_name: message.from.first_name,
        last_name: message.from.last_name || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      });

    // Handle /start command
    if (text === '/start') {
      const { data: settings } = await supabase
        .from('bot_settings')
        .select('welcome_message')
        .single();

      const welcomeMessage = settings?.welcome_message || 'Welcome to EduBot! 🎓';
      
      await sendTelegramMessage(chatId, welcomeMessage);
      return new Response('OK', { headers: corsHeaders });
    }

    // Handle regular messages with Perplexity AI
    if (text && text !== '/start') {
      const { data: settings } = await supabase
        .from('bot_settings')
        .select('tone, language')
        .single();

      const aiResponse = await getPerplexityResponse(text, settings?.tone || 'friendly');
      await sendTelegramMessage(chatId, aiResponse);
    }

    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
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

async function getPerplexityResponse(userMessage: string, tone: string): Promise<string> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are EduBot, a ${tone} educational assistant. Help users learn and provide educational content. Keep responses concise and helpful.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Perplexity AI error:', error);
    return 'Sorry, I encountered an error while processing your request. Please try again later.';
  }
}