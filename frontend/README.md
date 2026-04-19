# Chat Application - Frontend

Modern, responsive React frontend for the real-time chat application.

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
│   ├── icons/          # App icons
│   └── manifest.json   # PWA manifest
├── src/
│   ├── components/     # Reusable React components
│   │   ├── auth/      # Authentication components
│   │   ├── chat/      # Chat-related components
│   │   ├── dialogs/   # Modal dialogs
│   │   ├── layout/    # Layout components
│   │   └── shared/    # Shared/common components
│   ├── pages/         # Page components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and API client
│   ├── services/      # Service modules (socket, etc.)
│   ├── store/         # Zustand state management
│   ├── constants/     # Constants and config
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Key Features

- **Real-time Updates** - Instant message delivery via WebSocket
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode Support** - Automatic theme detection
- **File Uploads** - Share images, documents, and audio
- **Typing Indicators** - See when others are typing
- **Online Status** - Real-time presence tracking
- **Group Chats** - Create and manage group conversations
- **Message Read Receipts** - Track message delivery status

## 🔌 API Integration

The frontend connects to the backend API at:
- Development: `http://localhost:5002/api`
- Production: Configured via environment variables

## 📝 Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5002
```

## 🏗️ Component Architecture

### State Management (Zustand)

- `authStore` - User authentication state
- `chatStore` - Chat and message state
- `socketStore` - WebSocket connection state

### Context Providers

- `AuthProvider` - Authentication context
- `SocketProvider` - Socket.IO connection management

### Custom Hooks

- `useInputValidation` - Form input validation
- `useMediaQuery` - Responsive design helper

## 🎯 Best Practices

- Component-based architecture
- Separation of concerns
- Reusable components
- Custom hooks for logic reuse
- Centralized state management
- Type-safe API calls
- Error boundary implementation
- Code splitting and lazy loading

## 📱 Progressive Web App (PWA)

The app includes PWA support with:
- Service worker for offline functionality
- App manifest for installation
- Optimized caching strategy

## 🤝 Contributing

1. Follow the existing code style
2. Use functional components with hooks
3. Keep components small and focused
4. Write meaningful commit messages
5. Test your changes thoroughly
