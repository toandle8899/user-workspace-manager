import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw,
  Bot,
  Key,
  MessageSquare,
  Bell,
  Shield,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { telegramBot } from '../lib/telegram';
import { perplexityAI } from '../lib/perplexity';

interface BotSettings {
  id: string;
  greeting_message: string;
  tone_of_voice: 'friendly' | 'professional' | 'casual' | 'formal';
  perplexity_api_key: string;
  telegram_bot_token: string;
  max_daily_messages: number;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function Settings() {
  const [settings, setSettings] = useState<BotSettings>({
    id: '',
    greeting_message: 'Welcome to our educational platform! 👋',
    tone_of_voice: 'friendly',
    perplexity_api_key: '',
    telegram_bot_token: '',
    max_daily_messages: 100,
    notification_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (changes: Partial<BotSettings>) => {
    setSettings(prev => ({ ...prev, ...changes }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('bot_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Settings saved successfully');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnections = async () => {
    setTesting(true);
    try {
      // Test Telegram Bot
      try {
        await telegramBot.initialize();
        toast.success('Telegram bot connection successful');
      } catch (error) {
        console.error('Telegram bot test failed:', error);
        toast.error('Telegram bot connection failed');
      }

      // Test Perplexity AI
      try {
        await perplexityAI.initialize();
        toast.success('Perplexity AI connection successful');
      } catch (error) {
        console.error('Perplexity AI test failed:', error);
        toast.error('Perplexity AI connection failed');
      }
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure your bot and API settings
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={testConnections}
              disabled={testing}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                ${testing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`-ml-1 mr-2 h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
              Test Connections
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                ${(saving || !hasUnsavedChanges) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Bot Settings */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Bot className="h-5 w-5 text-gray-400" />
                <h2 className="ml-2 text-lg font-medium text-gray-900">Bot Configuration</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="greeting" className="block text-sm font-medium text-gray-700">
                  Greeting Message
                </label>
                <div className="mt-1">
                  <textarea
                    id="greeting"
                    rows={3}
                    value={settings.greeting_message}
                    onChange={(e) => handleChange({ greeting_message: e.target.value })}
                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-lg"
                    placeholder="Welcome message for new users"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
                    Tone of Voice
                  </label>
                  <select
                    id="tone"
                    value={settings.tone_of_voice}
                    onChange={(e) => handleChange({ tone_of_voice: e.target.value as BotSettings['tone_of_voice'] })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-lg"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="max-messages" className="block text-sm font-medium text-gray-700">
                    Max Daily Messages
                  </label>
                  <input
                    type="number"
                    id="max-messages"
                    min="1"
                    max="1000"
                    value={settings.max_daily_messages}
                    onChange={(e) => handleChange({ max_daily_messages: parseInt(e.target.value) })}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm font-medium text-gray-700">Enable Notifications</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange({ notification_enabled: !settings.notification_enabled })}
                  className={`${
                    settings.notification_enabled ? 'bg-black' : 'bg-gray-200'
                  } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
                >
                  <span className={`${
                    settings.notification_enabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                </button>
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Key className="h-5 w-5 text-gray-400" />
                <h2 className="ml-2 text-lg font-medium text-gray-900">API Configuration</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTokens(!showTokens)}
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  {showTokens ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide tokens
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Show tokens
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="telegram-token" className="block text-sm font-medium text-gray-700">
                    Telegram Bot Token
                  </label>
                  <div className="mt-1">
                    <input
                      type={showTokens ? "text" : "password"}
                      id="telegram-token"
                      value={settings.telegram_bot_token}
                      onChange={(e) => handleChange({ telegram_bot_token: e.target.value })}
                      className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-lg"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Get this from BotFather on Telegram
                  </p>
                </div>

                <div>
                  <label htmlFor="perplexity-key" className="block text-sm font-medium text-gray-700">
                    Perplexity AI API Key
                  </label>
                  <div className="mt-1">
                    <input
                      type={showTokens ? "text" : "password"}
                      id="perplexity-key"
                      value={settings.perplexity_api_key}
                      onChange={(e) => handleChange({ perplexity_api_key: e.target.value })}
                      className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-lg"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Your Perplexity AI API key for chat functionality
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
