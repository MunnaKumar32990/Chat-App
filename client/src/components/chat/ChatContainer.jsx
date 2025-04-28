import React, { useState, useEffect, useRef, useContext } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { SocketContext } from '../../context/SocketProvider';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import PropTypes from 'prop-types';

const ChatContainer = ({ chatId, onBack }) => {
  const { user } = useAuthStore();
  const { fetchMessages, messages, sendMessage, loading } = useChatStore();
  const { getTypingUsers, isUserOnline } = useContext(SocketContext);
  const [showProfile, setShowProfile] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Fetch messages and chat details when chat changes
  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
      
      // Fetch chat details
      const fetchChatDetails = async () => {
        // You would need to implement this function to get the chat details
        const { chats } = await useChatStore.getState().fetchChats();
        const chat = chats.find(c => c._id === chatId);
        setCurrentChat(chat || null);
      };
      
      fetchChatDetails();
    }
  }, [chatId, fetchMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle scrolling to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);
  
  // Detect when user scrolls up to disable auto-scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isScrolledToBottom);
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle sending a message
  const handleSendMessage = async (content, attachments = [], replyingTo = null) => {
    if (!chatId || (!content.trim() && attachments.length === 0)) return;
    
    const messageData = {
      content,
      chatId,
      attachments,
      replyTo: replyingTo?._id || null
    };
    
    const success = await sendMessage(content, chatId, attachments, replyingTo?._id);
    
    if (success) {
      // Clear reply state if we were replying
      if (replyingTo) {
        setReplyTo(null);
      }
      
      // Scroll to bottom
      scrollToBottom();
    }
  };
  
  // Handle replying to a message
  const handleReply = (message) => {
    setReplyTo(message);
  };
  
  // Handle canceling a reply
  const handleCancelReply = () => {
    setReplyTo(null);
  };
  
  // Get chat name
  const getChatName = () => {
    if (!currentChat) return '';
    
    if (currentChat.isGroupChat) {
      return currentChat.chatName;
    }
    
    const chatPartner = currentChat.users.find(u => u._id !== user?._id);
    return chatPartner?.name || chatPartner?.username || 'Chat';
  };
  
  // Get chat avatar
  const getChatAvatar = () => {
    if (!currentChat) return null;
    
    if (currentChat.isGroupChat) {
      return null; // Group chat placeholder
    }
    
    const chatPartner = currentChat.users.find(u => u._id !== user?._id);
    return chatPartner?.avatar || null;
  };
  
  // Check if chat partner is online (only for 1-on-1 chats)
  const isChatPartnerOnline = () => {
    if (!currentChat || currentChat.isGroupChat) return false;
    
    const chatPartner = currentChat.users.find(u => u._id !== user?._id);
    return chatPartner && isUserOnline(chatPartner._id);
  };
  
  // Format typing indicator text
  const getTypingIndicatorText = () => {
    if (!chatId) return '';
    
    const typingUsers = getTypingUsers(chatId).filter(id => id !== user?._id);
    
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return 'typing...';
    if (typingUsers.length === 2) return 'are typing...';
    return 'several people are typing...';
  };

  // Toggle profile visibility
  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };
  
  // Get chat partner for user profile
  const getChatPartner = () => {
    if (!currentChat || currentChat.isGroupChat) return null;
    return currentChat.users.find(u => u._id !== user?._id);
  };
  
  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!getTypingUsers(chatId) || getTypingUsers(chatId).length === 0) return null;
    
    const typingText = currentChat?.isGroupChat
      ? `${getTypingUsers(chatId).map(user => user.username).join(', ')} ${getTypingUsers(chatId).length > 1 ? 'are' : 'is'} typing...`
      : 'Typing...';
    
    return (
      <div className="px-4 py-2 text-xs text-gray-500 italic">
        <div className="flex items-center">
          <div className="flex space-x-1 mr-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          {typingText}
        </div>
      </div>
    );
  };

  // Show scroll to bottom button when auto-scroll is disabled
  const renderScrollToBottomButton = () => {
    if (autoScroll) return null;

    return (
      <button
        onClick={() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          setAutoScroll(true);
        }}
        className="absolute bottom-20 right-4 p-2 bg-primary-500 text-white rounded-full shadow-lg z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>
    );
  };

  // Group messages by date
  const messagesByDate = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  return (
    <div className="flex h-full">
      {/* Main chat container */}
      <div className="flex flex-col flex-1 h-full">
        {/* Chat header */}
        <div className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button 
            className="p-1 mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 md:hidden"
            onClick={onBack}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div 
            className="flex items-center flex-1 cursor-pointer"
            onClick={toggleProfile}
          >
            <div className="relative">
              {getChatAvatar() ? (
                <img 
                  src={getChatAvatar()} 
                  alt={getChatName()} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {getChatName().charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {!currentChat?.isGroupChat && isChatPartnerOnline() && (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
              )}
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {getChatName()}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {!currentChat?.isGroupChat && isChatPartnerOnline() 
                  ? 'Online' 
                  : getTypingIndicatorText() || (!currentChat?.isGroupChat ? 'Offline' : '')}
              </p>
            </div>
          </div>
          
          <div className="flex">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Messages container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 chat-bg-pattern"
        >
          {/* Messages grouped by date */}
          {Object.entries(messagesByDate).map(([date, msgs]) => (
            <div key={date} className="space-y-3">
              {/* Date separator */}
              <div className="flex justify-center">
                <div className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                  {date === new Date().toLocaleDateString() ? 'Today' : date}
                </div>
              </div>
              
              {/* Messages for this date */}
              {msgs.map((message, index) => {
                const isOwnMessage = message.sender._id === user?._id;
                
                return (
                  <ChatMessage
                    key={message._id || index}
                    id={message._id}
                    message={message}
                    isOwnMessage={isOwnMessage}
                    onReply={() => handleReply(message)}
                  />
                );
              })}
            </div>
          ))}
          
          {/* Empty chat state */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Send a message to start chatting</p>
            </div>
          )}
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}
          
          {/* Typing indicator */}
          {renderTypingIndicator()}
          
          {/* This element helps us scroll to the bottom */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Scroll to bottom button */}
        {renderScrollToBottomButton()}
        
        {/* Chat input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          placeholder="Type a message"
        />
      </div>
      
      {/* Profile sidebar - only visible when toggled */}
      {showProfile && (
        <div className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out transform">
          <div className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profile</h3>
              <button 
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                onClick={toggleProfile}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {currentChat?.isGroupChat ? (
              // Group chat profile
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mb-4">
                  <span className="text-gray-700 dark:text-gray-200 font-medium text-4xl">
                    {getChatName().charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {getChatName()}
                </h2>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {currentChat.users.length} participants
                </p>
                
                <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Participants</h4>
                  <div className="space-y-3 mt-2">
                    {currentChat.users.map(participant => (
                      <div key={participant._id} className="flex items-center">
                        {participant.avatar ? (
                          <img 
                            src={participant.avatar} 
                            alt={participant.username} 
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                              {participant.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {participant.username}
                            {participant._id === user?._id && ' (You)'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isUserOnline(participant._id) ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Individual chat profile
              <div className="flex flex-col items-center">
                {getChatPartner()?.avatar ? (
                  <img 
                    src={getChatPartner().avatar} 
                    alt={getChatName()}
                    className="w-32 h-32 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mb-4">
                    <span className="text-gray-700 dark:text-gray-200 font-medium text-4xl">
                      {getChatName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {getChatName()}
                </h2>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {isChatPartnerOnline() ? 'Online' : 'Offline'}
                </p>
                
                {getChatPartner()?.phone && (
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">{getChatPartner().phone}</span>
                  </div>
                )}
                
                {getChatPartner()?.email && (
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">{getChatPartner().email}</span>
                  </div>
                )}
                
                {getChatPartner()?.bio && (
                  <div className="mt-4 w-full">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">About</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {getChatPartner().bio}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

ChatContainer.propTypes = {
  chatId: PropTypes.string,
  onBack: PropTypes.func.isRequired
};

export default ChatContainer; 