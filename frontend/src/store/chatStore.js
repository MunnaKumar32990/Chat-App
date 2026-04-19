import { create } from 'zustand';
import { api } from './authStore';
import { sendMessage as socketSendMessage } from '../services/socket';

export const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: [],
  loading: false,
  error: null,
  typingUsers: {}, // chatId -> [userIds]

  // Fetch all chats
  fetchChats: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/chats');
      
      if (data.success) {
        set({ 
          chats: data.chats || [], 
          loading: false 
        });
      } else {
        throw new Error(data.message || 'Failed to fetch chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      set({
        error: error.response?.data?.message || 'Error fetching chats',
        loading: false
      });
    }
  },

  // Access or create one-on-one chat
  accessChat: async (userId) => {
    try {
      set({ loading: true });
      const { data } = await api.post('/chats', { userId });
      
      if (data.success) {
        // Add chat to list if it's not already there
        const chats = get().chats;
        if (!chats.find(c => c._id === data.chat._id)) {
          set({ chats: [data.chat, ...chats] });
        }
        
        set({ selectedChat: data.chat, loading: false });
        return data.chat;
      } else {
        throw new Error(data.message || 'Failed to access chat');
      }
    } catch (error) {
      console.error('Error accessing chat:', error);
      set({
        error: error.response?.data?.message || 'Error accessing chat',
        loading: false
      });
      return null;
    }
  },

  // Create group chat
  createGroupChat: async (users, name) => {
    try {
      set({ loading: true, error: null });
      const { data } = await api.post('/chats/group', { users, name });
      
      if (data.success) {
        set({
          chats: [data.chat, ...get().chats],
          loading: false
        });
        return data.chat;
      } else {
        throw new Error(data.message || 'Failed to create group chat');
      }
    } catch (error) {
      console.error('Error creating group chat:', error);
      set({
        error: error.response?.data?.message || 'Error creating group chat',
        loading: false
      });
      return null;
    }
  },

  // Rename group
  renameGroup: async (chatId, chatName) => {
    try {
      set({ loading: true, error: null });
      const { data } = await api.put(`/chats/group/${chatId}`, { chatName });
      
      if (data.success) {
        // Update chats list and selected chat
        set({
          chats: get().chats.map(c => c._id === chatId ? data.chat : c),
          selectedChat: get().selectedChat?._id === chatId ? data.chat : get().selectedChat,
          loading: false
        });
        return data.chat;
      } else {
        throw new Error(data.message || 'Failed to rename group');
      }
    } catch (error) {
      console.error('Error renaming group:', error);
      set({
        error: error.response?.data?.message || 'Error renaming group',
        loading: false
      });
      return null;
    }
  },

  // Add user to group
  addToGroup: async (chatId, userId) => {
    try {
      set({ loading: true, error: null });
      const { data } = await api.put(`/chats/group/${chatId}/add`, { userId });
      
      if (data.success) {
        // Update chats list and selected chat
        set({
          chats: get().chats.map(c => c._id === chatId ? data.chat : c),
          selectedChat: get().selectedChat?._id === chatId ? data.chat : get().selectedChat,
          loading: false
        });
        return data.chat;
      } else {
        throw new Error(data.message || 'Failed to add user to group');
      }
    } catch (error) {
      console.error('Error adding user to group:', error);
      set({
        error: error.response?.data?.message || 'Error adding user to group',
        loading: false
      });
      return null;
    }
  },

  // Remove user from group
  removeFromGroup: async (chatId, userId) => {
    try {
      set({ loading: true, error: null });
      const { data } = await api.put(`/chats/group/${chatId}/remove`, { userId });
      
      if (data.success) {
        // Update chats list and selected chat
        set({
          chats: get().chats.map(c => c._id === chatId ? data.chat : c),
          selectedChat: get().selectedChat?._id === chatId ? data.chat : get().selectedChat,
          loading: false
        });
        return data.chat;
      } else {
        throw new Error(data.message || 'Failed to remove user from group');
      }
    } catch (error) {
      console.error('Error removing user from group:', error);
      set({
        error: error.response?.data?.message || 'Error removing user from group',
        loading: false
      });
      return null;
    }
  },

  // Set selected chat
  setSelectedChat: (chat) => {
    set({ selectedChat: chat });
  },

  // Fetch messages for a chat
  fetchMessages: async (chatId) => {
    try {
      set({ loading: true, error: null });
      const { data } = await api.get(`/messages/${chatId}`);
      
      if (data.success) {
        set({ messages: data.messages || [], loading: false });
        return data.messages;
      } else {
        throw new Error(data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({
        error: error.response?.data?.message || 'Error fetching messages',
        loading: false
      });
      return [];
    }
  },

  // Send a message
  sendMessage: async (content, chatId) => {
    try {
      set({ error: null });
      const { data } = await api.post('/messages', { content, chatId });
      
      if (data.success) {
        const newMessage = data.message;
        
        // Update messages state
        set({ messages: [...get().messages, newMessage] });
        
        // Update latest message in chat list
        set({
          chats: get().chats.map(c => 
            c._id === chatId ? { ...c, latestMessage: newMessage } : c
          )
        });
        
        // Send via socket
        socketSendMessage(newMessage);
        
        return newMessage;
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      set({
        error: error.response?.data?.message || 'Error sending message'
      });
      return null;
    }
  },

  // Add new message to state (used with socket.io)
  addMessage: (message) => {
    // Avoid duplicate messages
    const existingMessage = get().messages.find(m => m._id === message._id);
    if (existingMessage) return;
    
    set({
      messages: [...get().messages, message],
      chats: get().chats.map(c => 
        c._id === message.chat._id ? { ...c, latestMessage: message } : c
      )
    });
  },
  
  // Set typing indicator
  setTypingUser: (chatId, userId, isTyping) => {
    set(state => {
      const currentTypingUsers = state.typingUsers[chatId] || [];
      
      if (isTyping && !currentTypingUsers.includes(userId)) {
        // Add user to typing list
        return {
          typingUsers: {
            ...state.typingUsers,
            [chatId]: [...currentTypingUsers, userId]
          }
        };
      } else if (!isTyping && currentTypingUsers.includes(userId)) {
        // Remove user from typing list
        return {
          typingUsers: {
            ...state.typingUsers,
            [chatId]: currentTypingUsers.filter(id => id !== userId)
          }
        };
      }
      
      return state;
    });
  },
  
  // Get typing users for a chat
  getTypingUsers: (chatId) => {
    return get().typingUsers[chatId] || [];
  },
  
  // Sort chats by last message time
  sortChats: () => {
    set(state => ({
      chats: [...state.chats].sort((a, b) => {
        const aTime = a.latestMessage?.createdAt || a.createdAt;
        const bTime = b.latestMessage?.createdAt || b.createdAt;
        return new Date(bTime) - new Date(aTime);
      })
    }));
  },
  
  clearError: () => set({ error: null })
})); 