# Quick Start Guide

Get your chat application up and running in minutes!

## 🚀 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas account)
- Git (optional)

## 📦 Installation

### 1. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all
```

Or install separately:
```bash
# Backend only
npm run install:backend

# Frontend only
npm run install:frontend
```

### 2. Configure Environment

```bash
# Navigate to backend
cd backend

# Copy environment template
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your_generated_secret_here
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Setup MongoDB

**Option A: Local MongoDB**
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Use connection string: `mongodb://localhost:27017/chat-app`

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://cloud.mongodb.com
2. Create a free cluster
3. Add IP whitelist: `0.0.0.0/0` (for development)
4. Create database user
5. Copy connection string to `.env`

## 🎯 Start Development

### Option 1: Use Startup Script (Windows)

```bash
# Double-click or run
start-dev.bat
```

This will open two terminal windows:
- Backend server on http://localhost:5002
- Frontend app on http://localhost:5173

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 3: Concurrent Start

```bash
# From root directory
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002
- **Health Check**: http://localhost:5002/api/health

## 👤 First Time Setup

1. Open http://localhost:5173
2. Click "Register" to create an account
3. Fill in your details:
   - Name
   - Username
   - Email
   - Password (min 6 characters)
4. Login with your credentials
5. Start chatting!

## 🧪 Test the Application

### Register Test Users

Create multiple accounts to test chat functionality:

**User 1:**
- Name: John Doe
- Username: john
- Email: john@example.com
- Password: password123

**User 2:**
- Name: Jane Smith
- Username: jane
- Email: jane@example.com
- Password: password123

### Test Features

1. **One-on-One Chat**
   - Search for a user
   - Click to start chatting
   - Send messages

2. **Group Chat**
   - Go to "Groups" page
   - Click "Create Group"
   - Add members
   - Start group conversation

3. **File Sharing**
   - Click attachment icon in chat
   - Upload image/document
   - Send to chat

4. **Online Status**
   - Open app in multiple browsers
   - See real-time online/offline status

5. **Typing Indicators**
   - Start typing in a chat
   - See typing indicator on other user's screen

## 🔧 Troubleshooting

### Backend won't start

**Error: Port already in use**
```bash
# Windows: Find and kill process on port 5002
netstat -ano | findstr :5002
taskkill /PID <process_id> /F
```

**Error: MongoDB connection failed**
- Check if MongoDB is running
- Verify connection string in `.env`
- Check network/firewall settings

### Frontend won't start

**Error: Port already in use**
```bash
# Vite will automatically try next available port
# Or manually specify port in vite.config.js
```

**Error: Cannot connect to backend**
- Ensure backend is running on port 5002
- Check proxy settings in `vite.config.js`
- Verify CORS settings in backend

### Authentication issues

**Can't login/register**
- Check browser console for errors
- Verify backend is running
- Check MongoDB connection
- Clear browser cache and cookies

## 📝 Common Commands

```bash
# Root directory
npm run install:all      # Install all dependencies
npm run dev             # Start both servers
npm run build           # Build frontend for production

# Backend
cd backend
npm run dev             # Start with nodemon
npm start               # Start production server

# Frontend
cd frontend
npm run dev             # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
```

## 🎨 Customize

### Change Ports

**Backend** (`backend/.env`):
```env
PORT=3000
```

**Frontend** (`frontend/vite.config.js`):
```javascript
server: {
  port: 3001
}
```

### Change Theme Colors

Edit `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color'
      }
    }
  }
}
```

## 🚢 Deploy to Production

See [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) for detailed deployment instructions.

Quick deploy to Render:
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy!

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- Check [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for architecture details
- Explore [backend/README.md](./backend/README.md) for API documentation
- Review [frontend/README.md](./frontend/README.md) for component details

## 🆘 Need Help?

- Check console logs for errors
- Review environment variables
- Verify MongoDB connection
- Ensure all dependencies are installed
- Check firewall/antivirus settings

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Backend running on port 5002
- [ ] Frontend running on port 5173
- [ ] Can register new user
- [ ] Can login
- [ ] Can send messages
- [ ] Real-time updates working

Happy chatting! 🎉
