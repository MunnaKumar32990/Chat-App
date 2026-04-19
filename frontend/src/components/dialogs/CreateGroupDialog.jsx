import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import UserSearch from '../shared/UserSearch';
import UserList from '../shared/UserList';
import { getAllUsers } from '../../lib/api';

const CreateGroupDialog = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { createGroupChat } = useChatStore();
  const { user: currentUser } = useAuthStore();

  // Fetch all users on component mount
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const response = await getAllUsers();
          if (response.success) {
            // Filter out current user
            const filteredUsers = response.users.filter(user => user._id !== currentUser?._id);
            setAllUsers(filteredUsers);
          } else {
            setError('Failed to fetch users');
          }
        } catch (err) {
          console.error('Error fetching users:', err);
          setError('An error occurred while fetching users');
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [isOpen, currentUser?._id]);

  // Reset form when dialog is opened or closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setGroupName('');
      setSelectedUsers([]);
      setError(null);
    }
  }, [isOpen]);

  // Handle selecting users
  const handleUserSelect = (user) => {
    // Check if user is already selected
    const isSelected = selectedUsers.some(selectedUser => selectedUser._id === user._id);
    
    if (isSelected) {
      // Remove user from selected users
      setSelectedUsers(selectedUsers.filter(selectedUser => selectedUser._id !== user._id));
    } else {
      // Add user to selected users
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Handle user search selection
  const handleUserSearchSelect = (user) => {
    // Add user if not already in the list
    if (!selectedUsers.some(selectedUser => selectedUser._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate step 1
      if (selectedUsers.length < 2) {
        toast.error('Please select at least 2 users for a group chat');
        return;
      }
      setStep(2);
      return;
    }
    
    // Validate step 2
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    
    // Create group chat
    try {
      setLoading(true);
      setError(null);
      
      // Format the users array for the API
      const userIds = selectedUsers.map(user => user._id);
      
      const chat = await createGroupChat(userIds, groupName);
      if (chat) {
        toast.success('Group chat created successfully!');
        onSuccess(chat);
        onClose();
      } else {
        throw new Error('Failed to create group chat');
      }
    } catch (err) {
      console.error('Error creating group chat:', err);
      setError(err.message || 'Failed to create group chat');
      toast.error(err.message || 'Failed to create group chat');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {step === 1 ? 'Select Group Members' : 'Create Group Chat'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {step === 1 ? 'Select users to add to your group chat' : 'Give your group a name'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            {step === 1 ? (
              <>
                <UserSearch 
                  onSelectUser={handleUserSearchSelect}
                  placeholder="Search users to add..."
                  excludeUsers={selectedUsers}
                />
                
                {selectedUsers.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected Users ({selectedUsers.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map(user => (
                        <div 
                          key={user._id}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200"
                        >
                          <span>{user.name || user.username}</span>
                          <button
                            type="button"
                            className="ml-1.5 h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-700"
                            onClick={() => handleUserSelect(user)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {loading ? (
                    <div className="flex justify-center items-center h-20">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center text-red-500">
                      {error}
                    </div>
                  ) : (
                    <UserList 
                      users={allUsers}
                      onUserSelect={handleUserSelect}
                      selectedUsers={selectedUsers}
                      showSelectIndicator={true}
                    />
                  )}
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter a name for your group"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group Members ({selectedUsers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <div 
                        key={user._id}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200"
                      >
                        <span>{user.name || user.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="px-6 py-2 text-sm text-red-500">
              {error}
            </div>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  disabled={selectedUsers.length < 2 || loading}
                >
                  Next
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  disabled={!groupName.trim() || loading}
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

CreateGroupDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default CreateGroupDialog; 