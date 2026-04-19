import React from 'react';
import PropTypes from 'prop-types';
import { useAuthStore } from '../../store/authStore';

const UserList = ({ users, onUserSelect, selectedUsers = [], showSelectIndicator = false }) => {
  const { isUserOnline } = useAuthStore();

  // Check if a user is selected
  const isSelected = (userId) => {
    return selectedUsers.some(u => u._id === userId);
  };

  // Handle user click
  const handleUserClick = (user) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  return (
    <div className="flex flex-col">
      {users.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No users available
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map(user => (
            <div 
              key={user._id}
              className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer
                ${isSelected(user._id) ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              onClick={() => handleUserClick(user)}
            >
              {/* Selection checkbox for multi-select */}
              {showSelectIndicator && (
                <div className="mr-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center 
                    ${isSelected(user._id) 
                      ? 'bg-primary-500 text-white' 
                      : 'border border-gray-300 dark:border-gray-600'}`}
                  >
                    {isSelected(user._id) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              {/* User avatar with online indicator */}
              <div className="relative mr-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username || user.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {(user.username || user.name || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Online status indicator */}
                {isUserOnline(user._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                )}
              </div>
              
              {/* User details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.name || user.username}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {isUserOnline(user._id) ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email || `@${user.username}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.array.isRequired,
  onUserSelect: PropTypes.func,
  selectedUsers: PropTypes.array,
  showSelectIndicator: PropTypes.bool
};

export default UserList; 