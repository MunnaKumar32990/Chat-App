import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutLoader } from '../layout/Loader';

const ProtectRoute = () => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return <LayoutLoader />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectRoute;