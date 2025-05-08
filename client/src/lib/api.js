import { api } from '../store/authStore';

const API_URL = '/api';
const IS_DEV = process.env.NODE_ENV !== 'production'; // Set to false for production mode

// Create an axios instance with credentials
const apiInstance = api;

// Add a console log to show baseURL
console.log('API baseURL:', api.defaults.baseURL);

// Add request interceptor to handle auth tokens
apiInstance.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.url, 'with method:', config.method);

    // Add retry count to config
    config.retryCount = config.retryCount || 0;
    
    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiInstance.interceptors.response.use(
  (response) => {
    console.log('API response from:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('API response error:', error);
    
    const originalRequest = error.config;
    
    // Handle connection errors with retry logic
    if (error.message === 'Network Error' && originalRequest && originalRequest.retryCount < 3) {
      originalRequest.retryCount += 1;
      console.log(`Retrying request (${originalRequest.retryCount}/3): ${originalRequest.url}`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest.retryCount));
      
      return apiInstance(originalRequest);
    }
    
    // Create a more detailed error object
    const errorObj = {
      message: error.response?.data?.message || error.message || 'Unknown error',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: error.message === 'Network Error'
    };
    
    console.error('Detailed error:', errorObj);
    
    // In development mode with connection issues, return mock data
    if (IS_DEV && errorObj.isNetworkError) {
      console.log('Development mode: Returning mock data for failed request');
      
      // Simple mock data for development
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
        return Promise.resolve({
          data: {
            token: 'dev-mock-token',
            user: {
              _id: 'dev-user-123',
              username: 'devuser',
              email: 'dev@example.com',
              profilePicture: 'default-avatar.png'
            }
          }
        });
      }
      
      if (originalRequest.url.includes('/users/profile')) {
        return Promise.resolve({
          data: {
            _id: 'dev-user-123',
            username: 'devuser',
            email: 'dev@example.com',
            profilePicture: 'default-avatar.png',
            isOnline: true
          }
        });
      }
      
      // Default mock response
      return Promise.resolve({
        data: { message: 'Development mock response' }
      });
    }
    
    return Promise.reject(errorObj);
  }
);

// Helper function to validate MongoDB ObjectId format
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// User APIs
export const registerUser = async (userData) => {
  try {
    const { data } = await apiInstance.post('/users/register', userData);
    return data;
  } catch (error) {
    console.error('API Error - Register:', error);
    throw {
      message: error.response?.data?.message || 'Registration failed',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

export const loginUser = async (credentials) => {
  try {
    const { data } = await apiInstance.post('/users/login', credentials);
    // Store the token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  } catch (error) {
    console.error('API Error - Login:', error);
    throw {
      message: error.response?.data?.message || 'Login failed',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

export const logoutUser = async () => {
  try {
    const { data } = await apiInstance.get('/users/logout');
    return data;
  } catch (error) {
    console.error('API Error - Logout:', error);
    throw {
      message: error.response?.data?.message || 'Logout failed',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

export const getUserProfile = async () => {
  try {
    const { data } = await apiInstance.get('/users/profile');
    return data;
  } catch (error) {
    console.error('API Error - Get User Profile:', error);
    throw {
      message: error.response?.data?.message || 'Failed to get user profile',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

export const updateProfile = async (userData) => {
  try {
    console.log('Updating profile with data:', userData);
    
    const { data } = await apiInstance.patch('/users/profile', userData);
    
    // If we get a new token, update the default authorization header
    if (data.token) {
      apiInstance.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    
    return data;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

export const updatePassword = async (passwordData) => {
  try {
    const { data } = await apiInstance.patch('/users/password', passwordData);
    return data;
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (query) => {
  try {
    const { data } = await apiInstance.get(`/users/search?search=${query}`);
    return data;
  } catch (error) {
    console.error('API Error - Search Users:', error);
    throw {
      message: error.response?.data?.message || 'Failed to search users',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

// Chat APIs
export const fetchChats = async () => {
  try {
    const { data } = await apiInstance.get('/chats');
    return data;
  } catch (error) {
    console.error('API Error - Fetch Chats:', error);
    throw {
      message: error.response?.data?.message || 'Failed to fetch chats',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

export const accessChat = async (userId) => {
  try {
    const { data } = await apiInstance.post('/chats', { userId });
    return data;
  } catch (error) {
    console.error('API Error - Access Chat:', error);
    throw {
      message: error.response?.data?.message || 'Failed to access chat',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

export const createGroupChat = async (name, users) => {
  try {
    const { data } = await apiInstance.post('/chats/group', { name, users });
    return data;
  } catch (error) {
    console.error('API Error - Create Group Chat:', error);
    throw {
      message: error.response?.data?.message || 'Failed to create group chat',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

// Message APIs
export const sendMessage = async (content, chatId) => {
  try {
    const { data } = await apiInstance.post('/messages', { content, chatId });
    return data;
  } catch (error) {
    console.error('API Error - Send Message:', error);
    throw {
      message: error.response?.data?.message || 'Failed to send message',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

export const getAllMessages = async (chatId) => {
  try {
    const { data } = await apiInstance.get(`/messages/${chatId}`);
    return data;
  } catch (error) {
    console.error('API Error - Get All Messages:', error);
    throw {
      message: error.response?.data?.message || 'Failed to get messages',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

export const markAsRead = async (chatId) => {
  try {
    const { data } = await apiInstance.put(`/messages/${chatId}/read`);
    return data;
  } catch (error) {
    console.error('API Error - Mark as Read:', error);
    throw {
      message: error.response?.data?.message || 'Failed to mark messages as read',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const { data } = await apiInstance.delete(`/messages/${messageId}`);
    return data;
  } catch (error) {
    console.error('API Error - Delete Message:', error);
    throw {
      message: error.response?.data?.message || 'Failed to delete message',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
};

// Group APIs
export const getUserGroups = async () => {
  try {
    const { data } = await apiInstance.get('/groups');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getGroupDetails = async (groupId) => {
  try {
    const { data } = await apiInstance.get(`/groups/${groupId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Message APIs
export const getPrivateMessages = async (userId) => {
  try {
    const { data } = await apiInstance.get(`/messages/private/${userId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getGroupMessages = async (groupId) => {
  try {
    const { data } = await apiInstance.get(`/messages/group/${groupId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const sendPrivateMessage = async (messageData) => {
  try {
    const { data } = await apiInstance.post('/messages/private', messageData);
    return data;
  } catch (error) {
    throw error;
  }
};

export const sendGroupMessage = async (messageData) => {
  try {
    const { data } = await apiInstance.post('/messages/group', messageData);
    return data;
  } catch (error) {
    throw error;
  }
};

export const markMessagesAsRead = async (messageIds) => {
  try {
    const { data } = await apiInstance.post('/messages/read', { messageIds });
    return data;
  } catch (error) {
    throw error;
  }
};

// Upload file function with improved error handling
export const uploadFile = async (file, chatId) => {
  try {
    if (!file || !chatId) {
      throw new Error('File and chat ID are required');
    }
    
    console.log('Uploading file:', file.name, 'type:', file.type, 'size:', file.size);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', chatId);
    
    // Log details of the file being uploaded
    console.log('Upload request prepared for:', {
      filename: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      chatId
    });
    
    const { data } = await apiInstance.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      // Add timeout and retry configuration for large files
      timeout: 30000, // 30 seconds timeout for uploads
      maxBodyLength: 25 * 1024 * 1024, // 25MB max body length
      maxContentLength: 25 * 1024 * 1024 // 25MB max content length
    });
    
    console.log('File upload successful:', data);
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Create more descriptive error message
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error during file upload';
    const errorDetails = {
      message: errorMessage,
      status: error.response?.status,
      file: file ? { name: file.name, type: file.type, size: file.size } : null
    };
    
    console.error('Upload error details:', errorDetails);
    throw errorDetails;
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const { data } = await apiInstance.get('/users');
    return data;
  } catch (error) {
    console.error('API Error - Get All Users:', error);
    throw {
      message: error.response?.data?.message || 'Failed to fetch users',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    };
  }
}; 