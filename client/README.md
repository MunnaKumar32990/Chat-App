# Modern Chat Application Frontend

This is the frontend for our real-time chat application, built with modern web technologies and best practices.

## Features

- **Modern UI** with Tailwind CSS and custom design system
- **Real-time messaging** with socket.io
- **Authentication** with JWT tokens
- **Dark mode** support
- **Responsive design** for all devices
- **Optimized performance** with code splitting and lazy loading
- **Enhanced user experience** with modern transitions and animations

## Key Components

- **ModernHeader** - A clean, responsive header with user profile access and notification controls
- **ModernLayout** - A flexible layout system with support for sidebars and panels
- **ChatMessage** - Rich message component with support for text, images, files, and interactive elements
- **ChatInput** - Advanced input component with emoji picker, file attachments, and typing indicators

## Technology Stack

- React 18
- Tailwind CSS
- Socket.io for real-time communication
- React Router for navigation
- Zustand for state management
- Emoji Picker for emoji support
- React Hot Toast for notifications
- Date-fns for date formatting

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components for different routes
- `/src/context` - React context providers
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and API clients
- `/src/services` - Service modules for external APIs
- `/src/store` - State management (Zustand stores)
- `/src/assets` - Static assets like images and icons
