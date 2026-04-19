# Project Structure

This document describes the clean, organized structure of the chat application.

## 📁 Root Directory

```
chat-application/
├── backend/              # Node.js + Express API
├── frontend/             # React application
├── .gitignore           # Git ignore rules
├── package.json         # Root package.json with scripts
├── README.md            # Main project documentation
├── PRODUCTION_GUIDE.md  # Production deployment guide
├── render.yaml          # Render deployment config
└── start-dev.bat        # Windows development startup script
```

## 🔧 Backend Structure

```
backend/
├── controllers/         # Business logic
│   ├── chatController.js       # Chat operations
│   ├── messageController.js    # Message operations
│   └── userController.js       # User operations
│
├── middleware/          # Custom middleware
│   └── auth.js                 # JWT authentication
│
├── models/             # Mongoose schemas
│   ├── Chat.js                # Chat model
│   ├── Message.js             # Message model
│   └── User.js                # User model
│
├── routes/             # API routes
│   ├── chatRoutes.js          # Chat endpoints
│   ├── messageRoutes.js       # Message endpoints
│   └── userRoutes.js          # User endpoints
│
├── uploads/            # File storage
│   ├── avatars/               # User avatars
│   ├── attachments/           # Message attachments
│   └── .gitkeep
│
├── utils/              # Utility functions
│   ├── errorHandler.js        # Error handling
│   └── tokenGenerator.js      # JWT token generation
│
├── .env                # Environment variables (not in git)
├── .env.example        # Environment template
├── index.js            # Main server file
├── package.json        # Backend dependencies
└── README.md           # Backend documentation
```

## 🎨 Frontend Structure

```
frontend/
├── public/             # Static assets
│   ├── icons/                 # App icons
│   ├── chat-icon.svg
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
│
├── src/
│   ├── components/     # React components
│   │   ├── auth/              # Authentication components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ProtectRoute.jsx
│   │   │
│   │   ├── chat/              # Chat components
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   └── ChatSidebar.jsx
│   │   │
│   │   ├── dialogs/           # Modal dialogs
│   │   │   ├── CreateGroupDialog.jsx
│   │   │   └── UserProfileDialog.jsx
│   │   │
│   │   ├── layout/            # Layout components
│   │   │   ├── ModernLayout.jsx
│   │   │   ├── ModernHeader.jsx
│   │   │   └── Loader.jsx
│   │   │
│   │   └── shared/            # Shared components
│   │       ├── Avatar.jsx
│   │       ├── ErrorBoundary.jsx
│   │       └── Loading.jsx
│   │
│   ├── pages/          # Page components
│   │   ├── Chat.jsx
│   │   ├── Groups.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   ├── Register.jsx
│   │   └── Users.jsx
│   │
│   ├── context/        # React context
│   │   ├── AuthProvider.jsx
│   │   └── SocketProvider.jsx
│   │
│   ├── hooks/          # Custom hooks
│   │   ├── useInputValidation.js
│   │   └── useMediaQuery.js
│   │
│   ├── lib/            # Utilities
│   │   └── api.js             # API client
│   │
│   ├── services/       # Services
│   │   └── socket.js          # Socket.IO client
│   │
│   ├── store/          # State management (Zustand)
│   │   ├── authStore.js
│   │   ├── chatStore.js
│   │   └── socketStore.js
│   │
│   ├── constants/      # Constants
│   │   ├── color.js
│   │   └── sampleData.js
│   │
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   ├── index.css       # Global styles
│   └── registerSW.js   # Service worker registration
│
├── eslint.config.js    # ESLint configuration
├── index.html          # HTML template
├── package.json        # Frontend dependencies
├── postcss.config.js   # PostCSS configuration
├── README.md           # Frontend documentation
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🚀 Key Features by Directory

### Backend

**Controllers**: Handle business logic and request/response
- Validation
- Database operations
- Response formatting

**Middleware**: Request processing
- Authentication
- Error handling
- Request logging

**Models**: Data structure and validation
- Schema definition
- Data validation
- Database methods

**Routes**: API endpoint definitions
- Route mapping
- Middleware application
- Request handling

**Utils**: Helper functions
- Token generation
- Error handling
- Common utilities

### Frontend

**Components**: Reusable UI elements
- Organized by feature
- Separation of concerns
- Prop validation

**Pages**: Route-level components
- Full page layouts
- Route handling
- Data fetching

**Context**: Global state providers
- Authentication state
- Socket connection
- Theme management

**Hooks**: Custom React hooks
- Reusable logic
- Side effects
- State management

**Store**: Zustand state management
- Global state
- Actions
- Selectors

**Services**: External integrations
- API calls
- WebSocket
- Third-party services

## 📝 File Naming Conventions

### Backend
- **Controllers**: `*Controller.js` (camelCase)
- **Models**: `*.js` (PascalCase)
- **Routes**: `*Routes.js` (camelCase)
- **Middleware**: `*.js` (camelCase)
- **Utils**: `*.js` (camelCase)

### Frontend
- **Components**: `*.jsx` (PascalCase)
- **Pages**: `*.jsx` (PascalCase)
- **Hooks**: `use*.js` (camelCase)
- **Utils**: `*.js` (camelCase)
- **Stores**: `*Store.js` (camelCase)

## 🔄 Data Flow

```
Frontend (React)
    ↓
API Client (Axios)
    ↓
Backend Routes
    ↓
Middleware (Auth)
    ↓
Controllers
    ↓
Models (Mongoose)
    ↓
MongoDB Database

WebSocket Flow:
Frontend (Socket.IO Client)
    ↔
Backend (Socket.IO Server)
    ↔
Connected Clients
```

## 🎯 Best Practices Implemented

1. **Separation of Concerns**: Clear separation between frontend and backend
2. **Modular Architecture**: Organized by feature and responsibility
3. **Scalability**: Easy to add new features and components
4. **Maintainability**: Clear structure and naming conventions
5. **Security**: Environment variables, authentication, validation
6. **Performance**: Optimized builds, code splitting, caching
7. **Documentation**: README files in each major directory

## 🚦 Getting Started

### Development
```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Or use the Windows script
start-dev.bat
```

### Production
```bash
# Build frontend
npm run build:frontend

# Start backend
npm run start:backend
```

## 📚 Additional Resources

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Production Guide](./PRODUCTION_GUIDE.md)
- [Main README](./README.md)
