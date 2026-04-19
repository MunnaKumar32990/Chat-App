import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getUserProfile, logoutUser as apiLogoutUser, loginUser as apiLoginUser } from '../lib/api';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

// Create context
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from API on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        // Check if a previous session exists
        const prevSession = localStorage.getItem('isAuthenticated');
        
        if (!prevSession) {
          setLoading(false);
          return;
        }
        
        console.log('Attempting to load user profile...');
        const response = await getUserProfile();
        if (response?.user) {
          console.log('User profile loaded successfully:', response.user._id);
          // Set user data in state
          // This is for backward compatibility
          console.log("User updated through context", response.user);
        } else {
          throw new Error('Invalid user data received');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        
        // Show error message only if it's not a network error
        if (!error.isNetworkError) {
          setError(error.message || 'Failed to load user');
          toast.error('Session expired. Please login again.');
        } else {
          setError('Network error. Please check your connection.');
          toast.error('Network error. Please check your connection.');
        }
        
        // Clear session on auth errors
        localStorage.removeItem('isAuthenticated');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Update user function
  const updateUser = (userData) => {
    // This function is for backward compatibility
    console.log("User updated through context", userData);
  };

  // Logout function
  const logoutUser = useCallback(async () => {
    try {
      await apiLogoutUser();
      // Set user data in state
      // This is for backward compatibility
      console.log("User logged out");
      localStorage.removeItem('isAuthenticated');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  }, []);

  // Login function
  const loginUser = async (credentials) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', credentials.email);
      const { user } = await apiLoginUser(credentials);
      console.log('Login successful for:', user.email);
      
      // Set user data in state
      // This is for backward compatibility
      console.log("User updated through context", user);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Clear any previous errors
      setError(null);
      
      // Show success message
      toast.success(`Welcome back, ${user.name}!`);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      
      // Show appropriate error message based on error type
      if (error.isNetworkError) {
        toast.error('Network error. Please check your connection and try again.');
        setError('Network error. Please check your connection.');
      } else if (error.status === 401) {
        toast.error('Invalid email or password');
        setError('Invalid email or password');
      } else {
        toast.error(error.message || 'Login failed. Please try again.');
        setError(error.message || 'Login failed');
      }
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Value to be provided to context consumers
  const value = {
    user,
    loading,
    error,
    updateUser,
    logoutUser,
    loginUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 