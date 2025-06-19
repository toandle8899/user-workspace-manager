import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Zap, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Bot
} from 'lucide-react';
import { telegramBot } from '../lib/telegram';
import { perplexityAI } from '../lib/perplexity';
import toast from 'react-hot-toast';

export function ApiSettings() {
  const [telegramSettings, setTelegramSettings] = useState({
    botToken: '7596530494:AAGNH2Q6L-Fk2cfE-Z452r099zF55P1P870',
    webhookUrl: '',
    isConnected: false,
    lastSync: new Date().toLocaleString()
  });

  const [perplexitySettings, setPerplexitySettings] = useState({
    apiKey: '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',
    model: 'llama-3.1-sonar-small-128k-online',
    maxTokens: 1000,
    temperature: 0.7,
    isConnected: false,
    lastUsed: new Date().toLocaleString()
  });

  const [testingConnection, setTestingConnection] = useState(false);
  const [stats, setStats] = useState({
    messagesSent: 0,
    aiConversations: 0,
    uptime: '99.2%'
  });

  useEffect(() => {
    checkConnections();
    loadStats();
  }, []);

  const checkConnections = async () => {
    // Test Telegram connection
    try {
      const result = await telegramBot.getMe();
      setTelegramSettings(prev => ({ 
        ...prev, 
        isConnected: result.ok,
        lastSync: new Date().toLocaleString()
      }));
    } catch (error) {
      console.error('Telegram connection error:', error);
      setTelegramSettings(prev => ({ ...prev, isConnected: false }));
    }

    // Test Perplexity connection
    try {
      const response = await perplexityAI.chatWithUser('Hello');
      setPerplexitySettings(prev => ({ 
        ...prev, 
        isConnected: !!response,
        lastUsed: new Date().toLocaleString()
      }));
    } catch (error) {
      console.error('Perplexity connection error:', error);
      setPerplexitySettings(prev => ({ ...prev, isConnected: false }));
    }
  };

  const loadStats = () => {
    // In a real app, these would come from your database
    setStats({
      messagesSent: Math.floor(Math.random() * 2000) + 1000,
      aiConversations: Math.floor(Math.random() * 1000) + 500,
      uptime: '99.2%'
    });
  };

  const testTelegramConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await telegramBot.getMe();
      if (result.ok) {
        setTelegramSettings(prev => ({ 
          ...prev, 
          isConnected: true,
          lastSync: new Date().toLocaleString()
        }));
        toast.success('Telegram bot connected successfully!');
      } else {
        throw new Error('Failed to connect to Telegram bot');
      }
    } catch (error) {
      console.error('Telegram test error:', error);
      setTelegramSettings(prev => ({ ...prev, isConnected: false }));
      toast.error('Failed to connect to Telegram bot');
    } finally {
      setTestingConnection(false);
    }
  };

  const testPerplexityConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await perplexityAI.chatWithUser('Test connection');
      if (response) {
        setPerplexitySettings(prev => ({ 
          ...prev, 
          isConnected: true,
          lastUsed: new Date().toLocaleString()
        }));
        toast.success('Perplexity AI connected successfully!');
      } else {
        throw new Error('No response from Perplexity AI');
      }
    } catch (error) {
      console.error('Perplexity test error:', error);
      setPerplexitySettings(prev => ({ ...prev, isConnected: false }));
      toast.error('Failed to connect to Perplexity AI');
    } finally {
      setTestingConnection(false);
    }
  };

  const setupWebhook = async () => {
    if (!telegramSettings.webhookUrl) {
      toast.error('Please enter a webhook URL');
      return;
    }

    try {
      await telegramBot.setWebhook(telegramSettings.webhookUrl);
      toast.success('Webhook configured successfully!');
    } catch (error) {
      console.error('Webhook setup error:', error);
      toast.error('Failed to setup webhook');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Settings</h1>
          <p className="text-gray-600 mt-1">Configure your Telegram bot and Perplexity AI integrations</p>
        </div>
      </div>

      {/* Telegram Bot Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Telegram Bot Integration</h2>
          </div>
          <div className="flex items-center space-x-2">
            {telegramSettings.isConnected ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Disconnected</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bot Token</label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={telegramSettings.botToken}
                onChange={(e) => setTelegramSettings({ ...telegramSettings, botToken: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your Telegram bot token"
                readOnly
              />
              <button
                onClick={testTelegramConnection}
                disabled={testingConnection}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {testingConnection ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Test</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={telegramSettings.webhookUrl}
                onChange={(e) => setTelegramSettings({ ...telegramSettings, webhookUrl: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-domain.com/functions/v1/telegram-webhook"
              />
              <button
                onClick={setupWebhook}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Setup
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Bot Connected</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your Telegram bot is automatically connected and ready to receive messages and send scheduled content.
                </p>
              </div>
            </div>
          </div>

          {telegramSettings.isConnected && (
            <div className="text-sm text-gray-500">
              Last synchronized: {telegramSettings.lastSync}
            </div>
          )}
        </div>
      </div>

      {/* Perplexity AI Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Perplexity AI Integration</h2>
          </div>
          <div className="flex items-center space-x-2">
            {perplexitySettings.isConnected ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Disconnected</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={perplexitySettings.apiKey}
                onChange={(e) => setPerplexitySettings({ ...perplexitySettings, apiKey: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your Perplexity API key"
                readOnly
              />
              <button
                onClick={testPerplexityConnection}
                disabled={testingConnection}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {testingConnection ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Test</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <select
                value={perplexitySettings.model}
                onChange={(e) => setPerplexitySettings({ ...perplexitySettings, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="llama-3.1-sonar-small-128k-online">Llama 3.1 Sonar Small (128k)</option>
                <option value="llama-3.1-sonar-large-128k-online">Llama 3.1 Sonar Large (128k)</option>
                <option value="llama-3.1-sonar-huge-128k-online">Llama 3.1 Sonar Huge (128k)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
              <input
                type="number"
                value={perplexitySettings.maxTokens}
                onChange={(e) => setPerplexitySettings({ ...perplexitySettings, maxTokens: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="100"
                max="4000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={perplexitySettings.temperature}
              onChange={(e) => setPerplexitySettings({ ...perplexitySettings, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>More Focused (0)</span>
              <span className="font-medium">{perplexitySettings.temperature}</span>
              <span>More Creative (1)</span>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Key className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-purple-900">API Key Configured</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Your Perplexity AI API key is configured and ready to provide conversational AI features to your Telegram users.
                </p>
              </div>
            </div>
          </div>

          {perplexitySettings.isConnected && (
            <div className="text-sm text-gray-500">
              Last used: {perplexitySettings.lastUsed}
            </div>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">API Usage Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.messagesSent.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Messages Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.aiConversations.toLocaleString()}</div>
            <div className="text-sm text-gray-500">AI Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.uptime}</div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
}