import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

let socket;

// Get base URL based on environment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, the socket connection should be to the same origin
    return window.location.origin;
  }
  // In development, connect to the development server
  return 'http://localhost:5002';
};

export const connectSocket = (token) => {
  if (socket && socket.connected) return socket;
  
  const baseUrl = getBaseUrl();
  console.log(`Connecting to socket at ${baseUrl}`);
  
  const socketOptions = {
    withCredentials: true,
    auth: {
      token
    },
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'] // Try WebSocket first, then fall back to polling
  };
  
  socket = io(baseUrl, socketOptions);
  
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
  
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};

export const emitEvent = (event, data) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn('Socket not connected. Event not emitted:', event);
  }
};

export const subscribeToEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
    return () => socket.off(event, callback);
  }
  return () => {};
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

export default {
  connectSocket,
  getSocket,
  disconnectSocket,
  emitEvent,
  subscribeToEvent,
  joinChat,
  leaveChat,
  sendMessage,
  emitTyping,
  emitStopTyping,
  setupMessageListeners,
  removeMessageListeners
}; 