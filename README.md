# Real-Time Chat Application

A full-featured real-time chat application built with MERN stack (MongoDB, Express, React, Node.js) and Socket.io.

## Features

- **User Authentication**: Register, login, and logout functionality
- **User Availability**: See online/offline status of other users
- **One-to-One Chat**: Send and receive real-time messages with other users
- **Group Chat**: Create groups and chat with multiple users simultaneously
- **User Search**: Find users by name or username
- **Profile Management**: Update profile information and upload profile pictures
- **Real-Time Updates**: Receive instant message notifications and typing indicators

## Tech Stack

### Frontend
- React
- Vite
- TailwindCSS
- Socket.io-client
- Zustand (State Management)
- React Router

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Socket.io
- JWT Authentication
- Multer (File uploads)

## Getting Started

### Prerequisites

- Node.js (v14 or above)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/real-time-chat-app.git
cd real-time-chat-app
```

2. Install dependencies for both client and server
```
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables

Create a `.env` file in the server directory with the following variables:
```
PORT=5002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the application

#### Using the start script (Windows):
```
start.bat
```

#### Manually:
```
# Start the server (from server directory)
npm start

# Start the client (from client directory)
npm run dev
```

The server will run on http://localhost:5002 and the client on http://localhost:5173.

## Project Structure

```
.
├── client/                 # React client
│   ├── public/             # Static files
│   └── src/                # Client source code
│       ├── components/     # React components
│       ├── context/        # React context providers
│       ├── hooks/          # Custom hooks
│       ├── lib/            # Utility functions
│       ├── pages/          # Page components
│       ├── services/       # API service files
│       └── store/          # Zustand stores
│
├── server/                 # Express server
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── uploads/            # Uploaded files
│   └── utils/              # Utility functions
│
└── start.bat              # Script to start both client and server
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/logout` - Logout user

### User
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update user profile
- `GET /api/users/search` - Search for users
- `GET /api/users` - Get all users

### Chat
- `GET /api/chats` - Get all chats for current user
- `POST /api/chats` - Access or create a one-on-one chat
- `POST /api/chats/group` - Create a group chat
- `PUT /api/chats/group/:chatId` - Rename a group
- `PUT /api/chats/group/:chatId/add` - Add user to group
- `PUT /api/chats/group/:chatId/remove` - Remove user from group

### Messages
- `GET /api/messages/:chatId` - Get all messages for a chat
- `POST /api/messages` - Send a message
- `PUT /api/messages/:chatId/read` - Mark messages as read
- `DELETE /api/messages/:messageId` - Delete a message
- `POST /api/messages/upload` - Upload a file

## Socket.io Events

### Client Events (Emit)
- `setup` - Set up user socket connection
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `new_message` - Send a new message
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `user_online` - User comes online
- `user_offline` - User goes offline

### Server Events (Listen)
- `user_connected` - A user connected
- `user_disconnected` - A user disconnected
- `receive_message` - Receive a new message
- `typing` - Someone is typing
- `stop_typing` - Someone stopped typing
- `online_users` - Get all online users

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Socket.io](https://socket.io/) for real-time communication
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React Hot Toast](https://react-hot-toast.com/) for notifications 