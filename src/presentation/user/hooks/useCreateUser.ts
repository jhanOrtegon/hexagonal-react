 
import { useCallback, useState } from 'react';

import type { CreateUserDTO } from '@/core/user/application/dtos/CreateUser.dto';
import type { UserResponseDTO } from '@/core/user/application/dtos/UserResponse.dto';
import { CreateUser } from '@/core/user/application/usecases/CreateUser.usecase';
import type { UserRepository } from '@/core/user/domain/User.repository';
import { container } from '@/infrastructure/di/container';

interface UseCreateUserReturn {
  readonly createUser: (data: CreateUserDTO) => Promise<UserResponseDTO>;
  readonly isCreating: boolean;
  readonly error: Error | null;
}

/**
 * Hook para crear un nuevo usuario
 * @returns Función para crear usuario, estado de creación y error
 */
export function useCreateUser(): UseCreateUserReturn {
  const [isCreating, setIsCreating]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(false);

  const [error, setError]: [Error | null, React.Dispatch<React.SetStateAction<Error | null>>] =
    useState<Error | null>(null);

  const createUser: (data: CreateUserDTO) => Promise<UserResponseDTO> = useCallback(
    async (data: CreateUserDTO): Promise<UserResponseDTO> => {
      setIsCreating(true);
      setError(null);

      try {
        const repository: UserRepository = container.getUserRepository();
        const useCase: CreateUser = new CreateUser(repository);
        const newUser: UserResponseDTO = await useCase.execute(data);
        return newUser;
      } catch (err: unknown) {
        const errorObj: Error = err instanceof Error ? err : new Error('Unknown error');
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return { createUser, isCreating, error };
}
