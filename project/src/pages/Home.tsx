import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Users as UsersIcon,
  Video,
  HelpCircle,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Calendar
} from 'lucide-react';

interface Analytics {
  totalUsers: number;
  totalVideos: number;
  totalQuizzes: number;
  totalInteractions: number;
  successRate: number;
  recentActivity: {
    type: 'video' | 'quiz';
    title: string;
    status: 'success' | 'failed';
    timestamp: string;
  }[];
  upcomingContent: {
    type: 'video' | 'quiz';
    title: string;
    scheduled_time: string;
  }[];
}

export function Home() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    totalVideos: 0,
    totalQuizzes: 0,
    totalInteractions: 0,
    successRate: 0,
    recentActivity: [],
    upcomingContent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load total users
      const { count: usersCount } = await supabase
        .from('telegram_users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Load total videos
      const { count: videosCount } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'video')
        .eq('is_active', true);

      // Load total quizzes
      const { count: quizzesCount } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'quiz')
        .eq('is_active', true);

      // Load delivery statistics
      const { data: deliveryStats } = await supabase
        .from('content_delivery_logs')
        .select('status');

      const totalDeliveries = deliveryStats?.length || 0;
      const successfulDeliveries = deliveryStats?.filter(d => d.status === 'success').length || 0;
      const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

      // Load recent activity
      const { data: recentActivity } = await supabase
        .from('content_delivery_logs')
        .select(`
          status,
          delivered_at,
          content:content(
            type,
            title
          )
        `)
        .order('delivered_at', { ascending: false })
        .limit(5);

      // Load upcoming content
      const { data: upcomingContent } = await supabase
        .from('content')
        .select('type, title, scheduled_time')
        .eq('is_active', true)
        .gt('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true })
        .limit(5);

      setAnalytics({
        totalUsers: usersCount || 0,
        totalVideos: videosCount || 0,
        totalQuizzes: quizzesCount || 0,
        totalInteractions: totalDeliveries,
        successRate,
        recentActivity: recentActivity?.map((activity: any) => ({
          type: activity.content.type,
          title: activity.content.title,
          status: activity.status,
          timestamp: activity.delivered_at
        })) || [],
        upcomingContent: upcomingContent || []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { name: 'Active Users', value: analytics.totalUsers, icon: UsersIcon },
    { name: 'Active Videos', value: analytics.totalVideos, icon: Video },
    { name: 'Active Quizzes', value: analytics.totalQuizzes, icon: HelpCircle },
    { 
      name: 'Delivery Success Rate', 
      value: `${analytics.successRate.toFixed(1)}%`, 
      icon: CheckCircle,
      trend: analytics.successRate >= 90 ? 'positive' : analytics.successRate >= 75 ? 'neutral' : 'negative'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your educational content and user engagement
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm border border-gray-200 hover:border-black transition-colors"
              >
                <dt>
                  <div className="absolute rounded-md bg-black p-3">
                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">
                    {stat.name}
                  </p>
                </dt>
                <dd className="ml-16 flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <div className={`ml-2 flex items-baseline text-sm ${
                      stat.trend === 'positive' ? 'text-green-600' :
                      stat.trend === 'negative' ? 'text-red-600' :
                      'text-gray-500'
                    }`}>
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  )}
                </dd>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <p className="mt-1 text-sm text-gray-500">Latest content delivery status</p>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {analytics.recentActivity.map((activity, index) => (
              <li key={index} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {activity.type === 'video' ? (
                      <Video className="h-5 w-5 text-gray-400" />
                    ) : (
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </li>
            ))}
            {analytics.recentActivity.length === 0 && (
              <li className="px-6 py-4 text-center text-sm text-gray-500">
                No recent activity
              </li>
            )}
          </ul>
        </div>

        {/* Upcoming Content */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Content</h2>
            <p className="mt-1 text-sm text-gray-500">Scheduled content delivery</p>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {analytics.upcomingContent.map((content, index) => (
              <li key={index} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {content.type === 'video' ? (
                      <Video className="h-5 w-5 text-gray-400" />
                    ) : (
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {content.title}
                    </p>
                    <div className="flex items-center mt-1 space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(content.scheduled_time).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{new Date(content.scheduled_time).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {analytics.upcomingContent.length === 0 && (
              <li className="px-6 py-4 text-center text-sm text-gray-500">
                No upcoming content scheduled
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
