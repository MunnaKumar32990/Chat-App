import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Loading from "./components/shared/Loading";
import ErrorBoundary from "./components/shared/ErrorBoundary";

// Layouts
import ModernLayout from "./components/layout/ModernLayout";
import { LayoutLoader } from "./components/layout/Loader";

// Auth Components
import ProtectRoute from "./components/auth/ProtectRoute";
import PrivateRoute from './components/PrivateRoute';

// Pages with code splitting
const Home = lazy(() => import("./pages/Home"));
const Chat = lazy(() => import("./pages/Chat"));
const Groups = lazy(() => import("./pages/Groups"));
const Users = lazy(() => import("./pages/Users"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ApiTest = lazy(() => import("./pages/ApiTest"));

const App = () => {
  const { isAuthenticated, loading, initializeAuth } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (loading) return <LayoutLoader />;

  return (
    <ErrorBoundary>
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
          },
          success: {
            iconTheme: {
              primary: '#25D366',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      
      <Suspense fallback={<LayoutLoader />}>
        <Routes>
          {/* Protected Routes with Modern Layout */}
          <Route element={<ProtectRoute />}>
            <Route element={<ModernLayout />}>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/users" element={<Users />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* Full-width chat layout */}
            <Route 
              path="/chat" 
              element={
                <PrivateRoute>
                  <ModernLayout fullWidth={true} />
                </PrivateRoute>
              }
            >
              <Route index element={<Chat />} />
              <Route path=":chatId" element={<Chat />} />
            </Route>
          </Route>

          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/chat" /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/chat" /> : <Register />
          } />
          <Route path="/api-test" element={<ApiTest />} />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;