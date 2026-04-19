import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useContext } from 'react';
import { SocketContext } from '../../context/SocketProvider';
import PropTypes from 'prop-types';

const ChatSidebar = ({ onChatSelect, currentChatId }) => {
  const { user } = useAuthStore();
  const { chats, fetchChats, loading } = useChatStore();
  const { isUserOnline, getTypingUsers } = useContext(SocketContext);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch chats when component mounts
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Format the last message time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      // If it's within the current year, show day and month
      if (messageDate.getFullYear() === today.getFullYear()) {
        return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        // If it's a different year, include the year
        return messageDate.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
      }
    }
  };

  // Get chat name - handle group chats vs direct messages
  const getChatName = (chat) => {
    if (chat.isGroupChat) {
      return chat.chatName;
    }
    
    const chatPartner = chat.users.find(u => u._id !== user?._id);
    return chatPartner?.name || chatPartner?.username || 'Chat';
  };

  // Get avatar for the chat
  const getChatAvatar = (chat) => {
    if (chat.isGroupChat) {
      // Group chat icon instead of null
      return null;
    }
    
    const chatPartner = chat.users.find(u => u._id !== user?._id);
    return chatPartner?.avatar || null;
  };

  // Get last message preview text
  const getLastMessagePreview = (chat) => {
    if (!chat.latestMessage) return 'No messages yet';
    
    const { content, sender, attachments } = chat.latestMessage;
    
    if (attachments && attachments.length > 0) {
      const attachment = attachments[0];
      if (attachment.type?.startsWith('image/')) {
        return '📷 Photo';
      } else if (attachment.type?.startsWith('video/')) {
        return '🎥 Video';
      } else if (attachment.type?.startsWith('audio/')) {
        return '🎵 Audio';
      } else {
        return '📎 File';
      }
    }
    
    const senderName = sender._id === user?._id ? 'You: ' : '';
    const messagePreview = content.length > 25 ? `${content.substring(0, 25)}...` : content;
    
    return `${senderName}${messagePreview}`;
  };

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    const chatName = getChatName(chat).toLowerCase();
    return chatName.includes(searchTerm.toLowerCase());
  });

  // Handle chat selection
  const handleChatClick = (chat) => {
    onChatSelect(chat);
    navigate(`/chat/${chat._id}`);
  };

  return (
    <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Messages</h1>
        <div className="flex space-x-1">
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Chats list */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchTerm && (
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                Start a new chat
              </button>
            )}
          </div>
        ) : (
          <div>
            {filteredChats.map(chat => {
              const chatName = getChatName(chat);
              const avatar = getChatAvatar(chat);
              const isOnline = !chat.isGroupChat && 
                isUserOnline(chat.users.find(u => u._id !== user?._id)?._id);
              const isActive = chat._id === currentChatId;
              const typingUsersInChat = getTypingUsers(chat._id).filter(id => id !== user?._id);
              const isTyping = typingUsersInChat.length > 0;
              const unreadCount = chat.unreadCount || 0;
              
              return (
                <div 
                  key={chat._id} 
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                    isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' : ''
                  }`}
                  onClick={() => handleChatClick(chat)}
                >
                  <div className="flex items-center">
                    {/* Avatar */}
                    <div className="relative mr-3">
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={chatName} 
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                          <span className="text-white font-semibold text-base">
                            {chat.isGroupChat ? '👥' : chatName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {/* Online status indicator - only for individual chats */}
                      {!chat.isGroupChat && isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    
                    {/* Chat details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {chatName}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                          {chat.latestMessage ? formatTime(chat.latestMessage.createdAt) : ''}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-start mt-1">
                        <p className={`text-xs truncate max-w-[85%] ${
                          isTyping ? 'text-blue-600 dark:text-blue-400 font-medium italic' : 
                          (chat.latestMessage?.sender?._id !== user?._id && unreadCount > 0) ? 
                          'text-gray-900 dark:text-gray-100 font-semibold' : 
                          'text-gray-500 dark:text-gray-400'
                        }`}>
                          {isTyping ? 'typing...' : getLastMessagePreview(chat)}
                        </p>
                        
                        {/* Unread messages badge */}
                        {unreadCount > 0 && chat.latestMessage?.sender?._id !== user?._id && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-sm">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

ChatSidebar.propTypes = {
  onChatSelect: PropTypes.func.isRequired,
  currentChatId: PropTypes.string
};

export default ChatSidebar; 