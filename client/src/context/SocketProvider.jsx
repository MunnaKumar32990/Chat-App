import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthProvider';
import { useAuthStore } from '../store/authStore';
import {
  connectSocket,
  disconnectSocket,
  joinChat,
  leaveChat,
  setupMessageListeners,
  removeMessageListeners,
  getSocket
} from '../services/socket';

// Create context
export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      console.log('Initializing socket connection for user:', user._id);
      
      // Connect to socket
      const socket = connectSocket();
      
      if (socket) {
        // Track connection status
        const handleConnect = () => {
          console.log('Socket connected');
          setIsConnected(true);
          setReconnecting(false);
        };
        
        const handleDisconnect = () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        };
        
        const handleReconnecting = () => {
          console.log('Socket reconnecting...');
          setReconnecting(true);
        };
        
        const handleUserConnected = (userData) => {
          console.log('User connected:', userData._id);
          setOnlineUsers(prev => [...prev.filter(id => id !== userData._id), userData._id]);
        };
        
        const handleUserDisconnected = (userId) => {
          console.log('User disconnected:', userId);
          setOnlineUsers(prev => prev.filter(id => id !== userId));
        };
        
        const handleOnlineUsers = (userIds) => {
          console.log('Received online users:', userIds);
          setOnlineUsers(userIds);
        };
        
        const handleTyping = ({ chatId, userId }) => {
          setTypingUsers(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), userId]
          }));
        };
        
        const handleStopTyping = ({ chatId, userId }) => {
          setTypingUsers(prev => ({
            ...prev,
            [chatId]: (prev[chatId] || []).filter(id => id !== userId)
          }));
        };
        
        // Set up event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('reconnect_attempt', handleReconnecting);
        socket.on('user_connected', handleUserConnected);
        socket.on('user_disconnected', handleUserDisconnected);
        socket.on('online_users', handleOnlineUsers);
        socket.on('typing', handleTyping);
        socket.on('stop_typing', handleStopTyping);
        
        // Request current online users
        socket.emit('get_online_users');
        
        // Set initial connection status
        setIsConnected(socket.connected);
        
        // Setup message listeners
        setupMessageListeners();
        
        // Cleanup on unmount
        return () => {
          socket.off('connect', handleConnect);
          socket.off('disconnect', handleDisconnect);
          socket.off('reconnect_attempt', handleReconnecting);
          socket.off('user_connected', handleUserConnected);
          socket.off('user_disconnected', handleUserDisconnected);
          socket.off('online_users', handleOnlineUsers);
          socket.off('typing', handleTyping);
          socket.off('stop_typing', handleStopTyping);
          
          // Remove message listeners
          removeMessageListeners();
          
          // Disconnect
          disconnectSocket();
        };
      }
    } else {
      // User not authenticated, make sure socket is disconnected
      disconnectSocket();
      setIsConnected(false);
      setOnlineUsers([]);
    }
  }, [isAuthenticated, user?._id]);

  // Handle send message through socket
  const sendMessage = (message) => {
    const socket = getSocket();
    if (socket && message) {
      socket.emit('new_message', message);
      return true;
    }
    return false;
  };

  // Join a chat room
  const handleJoinChat = (chatId) => {
    if (!chatId) return;
    joinChat(chatId);
  };

  // Leave a chat room
  const handleLeaveChat = (chatId) => {
    if (!chatId) return;
    leaveChat(chatId);
  };

  // Emit typing indicator
  const emitTyping = (chatId) => {
    const socket = getSocket();
    if (socket && chatId && user?._id) {
      socket.emit('typing', { chatId, userId: user._id });
    }
  };

  // Emit stop typing
  const emitStopTyping = (chatId) => {
    const socket = getSocket();
    if (socket && chatId && user?._id) {
      socket.emit('stop_typing', { chatId, userId: user._id });
    }
  };

  // Check if a user is online
  const isUserOnline = (userId) => onlineUsers.includes(userId);

  // Get typing users for a chat
  const getTypingUsers = (chatId) => typingUsers[chatId] || [];

  // Context value
  const value = {
    onlineUsers,
    isConnected,
    reconnecting,
    typingUsers,
    sendMessage,
    joinChat: handleJoinChat,
    leaveChat: handleLeaveChat,
    emitTyping,
    emitStopTyping,
    isUserOnline,
    getTypingUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider; 