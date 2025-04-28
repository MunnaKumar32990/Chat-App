import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatContainer from '../components/chat/ChatContainer';

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { fetchChats, chats, setSelectedChat } = useChatStore();
  const [showSidebar, setShowSidebar] = useState(!chatId);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);
  
  // Set selected chat based on URL param
  useEffect(() => {
    if (chats.length > 0 && chatId) {
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        setSelectedChat(chat);
        setShowSidebar(false);
      } else if (initialLoad) {
        // If chat not found and it's the initial load, navigate to chat index
        navigate('/chat', { replace: true });
      }
      setInitialLoad(false);
    } else if (chats.length > 0 && !chatId && !initialLoad) {
      // Reset selected chat when navigating back to chat index
      setSelectedChat(null);
      setShowSidebar(true);
    }
  }, [chats, chatId, setSelectedChat, initialLoad, navigate]);
  
  // Handle chat selection
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    navigate(`/chat/${chat._id}`);
    setShowSidebar(false);
  };
  
  // Handle going back to the sidebar on mobile
  const handleBackToSidebar = () => {
    setShowSidebar(true);
    navigate('/chat');
  };
  
  return (
    <div className="flex h-full">
      {/* Chat Sidebar - visible on larger screens or when no chat is selected on mobile */}
      <div 
        className={`
          ${showSidebar ? 'block' : 'hidden md:block'} 
          w-full md:w-80 lg:w-96 h-full overflow-hidden flex-shrink-0 border-r border-gray-200 dark:border-gray-700
        `}
      >
        <ChatSidebar 
          onChatSelect={handleChatSelect}
          currentChatId={chatId}
        />
      </div>
      
      {/* Chat Container - hidden when showing sidebar on mobile */}
      <div 
        className={`
          ${!showSidebar ? 'block' : 'hidden md:block'} 
          flex-1 h-full overflow-hidden
        `}
      >
        {chatId ? (
          <ChatContainer 
            chatId={chatId}
            onBack={handleBackToSidebar}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 chat-bg-pattern">
            <div className="text-center p-8 max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Select a chat to start messaging</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Choose an existing conversation or start a new chat to begin messaging.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;