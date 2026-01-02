/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/prefer-await-to-callbacks */
import { useCallback, useEffect, useState } from 'react';

import type { UserResponseDTO } from '@/core/user/application/dtos/UserResponse.dto';
import { GetUserById } from '@/core/user/application/usecases/GetUserById.usecase';
import type { UserRepository } from '@/core/user/domain/types/repository.types';
import { container } from '@/infrastructure/di/container';

interface UseUserReturn {
  readonly user: UserResponseDTO | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly refetch: () => Promise<void>;
}

/**
 * Hook para obtener un usuario por ID
 * @param userId - ID del usuario a obtener
 * @returns Estado del usuario, loading, error y función refetch
 */
export function useUser(userId: string): UseUserReturn {
  const [user, setUser]: [
    UserResponseDTO | null,
    React.Dispatch<React.SetStateAction<UserResponseDTO | null>>,
  ] = useState<UserResponseDTO | null>(null);

  const [isLoading, setIsLoading]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(true);

  const [error, setError]: [Error | null, React.Dispatch<React.SetStateAction<Error | null>>] =
    useState<Error | null>(null);

  const fetchUser: () => Promise<void> = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const repository: UserRepository = container.getUserRepository();
      const useCase: GetUserById = new GetUserById(repository);
      const foundUser: UserResponseDTO = await useCase.execute(userId);
      setUser(foundUser);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect((): (() => void) | undefined => {
    let cancelled = false;

    const loadUser = async (): Promise<void> => {
      if (cancelled) {
        return;
      }
      await fetchUser();
    };

    loadUser().catch((err: unknown): void => {
      if (!cancelled) {
        console.error('Error loading user:', err);
      }
    });

    return (): void => {
      cancelled = true;
    };
  }, [fetchUser]);

  return { user, isLoading, error, refetch: fetchUser };
}
