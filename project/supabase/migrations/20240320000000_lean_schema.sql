-- Create tables for the lean CMS
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('video', 'quiz')),
    title TEXT NOT NULL,
    description TEXT,
    content_data JSONB NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS bot_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    greeting_message TEXT NOT NULL,
    perplexity_api_key TEXT NOT NULL,
    telegram_bot_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert initial bot settings
INSERT INTO bot_settings (greeting_message, perplexity_api_key, telegram_bot_token)
VALUES (
    'Welcome to our learning platform! 👋',
    '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',
    '7596530494:AAGNH2Q6L-Fk2cfE-Z452r099zF55P1P870'
); 