import React, { useState } from 'react';
import { VideoManager } from '../components/VideoManager';
import { QuizManager } from '../components/QuizManager';
import { contentScheduler } from '../lib/scheduler';
import { toast } from 'react-hot-toast';

export function Content() {
  const [activeTab, setActiveTab] = useState<'videos' | 'quizzes'>('videos');
  const [isForceLoading, setIsForceLoading] = useState(false);

  const handleForceSend = async () => {
    try {
      setIsForceLoading(true);
      await contentScheduler.forceSendContent(activeTab === 'videos' ? 'video' : 'quiz');
      toast.success('Content sent successfully to all users!');
    } catch (error) {
      console.error('Force send error:', error);
      toast.error('Failed to send content. Please try again.');
    } finally {
      setIsForceLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and schedule your educational content
            </p>
          </div>
          <button
            onClick={handleForceSend}
            disabled={isForceLoading}
            className={`px-6 py-3 bg-black text-white rounded-lg shadow-sm hover:bg-gray-800 transition-colors
              ${isForceLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isForceLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Force Send All Content'
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('videos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'videos'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'quizzes'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Quizzes
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'videos' ? (
              <VideoManager />
            ) : (
              <QuizManager />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
