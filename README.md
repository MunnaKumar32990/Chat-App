# Real-Time Chat Application

A professional, production-ready real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO.

## 🚀 Features

### Core Features
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **User Authentication**: Secure JWT-based authentication
- **Online Presence**: Real-time online/offline status tracking
- **Typing Indicators**: See when others are typing
- **Group Chats**: Create and manage group conversations
- **File Sharing**: Upload and share images, documents, and audio files
- **Message Read Receipts**: Track message delivery and read status

### Technical Features
- **Modern UI**: Responsive design with Tailwind CSS
- **State Management**: Efficient state handling with Zustand
- **Security**: Helmet.js, CORS, JWT authentication
- **File Uploads**: Multer for handling file attachments
- **Error Handling**: Comprehensive error handling and validation
- **Production Ready**: Optimized for deployment

## 📁 Project Structure

```
chat-application/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions and API client
│   │   ├── services/        # Service modules (socket, etc.)
│   │   ├── store/           # Zustand state management
│   │   └── styles/          # Global styles
│   └── package.json
│
├── backend/                  # Node.js backend application
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── uploads/             # File upload directory
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── package.json             # Root package.json with scripts
├── README.md                # This file
└── render.yaml              # Deployment configuration
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time engine
- **JWT** - Authentication
- **Multer** - File uploads
- **Helmet** - Security headers

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd chat-application
```

2. **Install all dependencies**
```bash
npm run install:all
```

Or install separately:
```bash
npm run install:frontend
npm run install:backend
```

3. **Configure environment variables**

Create `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

4. **Start the application**

Development mode (both frontend and backend):
```bash
npm run dev
```

Or start separately:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5002

## 📦 Available Scripts

### Root Level
- `npm run install:all` - Install all dependencies
- `npm run dev` - Run both frontend and backend in development mode
- `npm run build` - Build frontend for production
- `npm start` - Start backend in production mode

### Frontend
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production

### Backend
- `npm run dev:backend` - Start backend with nodemon
- `npm run start:backend` - Start backend in production mode

## 🚢 Deployment

### Deploy to Render

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically detect `render.yaml`
4. Set environment variables in Render dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`

### MongoDB Atlas Setup

1. Create account at https://cloud.mongodb.com
2. Create a new cluster
3. Add IP whitelist: `0.0.0.0/0` (for Render)
4. Create database user
5. Get connection string and add to `.env`

## 🔒 Security

- JWT-based authentication
- HTTP-only cookies
- CORS configuration
- Helmet.js security headers
- Input validation
- Password hashing with bcrypt
- Environment variable protection

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
- `POST /api/chats` - Create/access chat
- `POST /api/chats/group` - Create group chat
- `PUT /api/chats/group/:id` - Update group

### Messages
- `GET /api/messages/:chatId` - Get messages
- `POST /api/messages` - Send message
- `POST /api/messages/upload` - Upload file
- `PUT /api/messages/:chatId/read` - Mark as read

## 🔌 Socket Events

### Client → Server
- `setup` - Initialize user connection
- `join_chat` - Join chat room
- `new_message` - Send message
- `typing` - User typing
- `stop_typing` - Stop typing

### Server → Client
- `user_connected` - User came online
- `user_disconnected` - User went offline
- `receive_message` - New message received
- `typing` - Someone is typing
- `stop_typing` - Stopped typing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Your Name

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Tailwind CSS for styling
- MongoDB for database
- React community for amazing tools
