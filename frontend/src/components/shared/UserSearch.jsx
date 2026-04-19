import React, { useState, useEffect, useRef } from 'react';
import { searchUsers } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import PropTypes from 'prop-types';

const UserSearch = ({ onSelectUser, placeholder = "Search users...", excludeUsers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user: currentUser } = useAuthStore();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      setDropdownOpen(true);
      handleSearch(value);
    } else {
      setUsers([]);
      setDropdownOpen(false);
    }
  };

  // Search users with debounce
  const handleSearch = async (query) => {
    if (query.length < 2) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchUsers(query);
      if (data && data.users) {
        // Filter out current user and excluded users
        const filteredUsers = data.users.filter(
          (user) => 
            user._id !== currentUser?._id && 
            !excludeUsers.some(excludedUser => 
              excludedUser._id === user._id || 
              excludedUser === user._id
            )
        );
        setUsers(filteredUsers);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    onSelectUser(user);
    setSearchTerm('');
    setUsers([]);
    setDropdownOpen(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onFocus={() => searchTerm.length >= 2 && setDropdownOpen(true)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown for search results */}
      {dropdownOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg max-h-60 overflow-y-auto">
          {error && (
            <div className="px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {users.length === 0 && !loading && !error && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No users found
            </div>
          )}

          {users.map((user) => (
            <div
              key={user._id}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
              onClick={() => handleUserSelect(user)}
            >
              {/* User avatar */}
              <div className="w-10 h-10 rounded-full mr-3 flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* User details */}
              <div className="flex-1">
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {user.name || user.username}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email || `@${user.username}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

UserSearch.propTypes = {
  onSelectUser: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  excludeUsers: PropTypes.array
};

export default UserSearch; 