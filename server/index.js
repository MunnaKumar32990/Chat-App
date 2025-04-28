const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

// Routes
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Load environment variables
dotenv.config();

// Define JWT Secret (fallback if not in env)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// Define PORT variable 
const PORT = process.env.PORT || 5002;

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Security middleware
if (process.env.NODE_ENV === 'production') {
  // Use Helmet in production to set security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "wss:", "ws:"] // Allow WebSocket connections
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow loading resources from different origins
    crossOriginEmbedderPolicy: false // Allow embedding cross-origin resources
  }));
  
  // Use compression in production to compress responses
  app.use(compression());
}

// Middleware - order matters!
app.use(cookieParser());
app.use(express.json());

// Handle CORS based on environment
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://chat-app-frontend.onrender.com', 'https://chat-app.onrender.com'] 
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', (req, res) => {
  // This handler will execute if the file is not found
  res.status(404).json({
    success: false,
    message: 'File not found'
  });
});

// Set cookie options globally
app.use((req, res, next) => {
  // Log cookies on every request
  console.log('Request cookies:', req.cookies);
  
  // Set default cookie options for the application
  res.cookie = (name, value, options = {}) => {
    const defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    };
    
    return express.response.cookie.call(
      res,
      name,
      value,
      { ...defaultOptions, ...options }
    );
  };
  
  next();
});

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Debugging route to see all registered routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  
  // Function to extract routes from a router
  function extractRoutes(router, prefix = '') {
    router.stack.forEach(layer => {
      if (layer.route) {
        // Regular route
        const path = prefix + layer.route.path;
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
        routes.push(`${methods} ${path}`);
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Nested router
        const newPrefix = prefix + (layer.regexp.source.replace('^\\/(?=\\/|$)', '/').replace(/\\\//g, '/').replace(/\?(?:\/)?$/,''));
        extractRoutes(layer.handle, newPrefix);
      }
    });
  }
  
  // Extract routes from the main app
  app._router.stack.forEach(layer => {
    if (layer.name === 'router' && layer.handle.stack) {
      extractRoutes(layer.handle, '');
    }
  });
  
  res.json({
    routes: routes.sort(),
    routeCount: routes.length
  });
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  // Serve the HTML file for any request that doesn't match an API route
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
} else {
  // Base route for development
  app.get('/', (req, res) => {
    res.send('Chat App API is running');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle server startup and port conflicts
const startServer = async () => {
  try {
    // Check if port is in use and handle gracefully
    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the process using this port and try again.`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
        process.exit(1);
      }
    });

    // Start the server
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Connect to MongoDB
    mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://munnakushw7:LlCXbfwq31gCDwXG@notesapp.ier5n.mongodb.net/chat-app')
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
      });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });

  // Force close if it takes too long
  setTimeout(() => {
    console.error('Forced shutdown after timeout!');
    process.exit(1);
  }, 5000);
});

// Start the server
startServer();

// Socket.io connection handling
const userSocketMap = new Map(); // Maps userId to socketId
const onlineUsers = new Set(); // Tracks online user IDs

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Setup event to associate user ID with socket
  socket.on('setup', (userData) => {
    if (userData && userData._id) {
      socket.userId = userData._id;
      userSocketMap.set(userData._id, socket.id);
      onlineUsers.add(userData._id);
      
      console.log('User setup with ID:', userData._id);
      console.log('Online users:', Array.from(onlineUsers));
      
      // Let others know this user is online
      socket.broadcast.emit('user_connected', userData);
    }
  });
  
  // Explicitly handle user going online
  socket.on('user_online', (userId) => {
    if (userId) {
      onlineUsers.add(userId);
      socket.broadcast.emit('user_connected', { _id: userId });
      console.log(`User ${userId} is now online`);
    }
  });
  
  // Explicitly handle user going offline
  socket.on('user_offline', (userId) => {
    if (userId) {
      onlineUsers.delete(userId);
      socket.broadcast.emit('user_disconnected', userId);
      console.log(`User ${userId} is now offline`);
    }
  });
  
  // Get all online users
  socket.on('get_online_users', () => {
    socket.emit('online_users', Array.from(onlineUsers));
  });
  
  // Join a chat room
  socket.on('join_chat', (chatId) => {
    if (!chatId) return;
    
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });
  
  // Leave a chat room
  socket.on('leave_chat', (chatId) => {
    if (!chatId) return;
    
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat: ${chatId}`);
  });
  
  // Send new message
  socket.on('new_message', (messageData) => {
    if (!messageData || !messageData.chat) return;
    
    const chat = messageData.chat._id || messageData.chat;
    console.log(`New message in chat: ${chat} from user: ${messageData.sender?._id || 'unknown'}`);
    
    // Send to everyone in the chat except sender
    socket.to(chat).emit('receive_message', messageData);
  });
  
  // User typing indicator
  socket.on('typing', ({ chatId, userId }) => {
    if (!chatId) return;
    
    console.log(`User ${userId} is typing in chat: ${chatId}`);
    socket.to(chatId).emit('typing', { chatId, userId });
  });
  
  // User stopped typing
  socket.on('stop_typing', ({ chatId, userId }) => {
    if (!chatId) return;
    
    console.log(`User ${userId} stopped typing in chat: ${chatId}`);
    socket.to(chatId).emit('stop_typing', { chatId, userId });
  });
  
  // Mark message as read
  socket.on('message_read', ({ messageId, chatId, userId }) => {
    if (!messageId || !chatId || !userId) return;
    
    console.log(`User ${userId} read message ${messageId} in chat ${chatId}`);
    socket.to(chatId).emit('message_read', { messageId, userId });
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      // Remove user from tracking
      userSocketMap.delete(socket.userId);
      
      // Check if user has other active connections before marking offline
      const stillConnected = [...io.sockets.sockets.values()].some(
        s => s.id !== socket.id && s.userId === socket.userId
      );
      
      if (!stillConnected) {
        onlineUsers.delete(socket.userId);
        // Let others know this user is offline
        socket.broadcast.emit('user_disconnected', socket.userId);
        console.log('User disconnected and went offline:', socket.userId);
      } else {
        console.log('User disconnected but still has other sessions:', socket.userId);
      }
    } else {
      console.log('Unidentified user disconnected:', socket.id);
    }
  });
}); 