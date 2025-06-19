import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Video, Plus, Trash2, Calendar, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface VideoContent {
  id: string;
  title: string;
  description: string;
  content_data: {
    video_url: string;
  };
  scheduled_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function Videos() {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    video_url: '',
    scheduled_time: '',
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('type', 'video')
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddVideo(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('content')
        .insert([
          {
            type: 'video',
            title: newVideo.title,
            description: newVideo.description,
            content_data: { video_url: newVideo.video_url },
            scheduled_time: newVideo.scheduled_time,
            is_active: true,
          },
        ])
        .select();

      if (error) throw error;

      toast.success('Video added successfully');
      setIsAddingVideo(false);
      setNewVideo({
        title: '',
        description: '',
        video_url: '',
        scheduled_time: '',
      });
      fetchVideos();
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('Failed to add video');
    }
  }

  async function handleDeleteVideo(id: string) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Video deleted successfully');
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Videos</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and schedule educational videos for your students
            </p>
          </div>
          <button
            onClick={() => setIsAddingVideo(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Add Video
          </button>
        </div>

        {isAddingVideo && (
          <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Add New Video</h3>
              <form onSubmit={handleAddVideo} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="video_url" className="block text-sm font-medium text-gray-700">
                    Video URL
                  </label>
                  <input
                    type="url"
                    name="video_url"
                    id="video_url"
                    required
                    value={newVideo.video_url}
                    onChange={(e) => setNewVideo({ ...newVideo, video_url: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>

                <div>
                  <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-700">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_time"
                    id="scheduled_time"
                    required
                    value={newVideo.scheduled_time}
                    onChange={(e) => setNewVideo({ ...newVideo, scheduled_time: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingVideo(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Add Video
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6">
          {videos.length > 0 ? (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 divide-y divide-gray-200">
              {videos.map((video) => (
                <div key={video.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Video className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
                        <p className="mt-1 text-gray-600">{video.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(video.scheduled_time).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(video.scheduled_time).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(video.content_data.video_url, '_blank')}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Open video"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete video"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-white shadow-sm rounded-lg border border-gray-200 p-12">
              <Video className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No videos</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first educational video.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setIsAddingVideo(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Add Video
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
