require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

console.log('Starting server...');
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const server = http.createServer(app);

// Improved Socket.IO CORS configuration
const io = socketIO(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174', 
      process.env.CLIENT_URL
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    process.env.CLIENT_URL
  ],
  credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Log API requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle user setup
  socket.on('setup', (userData) => {
    if (userData?._id) {
      socket.join(userData._id);
      socket.emit('connected');
      io.emit('user_online', { userId: userData._id });
    }
  });

  // Handle joining chat rooms
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    socket.emit('joined_chat', chatId);
    socket.broadcast.to(chatId).emit('user_joined', { chatId, userId: socket.userId });
  });

  // Handle messages
  socket.on('new_message', (messageData) => {
    const chat = messageData.chat;
    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id === messageData.sender._id) return;
      socket.in(user._id).emit('message_received', messageData);
    });
  });

  // Handle typing status
  socket.on('typing', (chatId) => {
    socket.broadcast.to(chatId).emit('typing', { chatId, userId: socket.userId });
  });

  socket.on('stop_typing', (chatId) => {
    socket.broadcast.to(chatId).emit('stop_typing', { chatId, userId: socket.userId });
  });

  // Handle read receipts
  socket.on('message_read', ({ messageId, chatId, userId }) => {
    socket.broadcast.to(chatId).emit('message_read_update', { messageId, userId });
  });

  // Handle user presence
  socket.on('disconnect', () => {
    if (socket.userId) {
      io.emit('user_offline', { userId: socket.userId });
    }
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    mode: 'Development with mock data'
  });
});

// Mock auth routes
app.post('/api/auth/register', (req, res) => {
  console.log('Mock register:', req.body);
  res.status(201).json({
    token: 'mock-jwt-token',
    user: {
      _id: 'mock-user-123',
      username: req.body.username || 'testuser',
      email: req.body.email || 'test@example.com',
      profilePicture: 'default-avatar.png',
      isOnline: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Mock login:', req.body);
  res.json({
    token: 'mock-jwt-token',
    user: {
      _id: 'mock-user-123',
      username: 'testuser',
      email: req.body.email || 'test@example.com',
      profilePicture: 'default-avatar.png',
      isOnline: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  console.log('Mock logout');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/users/profile', (req, res) => {
  console.log('Mock profile request');
  res.json({
    _id: 'mock-user-123',
    username: 'testuser',
    email: 'test@example.com',
    profilePicture: 'default-avatar.png',
    isOnline: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

// Generic mock API response for any other routes
app.all('/api/*', (req, res) => {
  console.log('Generic mock API response for:', req.method, req.originalUrl);
  
  if (req.method === 'GET') {
    res.json({ 
      message: 'Mock data for GET request',
      path: req.originalUrl,
      data: [] 
    });
  } else {
    res.json({ 
      message: 'Mock success response',
      path: req.originalUrl,
      success: true
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
}); 