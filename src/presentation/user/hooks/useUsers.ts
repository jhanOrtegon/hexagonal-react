import { useCallback, useEffect, useState } from 'react';

import type { UserResponseDTO } from '@/core/user/application/dtos/UserResponse.dto';
import { GetAllUsers } from '@/core/user/application/usecases/GetAllUsers.usecase';
import type { UserRepository } from '@/core/user/domain/types/repository.types';
import type { UserFilters } from '@/core/user/domain/types/user.types';
import { container } from '@/infrastructure/di/container';

interface UseUsersReturn {
  readonly users: UserResponseDTO[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly refetch: () => Promise<void>;
}

/**
 * Hook para obtener todos los usuarios con filtros opcionales
 * @param filters - Filtros opcionales para buscar usuarios
 * @returns Lista de usuarios, loading, error y función refetch
 */
export function useUsers(filters?: UserFilters): UseUsersReturn {
  const [users, setUsers]: [
    UserResponseDTO[],
    React.Dispatch<React.SetStateAction<UserResponseDTO[]>>,
  ] = useState<UserResponseDTO[]>([]);

  const [isLoading, setIsLoading]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(true);

  const [error, setError]: [Error | null, React.Dispatch<React.SetStateAction<Error | null>>] =
    useState<Error | null>(null);

  const fetchUsers: () => Promise<void> = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const repository: UserRepository = container.getUserRepository();
      const useCase: GetAllUsers = new GetAllUsers(repository);
      const foundUsers: UserResponseDTO[] = await useCase.execute(filters);
      setUsers(foundUsers);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect((): (() => void) => {
    const cancelledRef: { current: boolean } = { current: false };

    const loadUsers: () => Promise<void> = async (): Promise<void> => {
      if (!cancelledRef.current) {
        await fetchUsers();
      }
    };

    // eslint-disable-next-line promise/prefer-await-to-then -- useEffect requires promise chain
    loadUsers().catch((): void => {
      // Error already handled in fetchUsers
    });

    return (): void => {
      cancelledRef.current = true;
    };
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}
