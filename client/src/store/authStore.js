import { create } from 'zustand';
import axios from 'axios';
import { persist } from 'zustand/middleware';
import { disconnectSocket } from '../services/socket';

// Configure baseURL based on environment
const baseURL = '/api'; // Always use relative path for API requests
console.log('Environment:', process.env.NODE_ENV);

const api = axios.create({
  baseURL,
  withCredentials: true
});

// Add console log for debugging
console.log('Auth API baseURL configured as:', baseURL);

export { api }; // Export api for use in other modules

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      onlineUsers: [],

      login: async (email, password) => {
        try {
          set({ loading: true, error: null });
          
          // Add a small delay to ensure UI shows loading state
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const { data } = await api.post('/users/login', { email, password });
          
          if (data.success) {
            set({
              user: data.user,
              isAuthenticated: true,
              loading: false
            });
            
            // Set token in axios defaults
            if (data.token) {
              api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
              localStorage.setItem('token', data.token);
            }
            return true;
          } else {
            set({
              error: data.message || 'Login failed',
              loading: false
            });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({
            error: error.response?.data?.message || 'An error occurred',
            loading: false
          });
          return false;
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true, error: null });
          
          // Add a small delay to ensure UI shows loading state
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const { data } = await api.post('/users/register', userData);
          
          if (data.success) {
            set({
              user: data.user,
              isAuthenticated: true,
              loading: false
            });
            
            // Set token in axios defaults
            if (data.token) {
              api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
              localStorage.setItem('token', data.token);
            }
            return true;
          } else {
            set({
              error: data.message || 'Registration failed',
              loading: false
            });
            return false;
          }
        } catch (error) {
          console.error('Registration error:', error);
          set({
            error: error.response?.data?.message || 'An error occurred',
            loading: false
          });
          return false;
        }
      },

      logout: async () => {
        try {
          // Disconnect socket before logout
          disconnectSocket();
          
          // Check if we're already logged out to prevent infinite loop
          if (!get().isAuthenticated && !localStorage.getItem('token')) {
            console.log('Already logged out, skipping logout request');
            return true;
          }
          
          // First clear token and state before making the API call
          delete api.defaults.headers.common['Authorization'];
          localStorage.removeItem('token');
          
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            onlineUsers: []
          });
          
          // Try to call the logout API, but don't wait for it
          api.get('/users/logout').catch(error => {
            console.log('Logout API call failed, but user is still logged out locally:', error.message);
          });
          
          return true;
        } catch (error) {
          console.error('Logout error:', error);
          
          // Even if there's an error, clear state
          delete api.defaults.headers.common['Authorization'];
          localStorage.removeItem('token');
          
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            onlineUsers: []
          });
          
          return false;
        }
      },

      clearError: () => set({ error: null }),
      
      // Handle online users
      updateOnlineStatus: (userId, isOnline) => {
        if (isOnline) {
          set((state) => ({
            onlineUsers: state.onlineUsers.includes(userId) 
              ? state.onlineUsers 
              : [...state.onlineUsers, userId]
          }));
        } else {
          set((state) => ({
            onlineUsers: state.onlineUsers.filter(id => id !== userId)
          }));
        }
      },
      
      // Add multiple online users
      setOnlineUsers: (userIds) => {
        set({ onlineUsers: userIds });
      },
      
      // Check if a user is online
      isUserOnline: (userId) => {
        return get().onlineUsers.includes(userId);
      },
      
      // Helper method to check auth status
      checkAuthStatus: () => {
        const { user, isAuthenticated } = get();
        return { isAuthenticated: !!user && isAuthenticated };
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

// Initialize auth token from localStorage
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Axios interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors and avoid infinite loops
    if (error.response?.status === 401 && error.config.url !== '/users/logout') {
      // Check if we haven't already handled this
      if (!error.config._isRetry) {
        error.config._isRetry = true;
        
        // Call logout but don't repeatedly try to call the logout API
        const authStore = useAuthStore.getState();
        if (authStore.isAuthenticated) {
          console.log('401 error detected, logging out user');
          authStore.logout();
        }
      }
    }
    return Promise.reject(error);
  }
); 