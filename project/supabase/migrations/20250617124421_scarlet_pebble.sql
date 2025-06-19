/*
  # Create Telegram Bot CMS Database Schema

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `video_url` (text)
      - `scheduled_date` (date)
      - `scheduled_time` (time)
      - `status` (enum: scheduled, sent, draft)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quizzes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `questions` (jsonb)
      - `scheduled_date` (date)
      - `scheduled_time` (time)
      - `status` (enum: scheduled, sent, draft)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `telegram_users`
      - `id` (uuid, primary key)
      - `telegram_id` (text, unique)
      - `username` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bot_settings`
      - `id` (uuid, primary key)
      - `bot_name` (text)
      - `welcome_message` (text)
      - `tone` (text)
      - `language` (text)
      - `timezone` (text)
      - `notifications_enabled` (boolean)
      - `auto_reply` (boolean)
      - `max_users_per_day` (integer)
      - `greetings` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage content
*/

-- Create custom types
CREATE TYPE content_status AS ENUM ('scheduled', 'sent', 'draft');

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  video_url text NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  status content_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]',
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  status content_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create telegram_users table
CREATE TABLE IF NOT EXISTS telegram_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text UNIQUE NOT NULL,
  username text,
  first_name text,
  last_name text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bot_settings table
CREATE TABLE IF NOT EXISTS bot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_name text DEFAULT 'EduBot',
  welcome_message text DEFAULT 'Welcome to EduBot! 🎓 I''m here to help you learn and grow.',
  tone text DEFAULT 'friendly',
  language text DEFAULT 'english',
  timezone text DEFAULT 'UTC',
  notifications_enabled boolean DEFAULT true,
  auto_reply boolean DEFAULT true,
  max_users_per_day integer DEFAULT 1000,
  greetings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for videos
CREATE POLICY "Allow all operations on videos"
  ON videos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for quizzes
CREATE POLICY "Allow all operations on quizzes"
  ON quizzes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for telegram_users
CREATE POLICY "Allow all operations on telegram_users"
  ON telegram_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for bot_settings
CREATE POLICY "Allow all operations on bot_settings"
  ON bot_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_scheduled ON videos(scheduled_date, scheduled_time, status);
CREATE INDEX IF NOT EXISTS idx_quizzes_scheduled ON quizzes(scheduled_date, scheduled_time, status);
CREATE INDEX IF NOT EXISTS idx_telegram_users_active ON telegram_users(is_active);
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_id ON telegram_users(telegram_id);

-- Insert default bot settings
INSERT INTO bot_settings (
  bot_name,
  welcome_message,
  tone,
  language,
  timezone,
  greetings
) VALUES (
  'EduBot',
  'Welcome to EduBot! 🎓 I''m here to help you learn and grow. Let''s start your educational journey together!',
  'friendly',
  'english',
  'UTC',
  '{
    "morning": "Good morning! Ready to learn something new today? ☀️",
    "afternoon": "Good afternoon! Let''s continue your learning journey! 📚",
    "evening": "Good evening! Perfect time for some educational content! 🌙",
    "weekend": "Happy weekend! Learning never stops! 🎉"
  }'::jsonb
) ON CONFLICT DO NOTHING;