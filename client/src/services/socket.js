import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

let socket;

export const connectSocket = () => {
  const user = useAuthStore.getState().user;
  
  if (user && !socket) {
    socket = io('http://localhost:5002', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.emit('setup', user);

    socket.on('connect', () => {
      console.log('Socket connected');
      // Update user's online status
      socket.emit('user_online', user._id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    // Set up socket error handling
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      // Re-setup user after reconnection
      if (user) {
        socket.emit('setup', user);
        socket.emit('user_online', user._id);
      }
    });
  }
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    // Notify server that user is going offline
    const user = useAuthStore.getState().user;
    if (user) {
      socket.emit('user_offline', user._id);
    }
    
    socket.disconnect();
    socket = null;
  }
};

export const joinChat = (chatId) => {
  if (socket && chatId) {
    socket.emit('join_chat', chatId);
  }
};

export const leaveChat = (chatId) => {
  if (socket && chatId) {
    socket.emit('leave_chat', chatId);
  }
};

export const sendMessage = async (messageData) => {
  if (socket) {
    socket.emit('new_message', messageData);
    return true;
  }
  return false;
};

export const emitTyping = (chatId, userId) => {
  if (socket && chatId && userId) {
    socket.emit('typing', { chatId, userId });
  }
};

export const emitStopTyping = (chatId, userId) => {
  if (socket && chatId && userId) {
    socket.emit('stop_typing', { chatId, userId });
  }
};

// Setup message listeners
export const setupMessageListeners = (addMessageCallback) => {
  if (socket) {
    // Remove existing listeners to prevent duplicates
    removeMessageListeners();
    
    socket.on('receive_message', (newMessage) => {
      const selectedChat = useChatStore.getState().selectedChat;
      
      if (selectedChat?._id === newMessage.chat._id) {
        useChatStore.getState().addMessage(newMessage);
        
        // If callback provided, call it
        if (addMessageCallback) {
          addMessageCallback(newMessage);
        }
      }
    });

    socket.on('typing', ({ chatId, userId }) => {
      // Handle typing indicator
      console.log(`User ${userId} is typing in chat ${chatId}`);
      useChatStore.getState().setTypingUser(chatId, userId, true);
    });

    socket.on('stop_typing', ({ chatId, userId }) => {
      // Handle stop typing
      console.log(`User ${userId} stopped typing in chat ${chatId}`);
      useChatStore.getState().setTypingUser(chatId, userId, false);
    });
    
    // Handle user online status updates
    socket.on('user_connected', (userData) => {
      console.log('User came online:', userData._id);
      useAuthStore.getState().updateOnlineStatus(userData._id, true);
    });
    
    socket.on('user_disconnected', (userId) => {
      console.log('User went offline:', userId);
      useAuthStore.getState().updateOnlineStatus(userId, false);
    });
  }
};

// Remove message listeners
export const removeMessageListeners = () => {
  if (socket) {
    socket.off('receive_message');
    socket.off('typing');
    socket.off('stop_typing');
    socket.off('user_connected');
    socket.off('user_disconnected');
  }
};

// Get the socket instance
export const getSocket = () => socket; 