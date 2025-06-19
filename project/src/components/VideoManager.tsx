import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Video, 
  Calendar, 
  Clock, 
  Trash2, 
  Play,
  Users,
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Content } from '../lib/supabase';
import toast from 'react-hot-toast';

interface VideoFormData {
  title: string;
  description: string;
  scheduled_time: string;
  video_url: string;
}

export function VideoManager() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [videos, setVideos] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [validatingUrl, setValidatingUrl] = useState(false);

  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    video_url: '',
    scheduled_time: ''
  });

  useEffect(() => {
    loadVideos();
    loadUserCount();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('type', 'video')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const loadUserCount = async () => {
    try {
      const { count } = await supabase
        .from('telegram_users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      setUserCount(count || 0);
    } catch (error) {
      console.error('Error loading user count:', error);
    }
  };

  const validateVideoUrl = async (url: string): Promise<boolean> => {
    try {
      setValidatingUrl(true);
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return contentType?.startsWith('video/') || false;
    } catch (error) {
      return false;
    } finally {
      setValidatingUrl(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate video URL
      const isValidVideo = await validateVideoUrl(formData.video_url);
      if (!isValidVideo) {
        toast.error('Please provide a valid video URL');
        return;
      }

      const { error } = await supabase
        .from('content')
        .insert([{
          type: 'video',
          title: formData.title,
          description: formData.description,
          content_data: { video_url: formData.video_url },
          scheduled_time: formData.scheduled_time,
          is_active: true
        }]);

      if (error) throw error;

      toast.success('Video scheduled successfully!');
      setFormData({ title: '', description: '', video_url: '', scheduled_time: '' });
      setShowAddForm(false);
      loadVideos();
    } catch (error) {
      console.error('Error creating video:', error);
      toast.error('Failed to schedule video');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Video deleted successfully!');
      loadVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
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
    <div className="space-y-6">
      {/* Add Video Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule New Video</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter video title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="https://example.com/video.mp4"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Provide a direct video file URL (MP4, WebM, etc.)
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Brief description of the video content"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time</label>
              <input
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                disabled={validatingUrl}
                className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validatingUrl ? 'Validating URL...' : 'Schedule Video'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Scheduled Videos</h2>
            <p className="mt-1 text-sm text-gray-500">Manage your educational video content</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video</span>
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {videos.length > 0 ? (
            videos.map((video) => (
              <div key={video.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Video className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
                      <p className="text-gray-600 mt-1">{video.description}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(video.scheduled_time).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(video.scheduled_time).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{userCount} recipients</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      video.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {video.is_active ? 'Scheduled' : 'Sent'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => window.open(video.content_data.video_url, '_blank')}
                        className="p-2 text-gray-400 hover:text-black transition-colors"
                        title="Preview video"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(video.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No videos scheduled yet</p>
              <p className="text-sm mt-1">Click "Add Video" to schedule your first educational video</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
