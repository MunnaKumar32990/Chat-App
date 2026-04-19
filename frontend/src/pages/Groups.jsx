import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import CreateGroupDialog from '../components/dialogs/CreateGroupDialog';

const Groups = () => {
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { chats, fetchChats, accessChat } = useChatStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Fetch all chats on component mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        await fetchChats();
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [fetchChats]);

  // Filter group chats only
  const groupChats = chats.filter(chat => chat.isGroupChat);

  // Handle group selection
  const handleGroupSelect = (chat) => {
    navigate(`/chat/${chat._id}`);
  };

  // Handle create group success
  const handleCreateGroupSuccess = (newGroup) => {
    navigate(`/chat/${newGroup._id}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Create Group button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Group Chats</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and manage group conversations
          </p>
        </div>
        <button
          onClick={() => setIsCreateGroupDialogOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Create Group
          </div>
        </button>
      </div>

      {/* Group list */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            {error}
          </div>
        ) : groupChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No group chats yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create a new group chat to start messaging with multiple people at once.
            </p>
            <button
              onClick={() => setIsCreateGroupDialogOpen(true)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none"
            >
              Create a Group
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {groupChats.map(chat => (
              <div
                key={chat._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleGroupSelect(chat)}
              >
                <div className="flex items-center">
                  {/* Group avatar */}
                  <div className="mr-4 relative">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-200 font-medium text-lg">
                      {chat.chatName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Group details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {chat.chatName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {chat.users.length} members
                      {chat.groupAdmin?._id === user?._id && ' • You are admin'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {chat.latestMessage ? (
                        <>
                          <span className="font-medium">
                            {chat.latestMessage.sender?._id === user?._id
                              ? 'You'
                              : chat.latestMessage.sender?.name || chat.latestMessage.sender?.username}
                          </span>: {' '}
                          {chat.latestMessage.content || 'Attachment'}
                        </>
                      ) : (
                        'No messages yet'
                      )}
                    </p>
                  </div>
                  
                  {/* Time and unread count */}
                  <div className="ml-4 flex flex-col items-end">
                    {chat.latestMessage && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(chat.latestMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    {chat.unreadCount > 0 && (
                      <span className="mt-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={isCreateGroupDialogOpen}
        onClose={() => setIsCreateGroupDialogOpen(false)}
        onSuccess={handleCreateGroupSuccess}
      />
    </div>
  );
};

export default Groups;
