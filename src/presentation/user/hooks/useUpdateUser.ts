 
import { useCallback, useState } from 'react';

import type { UpdateUserDTO } from '@/core/user/application/dtos/UpdateUser.dto';
import type { UserResponseDTO } from '@/core/user/application/dtos/UserResponse.dto';
import { UpdateUser } from '@/core/user/application/usecases/UpdateUser.usecase';
import type { UserRepository } from '@/core/user/domain/User.repository';
import { container } from '@/infrastructure/di/container';

interface UseUpdateUserReturn {
  readonly updateUser: (id: string, data: UpdateUserDTO) => Promise<UserResponseDTO>;
  readonly isUpdating: boolean;
  readonly error: Error | null;
}

/**
 * Hook para actualizar un usuario existente
 * @returns Función para actualizar usuario, estado de actualización y error
 */
export function useUpdateUser(): UseUpdateUserReturn {
  const [isUpdating, setIsUpdating]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(false);

  const [error, setError]: [Error | null, React.Dispatch<React.SetStateAction<Error | null>>] =
    useState<Error | null>(null);

  const updateUser: (id: string, data: UpdateUserDTO) => Promise<UserResponseDTO> = useCallback(
    async (id: string, data: UpdateUserDTO): Promise<UserResponseDTO> => {
      setIsUpdating(true);
      setError(null);

      try {
        const repository: UserRepository = container.getUserRepository();
        const useCase: UpdateUser = new UpdateUser(repository);
        const updatedUser: UserResponseDTO = await useCase.execute(id, data);
        return updatedUser;
      } catch (err: unknown) {
        const errorObj: Error = err instanceof Error ? err : new Error('Unknown error');
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return { updateUser, isUpdating, error };
}
