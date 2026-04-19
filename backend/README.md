# Chat Application - Backend

RESTful API and WebSocket server for the real-time chat application.

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Helmet** - Security headers
- **Bcrypt** - Password hashing

## 📁 Project Structure

```
backend/
├── controllers/        # Route controllers
│   ├── chatController.js
│   ├── messageController.js
│   └── userController.js
├── middleware/        # Custom middleware
│   └── auth.js       # JWT authentication
├── models/           # Mongoose models
│   ├── Chat.js
│   ├── Message.js
│   └── User.js
├── routes/           # API routes
│   ├── chatRoutes.js
│   ├── messageRoutes.js
│   └── userRoutes.js
├── utils/            # Utility functions
│   ├── errorHandler.js
│   └── tokenGenerator.js
├── uploads/          # File upload directory
│   ├── avatars/
│   └── attachments/
├── .env.example      # Environment variables template
├── index.js          # Main server file
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### Environment Variables

Create a `.env` file:

```env
PORT=5002
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
MAX_FILE_SIZE=20971520
UPLOAD_DIR=./uploads
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Start Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will run on http://localhost:5002

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## 📝 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users/search` - Search users
- `GET /api/users` - Get all users

### Chats
- `GET /api/chats` - Get user chats
- `POST /api/chats` - Create/access one-on-one chat
- `POST /api/chats/group` - Create group chat
- `PUT /api/chats/group/:chatId` - Update group
- `PUT /api/chats/group/:chatId/add` - Add user to group
- `PUT /api/chats/group/:chatId/remove` - Remove user from group

### Messages
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages` - Send message
- `POST /api/messages/upload` - Upload file
- `PUT /api/messages/:chatId/read` - Mark messages as read
- `DELETE /api/messages/:messageId` - Delete message

### Health Check
- `GET /api/health` - Server health status

## 🔌 WebSocket Events

### Client → Server
- `setup` - Initialize user connection
- `join_chat` - Join chat room
- `leave_chat` - Leave chat room
- `new_message` - Send new message
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `message_read` - Mark message as read
- `user_online` - User went online
- `user_offline` - User went offline
- `get_online_users` - Request online users list

### Server → Client
- `user_connected` - User came online
- `user_disconnected` - User went offline
- `online_users` - List of online users
- `receive_message` - New message received
- `typing` - Someone is typing
- `stop_typing` - Stopped typing
- `message_read` - Message was read

## 🗄️ Database Models

### User Model
```javascript
{
  username: String,
  name: String,
  email: String,
  password: String (hashed),
  avatar: String,
  bio: String,
  status: String (online/offline),
  lastSeen: Date
}
```

### Chat Model
```javascript
{
  chatName: String,
  isGroupChat: Boolean,
  users: [ObjectId],
  latestMessage: ObjectId,
  groupAdmin: ObjectId,
  avatar: String
}
```

### Message Model
```javascript
{
  sender: ObjectId,
  content: String,
  chat: ObjectId,
  readBy: [ObjectId],
  isFileMessage: Boolean,
  fileUrl: String,
  fileType: String,
  fileName: String,
  fileSize: Number
}
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- HTTP-only cookies
- CORS configuration
- Helmet.js security headers
- Input validation
- File upload restrictions
- Environment variable protection

## 📊 Performance Optimizations

- Database indexing
- Connection pooling
- Compression middleware
- Static file caching
- Efficient query population

## 🧪 Testing

```bash
# Run tests
npm test

# Test MongoDB connection
node -e "require('./index.js')"
```

## 🚢 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure CORS origins
5. Enable HTTPS

### Recommended Services
- **Hosting**: Render, Heroku, AWS, DigitalOcean
- **Database**: MongoDB Atlas
- **File Storage**: AWS S3, Cloudinary

## 🤝 Contributing

1. Follow RESTful API conventions
2. Use async/await for asynchronous operations
3. Implement proper error handling
4. Add input validation
5. Write meaningful commit messages
6. Document new endpoints

## 📝 Notes

- File uploads limited to 20MB
- Supported file types: images, documents, audio
- JWT tokens expire after 30 days
- WebSocket connections auto-reconnect
