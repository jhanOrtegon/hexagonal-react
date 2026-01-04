/**
 * AuthContext
 * Context para manejar el estado de autenticación global
 */

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import type { LoginResponseDTO } from '@/core/user/application/dtos/auth.dto';
import type { User } from '@/core/user/domain/User.entity';
import { container } from '@/infrastructure/di/container';
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
  isAuthenticated as checkIsAuthenticated,
} from '@/infrastructure/shared/storage/auth.storage';
import { userApiToDomain } from '@/infrastructure/user/mappers/UserApi.mapper';

export interface AuthContextValue {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly login: (email: string, password: string) => Promise<void>;
  readonly logout: () => void;
}

export const AuthContext: React.Context<AuthContextValue | undefined> = createContext<
  AuthContextValue | undefined
>(undefined);

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}: AuthProviderProps): React.JSX.Element => {
  const [user, setUser]: [User | null, React.Dispatch<React.SetStateAction<User | null>>] =
    useState<User | null>(null);
  const [isLoading, setIsLoading]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(true);

  // Verificar si hay un token guardado al montar
  useEffect((): void => {
    const initAuth: () => void = (): void => {
      const token: string | null = getAuthToken();
      if (token !== null) {
        // TODO: Aquí se podría validar el token con el backend
        // Por ahora solo verificamos que exista
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Escuchar evento de auth:unauthorized del axios interceptor
  useEffect((): (() => void) => {
    const handleUnauthorized: () => void = (): void => {
      setUser(null);
      clearAuthToken();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return (): void => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login: (email: string, password: string) => Promise<void> = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      try {
        const loginUseCase: ReturnType<typeof container.getLoginUserUseCase> =
          container.getLoginUserUseCase();
        const response: LoginResponseDTO = await loginUseCase.execute({ email, password });

        // Guardar token
        setAuthToken(response.token);

        // Convertir user del response a entidad de dominio
        const authenticatedUser: User = userApiToDomain({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        setUser(authenticatedUser);
      } catch (error: unknown) {
        clearAuthToken();
        setUser(null);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout: () => void = useCallback((): void => {
    clearAuthToken();
    setUser(null);
  }, []);

  const isAuthenticated: boolean = useMemo(
    (): boolean => checkIsAuthenticated() && user !== null,
    [user]
  );

  const value: AuthContextValue = useMemo(
    (): AuthContextValue => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [user, isAuthenticated, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
