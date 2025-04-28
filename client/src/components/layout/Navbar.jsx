import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuthStore } from '../../store/authStore';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <nav className="bg-teal-700 dark:bg-gray-800 text-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <rect width="512" height="512" rx="120" fill="currentColor"/>
                  <path d="M380 132H132C119.849 132 110 141.849 110 154V314C110 326.15 119.849 336 132 336H236L290 390C293.062 393.062 297.312 394.75 301.75 394.75C303.625 394.75 305.5 394.375 307.375 393.625C313.688 391.188 318 385.062 318 378V336H380C392.15 336 402 326.15 402 314V154C402 141.849 392.15 132 380 132Z" fill="white"/>
                </svg>
                <span className="text-xl font-semibold hidden md:block">Chat App</span>
              </Link>
            </div>
          </div>
          
          {/* Navigation links - Desktop */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/chat" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-800 dark:hover:bg-gray-700">
                Chats
              </Link>
              <Link to="/groups" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-800 dark:hover:bg-gray-700">
                Groups
              </Link>
            </div>
          </div>
          
          {/* User menu */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-white hover:bg-teal-800 dark:hover:bg-gray-700"
              onClick={toggleSidebar}
              aria-expanded={sidebarOpen}
            >
              <span className="sr-only">Open menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* User dropdown */}
            <div className="ml-3 relative">
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium hidden md:block">
                  {user?.username || 'User'}
                </div>
                <div className="relative">
                  {user?.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={user.avatar}
                      alt={user?.username || 'User'}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-teal-600 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-white"></div>
                </div>
                
                <button
                  className="text-white hover:text-gray-200"
                  onClick={handleLogout}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      {sidebarOpen && (
        <div className="md:hidden bg-teal-800 dark:bg-gray-700 py-2">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/chat" 
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-teal-900 dark:hover:bg-gray-600"
              onClick={() => toggleSidebar(false)}
            >
              Chats
            </Link>
            <Link 
              to="/groups" 
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-teal-900 dark:hover:bg-gray-600"
              onClick={() => toggleSidebar(false)}
            >
              Groups
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

Navbar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool.isRequired
};

export default Navbar; 