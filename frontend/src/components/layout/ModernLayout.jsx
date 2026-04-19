import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import ModernHeader from './ModernHeader';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import InstallPrompt from '../shared/InstallPrompt';

const ModernLayout = ({ fullWidth = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      <div
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } fixed inset-0 z-20 bg-gray-500 bg-opacity-75 transition-opacity md:hidden`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-white dark:bg-gray-800 md:hidden overflow-y-auto`}
      >
        <Sidebar isMobile={true} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden md:flex md:flex-shrink-0`}>
        <div className={`flex flex-col w-64`}>
          <Sidebar />
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top nav */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow">
          <button
            type="button"
            className="px-4 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6 text-gray-500 dark:text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex-1 px-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {location.pathname === '/chat'
                  ? 'Chats'
                  : location.pathname === '/groups'
                  ? 'Groups'
                  : location.pathname === '/users'
                  ? 'Users'
                  : location.pathname === '/profile'
                  ? 'Profile'
                  : 'Chat App'}
              </h1>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* Theme toggle, notifications, etc can go here */}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex-1 overflow-auto ${fullWidth ? 'max-w-full' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
          <main className="flex-1 h-full">
            <Outlet />
          </main>
        </div>
        
        {/* Install Prompt */}
        <InstallPrompt />
      </div>
    </div>
  );
};

ModernLayout.propTypes = {
  fullWidth: PropTypes.bool
};

export default ModernLayout; 