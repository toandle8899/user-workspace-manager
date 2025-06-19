import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateSettings } from '../lib/storage';
import { telegramBot } from '../lib/telegram';
import { toast } from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [telegramToken, setTelegramToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update the bot token
      updateSettings({ telegram_bot_token: telegramToken });
      
      // Test the connection
      const botInfo = await telegramBot.initialize();
      toast.success(`Successfully connected to bot: ${botInfo.username}`);
      
      // Send a test message
      await telegramBot.sendMessage(
        botInfo.id,
        '🎉 Bot is now connected to the CMS! You can start managing your content.'
      );
      
      navigate('/content');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect to Telegram bot');
      console.error('Error connecting to Telegram:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connect Your Telegram Bot
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your Telegram bot token to get started
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="telegram-token" className="sr-only">
                Telegram Bot Token
              </label>
              <input
                id="telegram-token"
                name="telegram-token"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your Telegram bot token"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : null}
              {loading ? 'Connecting...' : 'Connect Bot'}
            </button>
          </div>

          <div className="text-sm text-gray-500">
            <p className="font-medium mb-2">To get your Telegram bot token:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open Telegram and search for @BotFather</li>
              <li>Send /newbot command</li>
              <li>Follow the instructions to create your bot</li>
              <li>Copy the token provided by BotFather</li>
            </ol>
          </div>
        </form>
      </div>
    </div>
  );
} 