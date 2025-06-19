import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  HelpCircle,
  Settings,
  Users,
  Menu,
  X,
  FileText,
  GraduationCap
} from 'lucide-react';

export function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { 
      name: 'Content', 
      href: '/content', 
      icon: FileText,
      description: 'Manage educational content'
    },
    { 
      name: 'Videos', 
      href: '/videos', 
      icon: Video,
      description: 'Educational video lessons'
    },
    { 
      name: 'Quizzes', 
      href: '/quizzes', 
      icon: HelpCircle,
      description: 'Interactive assessments'
    },
    { 
      name: 'Users', 
      href: '/users', 
      icon: Users,
      description: 'Student management'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      description: 'System configuration'
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed top-0 left-0 z-40 h-screen w-72 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <GraduationCap className="h-8 w-8 text-black" />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">EduBot CMS</h1>
              <p className="text-xs text-gray-500">Content Management System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    active
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex flex-col px-3 py-2 text-sm rounded-lg transition-all duration-150`}
                >
                  <div className="flex items-center">
                    <Icon
                      className={`${
                        active ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'
                      } h-5 w-5 flex-shrink-0 transition-colors`}
                      aria-hidden="true"
                    />
                    <span className="ml-3 font-medium">{item.name}</span>
                  </div>
                  {item.description && (
                    <span className={`ml-8 mt-1 text-xs ${active ? 'text-gray-200' : 'text-gray-500'}`}>
                      {item.description}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center px-2">
              <div className="flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Administrator</p>
                <Link 
                  to="/settings" 
                  className="text-xs text-gray-500 hover:text-black transition-colors"
                >
                  View settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
