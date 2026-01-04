/**
 * useAuth Hook
 * Hook para consumir el AuthContext
 */

import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from '../context/AuthContext';

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
