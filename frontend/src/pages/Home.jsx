import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Divider, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Paper,
  Badge,
  Button,
  CircularProgress,
  Grid
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon,
  GroupAdd as GroupAddIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import moment from 'moment';

import AppLayout from '../components/layout/AppLayout';
import { AuthContext } from '../context/AuthProvider';
import { SocketContext } from '../context/SocketProvider';
import { fetchChats, searchUsers, accessChat } from '../lib/api';
import { useChatStore } from '../store/chatStore';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isUserOnline } = useContext(SocketContext);
  const { chats, fetchChats, loading } = useChatStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  // Fetch user's chats
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);
  
  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearchLoading(true);
      const { users } = await searchUsers(searchQuery);
      setSearchResults(users);
      setShowSearch(true);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Navigate to chat
  const navigateToChat = (chatId) => {
    // Validate chatId format before navigation
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(chatId);
    if (!isValidObjectId) {
      console.error('Invalid chat ID format:', chatId);
      toast.error('Invalid chat format');
      return;
    }
    
    console.log('Navigating to chat:', chatId);
    navigate(`/chat/${chatId}`);
  };
  
  // Start new chat
  const startChat = async (userId) => {
    try {
      setSearchLoading(true);
      const { chat } = await accessChat(userId);
      
      // Check if chat already exists in the list
      if (!chats.find(c => c._id === chat._id)) {
        fetchChats([chat, ...chats]);
      }
      
      // Close search and navigate to chat
      setShowSearch(false);
      setSearchQuery('');
      navigate(`/chat/${chat._id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Get chat name and avatar
  const getChatDetails = (chat) => {
    if (!chat) return { name: 'Unknown', avatar: '' };
    
    if (chat.isGroupChat) {
      return { 
        name: chat.name, 
        avatar: chat.groupAvatar
      };
    } else {
      const chatPartner = chat.users.find(u => u._id !== user?._id);
      return { 
        name: chatPartner?.name || 'Unknown', 
        avatar: chatPartner?.avatar || ''
      };
    }
  };
  
  // Get last message preview
  const getLastMessagePreview = (chat) => {
    if (!chat.latestMessage) return 'No messages yet';
    
    const { content, sender } = chat.latestMessage;
    const isSender = sender._id === user?._id;
    const prefix = isSender ? 'You: ' : '';
    
    return `${prefix}${content.length > 25 ? content.substring(0, 25) + '...' : content}`;
  };
  
  // Check if chat partner is online
  const isChatPartnerOnline = (chat) => {
    if (chat.isGroupChat) return false;
    
    const chatPartner = chat.users.find(u => u._id !== user?._id);
    return chatPartner ? isUserOnline(chatPartner._id) : false;
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to the Chat App</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Chats</h2>
          
          {loading ? (
            <p>Loading chats...</p>
          ) : chats.length > 0 ? (
            <div className="space-y-3">
              {chats.map(chat => (
                <div 
                  key={chat._id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/chat/${chat._id}`)}
                >
                  <h3 className="font-medium">{chat.chatName}</h3>
                  {chat.latestMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {chat.latestMessage.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No chats yet. Start a conversation!</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Get Started</h2>
          <button
            onClick={() => navigate('/chat')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Start Chatting
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppLayout(Home);