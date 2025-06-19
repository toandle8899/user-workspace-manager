import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  MessageCircle, 
  Volume2, 
  Save, 
  RefreshCw,
  Settings,
  Users,
  Bell,
  Globe
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function BotSettings() {
  const [settings, setSettings] = useState({
    bot_name: 'EduBot',
    welcome_message: 'Welcome to EduBot! 🎓 I\'m here to help you learn and grow. Let\'s start your educational journey together!',
    tone: 'friendly',
    language: 'english',
    timezone: 'UTC',
    notifications_enabled: true,
    auto_reply: true,
    max_users_per_day: 1000
  });

  const [greetings, setGreetings] = useState({
    morning: 'Good morning! Ready to learn something new today? ☀️',
    afternoon: 'Good afternoon! Let\'s continue your learning journey! 📚',
    evening: 'Good evening! Perfect time for some educational content! 🌙',
    weekend: 'Happy weekend! Learning never stops! 🎉'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          bot_name: data.bot_name,
          welcome_message: data.welcome_message,
          tone: data.tone,
          language: data.language,
          timezone: data.timezone,
          notifications_enabled: data.notifications_enabled,
          auto_reply: data.auto_reply,
          max_users_per_day: data.max_users_per_day
        });

        if (data.greetings) {
          setGreetings(data.greetings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load bot settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('bot_settings')
        .upsert({
          ...settings,
          greetings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Bot settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save bot settings');
    } finally {
      setSaving(false);
    }
  };

  const toneOptions = [
    { value: 'friendly', label: 'Friendly & Encouraging', description: 'Warm and supportive tone' },
    { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
    { value: 'casual', label: 'Casual & Fun', description: 'Relaxed and playful tone' },
    { value: 'motivational', label: 'Motivational', description: 'Inspiring and energetic' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bot Settings</h1>
          <p className="text-gray-600 mt-1">Configure your Telegram bot's personality and behavior</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Basic Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bot className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Basic Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bot Name</label>
            <input
              type="text"
              value={settings.bot_name}
              onChange={(e) => setSettings({ ...settings, bot_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Users Per Day</label>
            <input
              type="number"
              value={settings.max_users_per_day}
              onChange={(e) => setSettings({ ...settings, max_users_per_day: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
          <textarea
            value={settings.welcome_message}
            onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter the welcome message for new users"
          />
        </div>
      </div>

      {/* Tone and Personality */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Volume2 className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Tone & Personality</h2>
        </div>
        
        <div className="space-y-4">
          {toneOptions.map((option) => (
            <div key={option.value} className="flex items-start space-x-3">
              <input
                type="radio"
                id={option.value}
                name="tone"
                value={option.value}
                checked={settings.tone === option.value}
                onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                className="mt-1 text-purple-600"
              />
              <div className="flex-1">
                <label htmlFor={option.value} className="block text-sm font-medium text-gray-900 cursor-pointer">
                  {option.label}
                </label>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Greetings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <MessageCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Custom Greetings</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Morning Greeting</label>
            <input
              type="text"
              value={greetings.morning}
              onChange={(e) => setGreetings({ ...greetings, morning: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Afternoon Greeting</label>
            <input
              type="text"
              value={greetings.afternoon}
              onChange={(e) => setGreetings({ ...greetings, afternoon: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evening Greeting</label>
            <input
              type="text"
              value={greetings.evening}
              onChange={(e) => setGreetings({ ...greetings, evening: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weekend Greeting</label>
            <input
              type="text"
              value={greetings.weekend}
              onChange={(e) => setGreetings({ ...greetings, weekend: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900">Advanced Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Enable Notifications</h3>
              <p className="text-sm text-gray-500">Send notifications for scheduled content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Auto Reply</h3>
              <p className="text-sm text-gray-500">Automatically respond to common questions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.auto_reply}
                onChange={(e) => setSettings({ ...settings, auto_reply: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}