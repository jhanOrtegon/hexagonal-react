/**
 * ProtectedRoute Component
 * Wrapper para rutas que requieren autenticación
 */

import React from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
}: ProtectedRouteProps): React.JSX.Element => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
