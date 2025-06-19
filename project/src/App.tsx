import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Content } from './pages/Content';
import { Home } from './pages/Home';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Videos } from './pages/Videos';
import { Quizzes } from './pages/Quizzes';
import { Sidebar } from './components/Sidebar';
import { Toaster } from 'react-hot-toast';
function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#fff',
              secondary: '#333',
            },
          },
          error: {
            iconTheme: {
              primary: '#fff',
              secondary: '#333',
            },
          },
        }}
      />

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none lg:pl-72">
          <div className="py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/content" element={<Content />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>

          {/* Footer */}
          <footer className="mt-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="border-t border-gray-200 pt-4">
              <p className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} EduBot CMS. All rights reserved.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
