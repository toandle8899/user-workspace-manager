import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users as UsersIcon, 
  Search, 
  MessageSquare, 
  Calendar,
  Filter,
  Download,
  Mail,
  Activity,
  UserCheck,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  telegram_id: string;
  username: string;
  first_name: string;
  last_name?: string;
  created_at: string;
  interaction_count: number;
  last_interaction: string;
  is_active: boolean;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  averageInteractions: number;
}

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    averageInteractions: 0
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Get users with their interaction counts
      const { data: usersData, error } = await supabase
        .from('telegram_users')
        .select(`
          *,
          content_delivery_logs (
            count,
            max_delivered_at:delivered_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = usersData.map(user => ({
        ...user,
        interaction_count: user.content_delivery_logs?.[0]?.count || 0,
        last_interaction: user.content_delivery_logs?.[0]?.max_delivered_at || user.created_at
      }));

      setUsers(formattedUsers);

      // Calculate stats
      const activeUsers = formattedUsers.filter(u => u.is_active).length;
      const totalInteractions = formattedUsers.reduce((sum, user) => sum + user.interaction_count, 0);
      const avgInteractions = formattedUsers.length > 0 
        ? Math.round((totalInteractions / formattedUsers.length) * 10) / 10
        : 0;

      setStats({
        totalUsers: formattedUsers.length,
        activeUsers,
        averageInteractions: avgInteractions
      });

    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Telegram ID', 'Username', 'First Name', 'Last Name', 'Status', 'Interactions', 'Joined Date'];
    const csvData = filteredUsers.map(user => [
      user.telegram_id,
      user.username,
      user.first_name,
      user.last_name || '',
      user.is_active ? 'Active' : 'Inactive',
      user.interaction_count,
      format(new Date(user.created_at), 'yyyy-MM-dd')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery.toLowerCase().trim() === '' || 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.telegram_id?.toString().includes(searchQuery);

    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && user.is_active) || 
      (filter === 'inactive' && !user.is_active);

    return matchesSearch && matchesFilter;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and monitor your Telegram bot users
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                        <span>{stats.activeUsers} active</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Average Interactions</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.averageInteractions}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                        <span>per user</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 sm:col-span-2 lg:col-span-1">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Rate</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                        <span>engagement</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
                placeholder="Search users by name or Telegram ID"
              />
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="relative inline-flex">
              <Filter className="absolute left-3 top-1/2 -mt-2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="block w-40 pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-lg"
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-6">
          <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    User
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Telegram ID
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Interactions
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Last Active
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-600">
                            {user.first_name?.[0] || user.username?.[0] || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.telegram_id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_active ? (
                          <UserCheck className="mr-1 h-4 w-4" />
                        ) : (
                          <UserX className="mr-1 h-4 w-4" />
                        )}
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{user.interaction_count}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(user.last_interaction), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 bg-white">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Users will appear here once they start using your bot'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
