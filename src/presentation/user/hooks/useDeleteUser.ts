 
import { useCallback, useState } from 'react';

import { DeleteUser } from '@/core/user/application/usecases/DeleteUser.usecase';
import type { UserRepository } from '@/core/user/domain/User.repository';
import { container } from '@/infrastructure/di/container';

interface UseDeleteUserReturn {
  readonly deleteUser: (id: string) => Promise<void>;
  readonly isDeleting: boolean;
  readonly error: Error | null;
}

/**
 * Hook para eliminar un usuario
 * @returns Función para eliminar usuario, estado de eliminación y error
 */
export function useDeleteUser(): UseDeleteUserReturn {
  const [isDeleting, setIsDeleting]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(false);

  const [error, setError]: [Error | null, React.Dispatch<React.SetStateAction<Error | null>>] =
    useState<Error | null>(null);

  const deleteUser: (id: string) => Promise<void> = useCallback(async (id: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      const repository: UserRepository = container.getUserRepository();
      const useCase: DeleteUser = new DeleteUser(repository);
      await useCase.execute(id);
    } catch (err: unknown) {
      const errorObj: Error = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteUser, isDeleting, error };
}
