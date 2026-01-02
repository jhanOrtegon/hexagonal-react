import { useCallback } from 'react';

import type { UserResponseDTO } from '@/core/user/application/dtos/UserResponse.dto';
import { GetUserById } from '@/core/user/application/usecases/GetUserById.usecase';
import type { UserRepository } from '@/core/user/domain/User.repository';
import { container } from '@/infrastructure/di/container';
import { useAsyncQuery } from '@/presentation/shared/hooks/useAsync';


interface UseUserReturn {
  readonly user: UserResponseDTO | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly refetch: () => Promise<void>;
}

/**
 * Hook mejorado para obtener un usuario por ID
 * Utiliza useAsyncQuery para reducir código boilerplate
 */
export function useUserRefactored(userId: string): UseUserReturn {
  const queryFn: () => Promise<UserResponseDTO> = useCallback(async (): Promise<UserResponseDTO> => {
    const repository: UserRepository = container.getUserRepository();
    const useCase: GetUserById = new GetUserById(repository);
    return await useCase.execute(userId);
  }, [userId]);

  const { data, isLoading, error, refetch }: {
    data: UserResponseDTO | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
  } = useAsyncQuery<UserResponseDTO>(queryFn, [userId]);

  return { user: data, isLoading, error, refetch };
}
